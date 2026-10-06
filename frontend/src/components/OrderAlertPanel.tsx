import { useEffect, useState } from 'react';
import { useOrderAlerts } from '../context/OrderAlertsContext';
import type { AlertConnection } from '../context/OrderAlertsContext';
import type { Order } from '../types';
import { nameWithSize } from '../utils/sizes';

function shortId(id: string) {
  return id.slice(0, 6).toUpperCase();
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
}

function minutesAgo(dateStr: string, now: number) {
  const mins = Math.max(0, Math.floor((now - new Date(dateStr).getTime()) / 60000));
  return mins === 0 ? 'tani' : `para ${mins} min`;
}

function alertCountLabel(n: number) {
  return n === 1 ? '1 porosi e re' : `${n} porosi të reja`;
}

const CONNECTION_LABELS: Record<AlertConnection, { label: string; color: string }> = {
  live: { label: 'Live', color: '#22c55e' },
  connecting: { label: 'Duke u lidhur…', color: '#f59e0b' },
  offline: { label: 'Rilidhje… (kontroll çdo 5s)', color: '#f59e0b' },
};

/** Connection status + sound controls, for the sidebar (full) and mobile header (compact). */
export function OrderAlertControls({ compact = false }: { compact?: boolean }) {
  const { connection, muted, audioUnlocked, toggleMute, volume, setVolume, testSound } = useOrderAlerts();
  const conn = CONNECTION_LABELS[connection];
  const soundOn = !muted && audioUnlocked;

  const statusRow = (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs text-white/80" title={conn.label}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: conn.color }} />
        {!compact && conn.label}
      </span>
      <button
        onClick={toggleMute}
        className="ml-auto px-2 py-1 rounded-md text-xs font-medium text-white transition-colors hover:bg-white/20"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        aria-label={muted ? 'Ndiz zërin e alarmeve' : 'Hesht alarmet'}
      >
        {soundOn ? '🔔' : '🔕'}
        {!compact && <span className="ml-1">{muted ? 'Ndiz zërin' : 'Hesht'}</span>}
      </button>
    </div>
  );

  if (compact) return statusRow;

  return (
    <div className="space-y-2">
      {statusRow}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70" aria-hidden>🔉</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 min-w-0 h-1.5 accent-white cursor-pointer"
          aria-label="Volumi i alarmit"
        />
        <button
          onClick={testSound}
          className="px-2 py-1 rounded-md text-xs font-medium text-white transition-colors hover:bg-white/20 flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          Testo zërin
        </button>
      </div>
    </div>
  );
}

function AlertOrderCard({ order, now, highlight }: { order: Order; now: number; highlight: boolean }) {
  const { acknowledge, accept } = useOrderAlerts();

  return (
    <div
      className="rounded-xl border-2 p-4 sm:p-5"
      style={{
        borderColor: highlight ? '#CE2B37' : '#f1d5d7',
        backgroundColor: highlight ? 'rgba(206,43,55,0.04)' : '#fff',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
            Tavolina {order.tableNumber}
          </p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">#{shortId(order.id)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[#1a1a1a]">{formatTime(order.createdAt)}</p>
          <p className="text-xs font-medium" style={{ color: '#CE2B37' }}>{minutesAgo(order.createdAt, now)}</p>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {order.items.map((item) => (
          <li key={item.id} className="text-base">
            <span className="font-bold text-[#1a1a1a]">{item.quantity}×</span>{' '}
            <span className="text-[#1a1a1a]">{nameWithSize(item.menuItem?.name ?? 'Artikull i fshirë', item.size, item.sizeLabel)}</span>
            {item.notes && (
              <p className="ml-6 mt-0.5 text-sm italic px-2 py-1 rounded-md inline-block" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                📝 {item.notes}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
        <p className="text-lg font-bold mr-auto" style={{ color: '#CE2B37' }}>€{Number(order.totalPrice).toFixed(2)}</p>
        <button
          onClick={() => acknowledge(order.id)}
          className="px-5 py-3 rounded-xl text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          E pashë
        </button>
        <button
          onClick={() => accept(order.id)}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#006B3C' }}
        >
          ✓ Prano
        </button>
      </div>
    </div>
  );
}

export default function OrderAlertPanel({ onShowOrders }: { onShowOrders: () => void }) {
  const { alerts, muted, audioUnlocked, enableSound, toggleMute, acknowledgeAll } = useOrderAlerts();
  // Minimizing hides the current alerts only; a newer order re-opens the panel.
  const [minimizedUpTo, setMinimizedUpTo] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const newest = alerts.at(-1)?.createdAt;
  const minimized = !!newest && !!minimizedUpTo && newest <= minimizedUpTo;

  const soundPrompt = !audioUnlocked && !muted && (
    <button
      onClick={enableSound}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[95] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl text-white text-sm font-semibold animate-pulse"
      style={{ backgroundColor: '#CE2B37' }}
    >
      🔈 Prek këtu për të aktivizuar zërin e porosive
    </button>
  );

  if (alerts.length === 0) return soundPrompt || null;

  if (minimized) {
    return (
      <>
        <button
          onClick={() => setMinimizedUpTo(null)}
          className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold shadow-lg animate-pulse"
          style={{ backgroundColor: '#CE2B37' }}
        >
          🔔 {alertCountLabel(alerts.length)} — Shiko
        </button>
        {soundPrompt}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-start justify-center p-3 sm:p-6 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-fade-slide-in" role="alertdialog" aria-live="assertive">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-4 rounded-t-2xl text-white" style={{ backgroundColor: '#CE2B37' }}>
            <span className="text-2xl animate-bounce">🔔</span>
            <h2 className="flex-1 text-xl sm:text-2xl font-bold" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
              {alerts.length === 1 ? 'Porosi e re!' : `${alerts.length} porosi të reja!`}
            </h2>
            <button
              onClick={toggleMute}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              aria-label={muted ? 'Ndiz zërin' : 'Hesht'}
            >
              {muted ? '🔕' : '🔔'}
            </button>
            <button
              onClick={() => setMinimizedUpTo(newest ?? null)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              aria-label="Minimizo"
            >
              ▁
            </button>
          </div>

          <div className="p-3 sm:p-5 space-y-3 max-h-[70vh] overflow-y-auto">
            {alerts.map((order, i) => (
              <AlertOrderCard key={order.id} order={order} now={now} highlight={i === 0} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-gray-100">
            <button
              onClick={() => {
                setMinimizedUpTo(newest ?? null);
                onShowOrders();
              }}
              className="text-sm font-medium hover:underline"
              style={{ color: '#006B3C' }}
            >
              Shiko të gjitha porositë →
            </button>
            {alerts.length > 1 && (
              <button
                onClick={acknowledgeAll}
                className="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                E pashë të gjitha
              </button>
            )}
          </div>
        </div>
      </div>
      {soundPrompt}
    </>
  );
}
