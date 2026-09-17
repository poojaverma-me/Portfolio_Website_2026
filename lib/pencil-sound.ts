/**
 * Synthesised pencil-on-paper scratch, built with the Web Audio API so no
 * audio file is needed. Shaped noise: a mid band for the graphite scratch,
 * a high band for paper grain, with irregular pressure changes over time.
 */
export type PencilSound = {
  /** Resolves true when audio is allowed to play (browsers need a user gesture). */
  unlock: () => Promise<boolean>;
  /** Scratch for `seconds`, starting now. */
  play: (seconds: number) => void;
  stop: () => void;
  close: () => void;
};

export function createPencilSound(): PencilSound | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;

  let ctx: AudioContext;
  try {
    ctx = new AudioContext();
  } catch {
    return null;
  }

  // two seconds of white noise, looped
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  // read through a function so TypeScript doesn't narrow state across awaits
  const running = () => ctx.state === "running";

  let active: { sources: AudioBufferSourceNode[]; gains: GainNode[] } | null = null;

  const stop = () => {
    if (!active) return;
    const now = ctx.currentTime;
    for (const g of active.gains) {
      g.gain.cancelScheduledValues(now);
      g.gain.setTargetAtTime(0, now, 0.03);
    }
    for (const s of active.sources) s.stop(now + 0.2);
    active = null;
  };

  return {
    async unlock() {
      if (running()) return true;
      try {
        // resume() can hang without a gesture, so don't wait on it for long
        await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 200))]);
      } catch {
        // blocked by autoplay policy
      }
      return running();
    },

    play(seconds) {
      if (!running()) return;
      stop();

      const t0 = ctx.currentTime + 0.02;
      const end = t0 + seconds;

      const master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);

      // graphite scratch: mid band that wanders as the stroke changes direction
      const scratch = ctx.createBufferSource();
      scratch.buffer = noise;
      scratch.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1100;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 0.8;
      band.frequency.value = 3200;
      const pressure = ctx.createGain();
      pressure.gain.value = 0;
      scratch.connect(hp).connect(band).connect(pressure).connect(master);

      // paper grain: quiet, bright texture riding under the scratch
      const grain = ctx.createBufferSource();
      grain.buffer = noise;
      grain.loop = true;
      grain.loopStart = 0.7;
      const grainBand = ctx.createBiquadFilter();
      grainBand.type = "bandpass";
      grainBand.Q.value = 1.4;
      grainBand.frequency.value = 7200;
      const grainGain = ctx.createGain();
      grainGain.gain.value = 0;
      grain.connect(grainBand).connect(grainGain).connect(master);

      // irregular pressure: short segments, the odd near-lift of the pencil
      let t = t0;
      while (t < end) {
        const seg = 0.035 + Math.random() * 0.05;
        const lift = Math.random() < 0.07;
        const level = lift ? 0.06 : 0.35 + Math.random() * 0.65;
        pressure.gain.setTargetAtTime(level, t, 0.012);
        grainGain.gain.setTargetAtTime(level * 0.35, t, 0.02);
        band.frequency.setTargetAtTime(2500 + Math.random() * 1900, t, 0.03);
        t += seg;
      }
      // pencil leaves the paper
      pressure.gain.setTargetAtTime(0, end, 0.04);
      grainGain.gain.setTargetAtTime(0, end, 0.04);

      scratch.start(t0, Math.random() * 1.5);
      grain.start(t0, Math.random() * 1.5);
      scratch.stop(end + 0.4);
      grain.stop(end + 0.4);

      active = { sources: [scratch, grain], gains: [pressure, grainGain] };
    },

    stop,

    close() {
      stop();
      ctx.close().catch(() => {});
    },
  };
}
