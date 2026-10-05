// Synthesized order-alert chime (Web Audio API — no audio files, no network).
// A soft three-note ascending bell (E5 → G#5 → B5) with a gentle decay: clearly
// audible in a noisy bar without being shrill.

const NOTES = [
  { freq: 659.25, at: 0, decay: 0.7 }, // E5
  { freq: 830.61, at: 0.15, decay: 0.7 }, // G#5
  { freq: 987.77, at: 0.3, decay: 1.3 }, // B5 — rings out longest
];

// Sine partials give a bell-like tone that cuts through noise but stays round.
const PARTIALS: [multiple: number, level: number][] = [
  [1, 1],
  [2, 0.22],
  [3, 0.06],
];

const NOTE_PEAK = 0.45;

type AudioContextCtor = typeof AudioContext;

export class AlertSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voice: GainNode | null = null;
  private volume: number;
  private readonly onRunningChange: (running: boolean) => void;

  constructor(volume: number, onRunningChange: (running: boolean) => void) {
    this.volume = volume;
    this.onRunningChange = onRunningChange;
  }

  /** Creates/resumes the audio context. Must be called from a user gesture the first time. */
  unlock(): boolean {
    try {
      if (!this.ctx) {
        const Ctor: AudioContextCtor | undefined =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
        if (!Ctor) return false;
        const ctx = new Ctor();
        // Compressor keeps the chime loud at high volume without clipping.
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -12;
        compressor.knee.value = 6;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        const master = ctx.createGain();
        master.gain.value = this.volume;
        master.connect(compressor).connect(ctx.destination);
        ctx.onstatechange = () => this.onRunningChange(ctx.state === 'running');
        this.ctx = ctx;
        this.master = master;
      }
      const ctx = this.ctx;
      // A context created inside a gesture is often already running and fires no statechange.
      this.onRunningChange(ctx.state === 'running');
      if (ctx.state === 'suspended') {
        void ctx.resume().then(() => this.onRunningChange(ctx.state === 'running')).catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  get running() {
    return this.ctx?.state === 'running';
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.02);
  }

  /** Plays one chime. Any chime still sounding is faded out first, so chimes never stack. */
  play() {
    const { ctx, master } = this;
    if (!ctx || !master || ctx.state === 'closed') return;
    this.stop();

    const voice = ctx.createGain();
    voice.connect(master);
    this.voice = voice;

    const t0 = ctx.currentTime + 0.02;
    for (const { freq, at, decay } of NOTES) {
      const start = t0 + at;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(NOTE_PEAK, start + 0.008);
      env.gain.exponentialRampToValueAtTime(0.001, start + decay);
      env.connect(voice);
      for (const [multiple, level] of PARTIALS) {
        const osc = ctx.createOscillator();
        const partialGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * multiple;
        partialGain.gain.value = level;
        osc.connect(partialGain).connect(env);
        osc.start(start);
        osc.stop(start + decay + 0.05);
      }
    }
  }

  /** Silences the current chime immediately (short fade to avoid a click). */
  stop() {
    const { ctx, voice } = this;
    if (!ctx || !voice) return;
    this.voice = null;
    const t = ctx.currentTime;
    voice.gain.cancelScheduledValues(t);
    voice.gain.setValueAtTime(voice.gain.value, t);
    voice.gain.linearRampToValueAtTime(0, t + 0.05);
    setTimeout(() => voice.disconnect(), 100);
  }

  close() {
    this.stop();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    void ctx?.close().catch(() => {});
  }
}
