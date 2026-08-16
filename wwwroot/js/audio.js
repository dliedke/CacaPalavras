/* =============================================================================
 * Motor de Som — sintetizado com a Web Audio API (sem arquivos externos).
 * Efeitos alegres para seleção, acerto, erro, dica, vitória e clique.
 * ========================================================================== */

const SoundFX = (function () {
  let ctx = null;
  let muted = false;
  let master = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* Toca uma nota simples. */
  function tone(freq, start, dur, type = "sine", vol = 0.3) {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /* Nota com deslize de frequência (efeito "whoosh"/"boop"). */
  function slide(f1, f2, start, dur, type = "sine", vol = 0.3) {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(start, dur, vol = 0.25) {
    const t0 = ctx.currentTime + start;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = vol;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 800;
    src.connect(filter).connect(g).connect(master);
    src.start(t0);
  }

  const api = {
    unlock() { ensure(); },
    setMuted(v) { muted = v; if (master) master.gain.value = v ? 0 : 0.5; },
    isMuted() { return muted; },

    /* Pequeno "tic" a cada célula percorrida na seleção. */
    tick() {
      if (muted) return; ensure();
      tone(520, 0, 0.05, "square", 0.08);
    },

    click() {
      if (muted) return; ensure();
      tone(330, 0, 0.06, "triangle", 0.2);
      tone(660, 0.03, 0.06, "triangle", 0.15);
    },

    /* Acerto: arpejo alegre ascendente. A altura sobe conforme a sequência. */
    found(streak = 0) {
      if (muted) return; ensure();
      const base = 1 + Math.min(streak, 6) * 0.06;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => tone(n * base, i * 0.07, 0.22, "triangle", 0.3));
    },

    error() {
      if (muted) return; ensure();
      slide(220, 120, 0, 0.25, "sawtooth", 0.2);
    },

    hint() {
      if (muted) return; ensure();
      slide(660, 1320, 0, 0.3, "sine", 0.25);
    },

    /* Vitória: fanfarra + brilho. */
    win() {
      if (muted) return; ensure();
      const seq = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      seq.forEach((n, i) => {
        tone(n, i * 0.12, 0.3, "triangle", 0.3);
        tone(n * 2, i * 0.12, 0.3, "sine", 0.12);
      });
      // acorde final
      [1046.5, 1318.5, 1567.98].forEach((n) => tone(n, 0.6, 0.6, "triangle", 0.25));
      noiseBurst(0.6, 0.4, 0.12);
    },

    start() {
      if (muted) return; ensure();
      slide(300, 700, 0, 0.2, "sine", 0.25);
      tone(880, 0.18, 0.15, "triangle", 0.2);
    },

    /* Palavra secreta encontrada: brilho mágico curto e reluzente. */
    bonus() {
      if (muted) return; ensure();
      const notes = [880, 1174.66, 1567.98, 2093];
      notes.forEach((n, i) => tone(n, i * 0.05, 0.18, "sine", 0.22));
      noiseBurst(0, 0.12, 0.06);
    },

    /* Novo recorde na tela de vitória: fanfarra extra, mais aguda. */
    recorde() {
      if (muted) return; ensure();
      const seq = [1046.5, 1318.5, 1567.98, 2093];
      seq.forEach((n, i) => tone(n, i * 0.09, 0.28, "sine", 0.22));
    },
  };

  return api;
})();
