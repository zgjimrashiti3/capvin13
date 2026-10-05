import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { acknowledgeOrder, getOrderAlerts, isAlertOrder, updateOrderStatus } from '../api/orders';
import type { Order } from '../types';
import { AlertSound } from '../utils/alertSound';

export type AlertConnection = 'connecting' | 'live' | 'offline';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const POLL_LIVE_MS = 30000; // safety net while the live stream is up
const POLL_OFFLINE_MS = 5000; // fallback while the live stream is down
const STALE_STREAM_MS = 60000; // server pings every 25s; silence this long means a dead stream
const MAX_RETRY_MS = 15000;
const MUTE_KEY = 'orderAlertsMuted';
const VOLUME_KEY = 'orderAlertsVolume';
const DEFAULT_VOLUME = 0.8;

// Alert sound cadence — tune these to change how often the chime repeats.
const CHIME_INTERVAL_MS = 10000; // while there are unacknowledged orders
const CHIME_ESCALATED_INTERVAL_MS = 5000; // once the oldest one has waited too long
const CHIME_ESCALATE_AFTER_MS = 60000;
const CHIME_MIN_GAP_MS = 2000; // orders arriving together still produce a single chime

interface OrderAlertsContextValue {
  alerts: Order[]; // oldest first
  connection: AlertConnection;
  muted: boolean;
  audioUnlocked: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  enableSound: () => void;
  testSound: () => void;
  toggleMute: () => void;
  acknowledge: (id: string) => void;
  accept: (id: string) => void;
  acknowledgeAll: () => void;
  applyOrder: (order: Order) => void;
}

const OrderAlertsContext = createContext<OrderAlertsContextValue | null>(null);

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function readVolume() {
  try {
    const v = Number(localStorage.getItem(VOLUME_KEY));
    return localStorage.getItem(VOLUME_KEY) !== null && v >= 0 && v <= 1 ? v : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable — keep in-memory value
  }
}

export function OrderAlertsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [alertMap, setAlertMap] = useState<Map<string, Order>>(() => new Map());
  const [connection, setConnection] = useState<AlertConnection>('connecting');
  const [muted, setMuted] = useState(readMuted);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [volume, setVolumeState] = useState(readVolume);
  const soundRef = useRef<AlertSound | null>(null);

  // Orders changed by live events (or local actions), with when. A poll response that was
  // in flight at that moment is older than the event, so the event wins when merging.
  const liveChangesRef = useRef(new Map<string, { at: number; order: Order }>());

  const invalidateOrderQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orders-pending-count'] });
  }, [queryClient]);

  const applyOrder = useCallback((order: Order) => {
    liveChangesRef.current.set(order.id, { at: Date.now(), order });
    setAlertMap((prev) => {
      const next = new Map(prev);
      if (isAlertOrder(order)) next.set(order.id, order);
      else next.delete(order.id);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    const startedAt = Date.now();
    try {
      const list = await getOrderAlerts();
      setAlertMap(() => {
        const next = new Map(list.map((o) => [o.id, o]));
        for (const [id, change] of liveChangesRef.current) {
          if (change.at < startedAt - 60000) {
            liveChangesRef.current.delete(id);
          } else if (change.at >= startedAt) {
            if (isAlertOrder(change.order)) next.set(id, change.order);
            else next.delete(id);
          }
        }
        return next;
      });
    } catch {
      // 401 is handled by the api client (logout + redirect); network errors retry on the next poll.
    }
  }, []);

  // ── Live stream (SSE over fetch so the JWT travels in the Authorization header) ──
  const reconnectNowRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!token) return;
    let stopped = false;
    let attempt = 0;
    let retryTimer: number | undefined;
    let controller: AbortController | null = null;

    const handleEvent = (raw: string) => {
      let type = 'message';
      const data: string[] = [];
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) type = line.slice(6).trim();
        else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
      }
      if (type === 'ready') {
        attempt = 0;
        setConnection('live');
        void refresh(); // catch anything placed while we were disconnected
      } else if (type === 'order.created' || type === 'order.updated') {
        try {
          applyOrder(JSON.parse(data.join('\n')) as Order);
          invalidateOrderQueries();
        } catch {
          // ignore malformed event
        }
      }
    };

    const connect = async () => {
      clearTimeout(retryTimer);
      controller?.abort();
      const ctrl = new AbortController();
      controller = ctrl;
      let watchdog: number | undefined;
      const resetWatchdog = () => {
        clearTimeout(watchdog);
        watchdog = window.setTimeout(() => ctrl.abort(), STALE_STREAM_MS);
      };

      try {
        resetWatchdog();
        const res = await fetch(`${API_BASE}/orders/stream`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
          cache: 'no-store',
          signal: ctrl.signal,
        });
        if (res.status === 401) {
          stopped = true;
          void refresh(); // lets the api client interceptor log out and redirect
          return;
        }
        if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          resetWatchdog();
          buffer += value.replace(/\r\n/g, '\n');
          let sep;
          while ((sep = buffer.indexOf('\n\n')) !== -1) {
            handleEvent(buffer.slice(0, sep));
            buffer = buffer.slice(sep + 2);
          }
        }
      } catch {
        // aborted, network error, or server down — fall through to reconnect
      } finally {
        clearTimeout(watchdog);
      }

      if (stopped || ctrl !== controller) return;
      setConnection('offline');
      const delay = Math.min(1000 * 2 ** attempt, MAX_RETRY_MS);
      attempt++;
      retryTimer = window.setTimeout(connect, delay);
    };

    reconnectNowRef.current = () => {
      if (stopped) return;
      attempt = 0;
      void connect();
    };

    void connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      controller?.abort();
      reconnectNowRef.current = () => {};
    };
  }, [token, refresh, applyOrder, invalidateOrderQueries]);

  // ── Polling fallback (fast while offline, slow safety net while live) ──
  useEffect(() => {
    void refresh();
    const id = setInterval(refresh, connection === 'live' ? POLL_LIVE_MS : POLL_OFFLINE_MS);
    return () => clearInterval(id);
  }, [connection, refresh]);

  // Tablets sleep and drop connections: resync as soon as the screen or network comes back.
  useEffect(() => {
    const wake = () => {
      if (document.visibilityState !== 'visible') return;
      void refresh();
      if (connection !== 'live') reconnectNowRef.current();
    };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
    };
  }, [connection, refresh]);

  // ── Sound ──
  const unlockAudio = useCallback(() => {
    soundRef.current ??= new AlertSound(volume, setAudioUnlocked);
    return soundRef.current.unlock() ? soundRef.current : null;
  }, [volume]);

  // Browsers only allow audio after a user gesture: any tap in the admin panel unlocks it.
  useEffect(() => {
    const onGesture = () => {
      if (!soundRef.current?.running) unlockAudio();
    };
    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    return () => {
      document.removeEventListener('pointerdown', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
    };
  }, [unlockAudio]);

  // Leaving the admin panel (logout, navigation) silences and releases the audio immediately.
  useEffect(
    () => () => {
      soundRef.current?.close();
      soundRef.current = null;
    },
    [],
  );

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    soundRef.current?.setVolume(value);
    store(VOLUME_KEY, String(value));
  }, []);

  const persistMuted = (value: boolean) => {
    setMuted(value);
    store(MUTE_KEY, value ? '1' : '0');
  };

  // Every chime goes through here so the repeat cycle counts manual plays too (no double chimes).
  const lastChimeAtRef = useRef(0);
  const playChime = useCallback(() => {
    soundRef.current?.play();
    lastChimeAtRef.current = Date.now();
  }, []);

  // Plays regardless of mute, so the admin can check the volume.
  const testSound = useCallback(() => {
    if (unlockAudio()) playChime();
  }, [unlockAudio, playChime]);

  const enableSound = useCallback(() => {
    persistMuted(false);
    if (unlockAudio()) playChime(); // confirmation that sound works
  }, [unlockAudio, playChime]);

  const toggleMute = useCallback(() => {
    if (muted) enableSound();
    else persistMuted(true);
  }, [muted, enableSound]);

  const alerts = useMemo(
    () => [...alertMap.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [alertMap],
  );
  const hasAlerts = alerts.length > 0;
  const alertsRef = useRef(alerts);
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  // One chime per cycle: immediately on a new order, then every CHIME_INTERVAL_MS
  // (CHIME_ESCALATED_INTERVAL_MS once the oldest order has waited CHIME_ESCALATE_AFTER_MS).
  const ringNowRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!hasAlerts || muted || !audioUnlocked) return;
    let timer: number | undefined;

    const currentInterval = () => {
      const oldest = alertsRef.current[0];
      const waited = oldest ? Date.now() - new Date(oldest.createdAt).getTime() : 0;
      return waited > CHIME_ESCALATE_AFTER_MS ? CHIME_ESCALATED_INTERVAL_MS : CHIME_INTERVAL_MS;
    };

    const tick = () => {
      clearTimeout(timer);
      if (Date.now() - lastChimeAtRef.current >= CHIME_MIN_GAP_MS) {
        playChime();
        try {
          navigator.vibrate?.([200, 100, 200]);
        } catch {
          // vibration unsupported
        }
      }
      const sinceLast = Date.now() - lastChimeAtRef.current;
      timer = window.setTimeout(tick, Math.max(CHIME_MIN_GAP_MS, currentInterval() - sinceLast));
    };

    ringNowRef.current = tick;
    tick();
    return () => {
      clearTimeout(timer);
      ringNowRef.current = () => {};
    };
  }, [hasAlerts, muted, audioUnlocked, playChime]);

  // A newly arrived order rings right away (restarting the cycle); acknowledgements never do.
  const knownAlertIdsRef = useRef(new Set<string>());
  useEffect(() => {
    const ids = new Set(alerts.map((o) => o.id));
    const arrived = [...ids].some((id) => !knownAlertIdsRef.current.has(id));
    knownAlertIdsRef.current = ids;
    if (arrived) ringNowRef.current();
  }, [alerts]);

  // Acknowledging the last order (or muting) cuts off a chime that is still sounding.
  useEffect(() => {
    if (!hasAlerts || muted) soundRef.current?.stop();
  }, [hasAlerts, muted]);

  // ── Actions (optimistic: the alert and sound stop immediately) ──
  const removeLocally = useCallback((ids: string[]) => {
    setAlertMap((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const runAction = useCallback(
    async (ids: string[], action: (id: string) => Promise<Order>) => {
      removeLocally(ids);
      const results = await Promise.allSettled(ids.map(action));
      results.forEach((r) => r.status === 'fulfilled' && applyOrder(r.value));
      if (results.some((r) => r.status === 'rejected')) {
        showToast('Gabim gjatë përditësimit të porosisë.', 'error');
        void refresh();
      }
      invalidateOrderQueries();
    },
    [removeLocally, applyOrder, showToast, refresh, invalidateOrderQueries],
  );

  const acknowledge = useCallback((id: string) => void runAction([id], acknowledgeOrder), [runAction]);
  const accept = useCallback(
    (id: string) => void runAction([id], (orderId) => updateOrderStatus(orderId, 'CONFIRMED')),
    [runAction],
  );
  const acknowledgeAll = useCallback(
    () => void runAction([...alertMap.keys()], acknowledgeOrder),
    [runAction, alertMap],
  );

  return (
    <OrderAlertsContext.Provider
      value={{
        alerts,
        connection,
        muted,
        audioUnlocked,
        volume,
        setVolume,
        enableSound,
        testSound,
        toggleMute,
        acknowledge,
        accept,
        acknowledgeAll,
        applyOrder,
      }}
    >
      {children}
    </OrderAlertsContext.Provider>
  );
}

export function useOrderAlerts() {
  const ctx = useContext(OrderAlertsContext);
  if (!ctx) throw new Error('useOrderAlerts must be used within OrderAlertsProvider');
  return ctx;
}
