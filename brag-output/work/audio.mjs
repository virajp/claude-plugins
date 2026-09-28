// Synthesized score: D major, 112 bpm, one chord per scene, effects in key.
import { writeFileSync } from "node:fs";

const SR = 48000, DUR = 21, N = SR * DUR;
const B = 60 / 112 * 4, BEAT = B / 4, E8 = BEAT / 2;
const S = [0, 2 * B, 4 * B, 6 * B, 8 * B, 21];
const dry = [new Float32Array(N), new Float32Array(N)];
const wet = [new Float32Array(N), new Float32Array(N)]; // reverb send
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const n = s =>
  ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 })[s[0]]
  + (s[1] === "#" ? 1 : 0)
  + 12 * (+s.at(-1) + 1);

function add(t0, len, fn, gain, pan = 0, send = 0) {
  const a = Math.floor(t0 * SR), L = Math.floor(len * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4),
    gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < L && a + i < N; i++) {
    if (a + i < 0) {
      continue;
    }
    const v = fn(i / SR);
    dry[0][a + i] += v * gl;
    dry[1][a + i] += v * gr;
    wet[0][a + i] += v * gl * send;
    wet[1][a + i] += v * gr * send;
  }
}

// soft pluck: sine + a little 2nd/3rd harmonic, fast attack, exp decay
const pluck = (f, dec = 3.5) => t =>
  Math.min(1, t * 400)
  * Math.exp(-t * dec)
  * (Math.sin(2 * Math.PI * f * t)
    + .25 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 6)
    + .08 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 10));
// bell: inharmonic partial for a glassy chime
const bell = f => t =>
  Math.min(1, t * 300)
  * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.6) + .35 * Math
        .sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 4));
// pad voice: two detuned sines, slow swell
const padv = (f, len, att = .6, rel = .8) => t => {
  const e = Math.min(1, t / att) * Math.min(1, Math.max(0, (len - t) / rel));
  return e
    * (Math.sin(2 * Math.PI * f * 1.003 * t)
      + Math.sin(2 * Math.PI * f * .997 * t + 1)
      + .2 * Math.sin(4 * Math.PI * f * t))
    / 2.2;
};
const kick = t =>
  Math.sin(2 * Math.PI * (45 * t + 55 / 18 * (1 - Math.exp(-t * 18))))
  * Math.exp(-t * 9)
  * Math.min(1, t * 2000);
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
const tick = f => {
  let prev = 0;
  return t => {
    const w = rnd();
    const h = w - prev;
    prev = w;
    return (h * .5 + .5 * Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 90);
  };
};
const hat = () => {
  let prev = 0;
  return t => {
    const w = rnd();
    const h = w - prev;
    prev = w;
    return h * Math.exp(-t * 60);
  };
};

const chords = [
  ["D3", "A3", "C#4", "E4", "F#4"], // Dmaj9
  ["B2", "F#3", "A3", "C#4", "D4"], // Bm9
  ["G2", "D3", "F#3", "A3", "B3"], // Gmaj9
  ["A2", "E3", "G3", "B3", "C#4"], // A9
  ["D3", "A3", "C#4", "E4", "F#4"], // Dmaj9
];
chords.forEach((c, i) => {
  const t0 = S[i], len = (i === 4 ? DUR - t0 : S[i + 1] - t0) + .5;
  c.forEach((m, k) =>
    add(
      t0 - .05,
      len,
      padv(hz(n(m)), len, i === 0 ? 1.2 : .5, i === 4 ? 2.5 : .7),
      .05,
      (k - 2) * .25,
      .6,
    )
  );
  // bass: root an octave down
  const r = hz(n(c[0]) - 12);
  add(t0, len, padv(r, len, .08, .5), i === 0 ? 0 : .11, 0, .1);
});

// arpeggio: 8ths through scenes 2–4
const pat = [0, 2, 4, 3, 1, 3, 4, 2];
for (let t = S[1], k = 0; t < S[4] - .01; t += E8, k++) {
  const sc = S.findIndex((x, i) => t >= x && t < S[i + 1]);
  const m = n(chords[sc][pat[k % 8]]) + 12;
  add(t, 1.2, pluck(hz(m), 5), k % 2 ? .035 : .05, k % 2 ? .35 : -.35, .5);
}
// kick on quarters in scenes 3–4, hats on offbeats
for (let t = S[2]; t < S[4] - .01; t += BEAT) {
  add(t, .5, kick, .42, 0, .03);
}
for (let t = S[2] + E8; t < S[4] - .01; t += BEAT) {
  add(t, .08, hat(), .035, .2, .1);
}

// scene 1: nodes pop, notes tick in
[[1.7, "D5"], [1.84, "F#5"], [1.98, "A5"]].forEach(([t, m], i) =>
  add(t, 2, pluck(hz(n(m)), 3), .09, [-.4, .4, 0][i], .6)
);
[2.1, 2.25, 2.4].forEach((t, i) =>
  add(t, .05, tick(hz(n("A6"))), .03, [-.5, .5, 0][i], .3)
);

// scene 2: typing, choice moves, confirm
for (let i = 0; i < 12; i++) {
  add(S[1] + .45 + i * .5 / 12, .05, tick(hz(n("D6"))), .025, .1, .2);
}
add(S[1] + 2.2, 1, pluck(hz(n("F#5")), 8), .05, .3, .4);
add(S[1] + 2.65, 1, pluck(hz(n("D5")), 8), .05, .3, .4);
add(S[1] + 3.1, 2, pluck(hz(n("A5")), 3), .07, 0, .5);
add(S[1] + 3.18, 2, pluck(hz(n("D6")), 3), .06, 0, .5);

// scene 3: each phase lights
["B4", "D5", "F#5", "B5"].forEach((m, i) =>
  add(S[2] + .55 + i * .45, 2, pluck(hz(n(m)), 3), .07, -.3 + i * .2, .5)
);

// scene 4: typing, checks, merge gate chime
for (let i = 0; i < 17; i++) {
  add(S[3] + .4 + i * .5 / 17, .05, tick(hz(n("E6"))), .025, .1, .2);
}
["A4", "C#5", "E5", "A5"].forEach((m, i) =>
  add(S[3] + 1.55 + i * .38, 1.2, pluck(hz(n(m)), 6), .06, .3, .4)
);
["D5", "F#5", "A5"].forEach((m, i) =>
  add(S[3] + 3.0 + i * .03, 4, bell(hz(n(m))), .05, [-.3, .3, 0][i], .7)
);

// outro: downbeat
add(S[4], .9, kick, .5, 0, .1);
["D4", "A4", "D5", "F#5"].forEach((m, i) =>
  add(S[4] + i * .09, 4, bell(hz(n(m))), .045, -.3 + i * .2, .8)
);

// reverb: Schroeder, 4 combs + 2 allpasses per side
function reverb(x, off) {
  const y = new Float32Array(N);
  [1557, 1617, 1491, 1422].map(d => Math.round((d + off) * SR / 44100)).forEach(
    d => {
      const buf = new Float32Array(d);
      let j = 0, lp = 0;
      for (let i = 0; i < N; i++) {
        const o = buf[j];
        lp = o * .6 + lp * .4;
        buf[j] = x[i] + lp * .82;
        y[i] += o / 4;
        j = (j + 1) % d;
      }
    },
  );
  [556, 441].map(d => Math.round((d + off) * SR / 44100)).forEach(d => {
    const buf = new Float32Array(d);
    let j = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[j], v = y[i];
      const o = -v + b;
      buf[j] = v + b * .5;
      y[i] = o;
      j = (j + 1) % d;
    }
  });
  return y;
}
const rv = [reverb(wet[0], 0), reverb(wet[1], 23)];

// mix, gentle lowpass, fade, soft clip, normalize
const out = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let c = 0; c < 2; c++) {
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let v = dry[c][i] + rv[c][i] * .35;
    lp += (v - lp) * .55;
    v = lp;
    v *= Math.min(1, t / .05) * Math.min(1, (DUR - t) / 1.2);
    v = Math.tanh(v * 1.4) / 1.4;
    out[c][i] = v;
    peak = Math.max(peak, Math.abs(v));
  }
}
const g = .89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  for (let c = 0; c < 2; c++) {
    buf.writeInt16LE(Math.round(out[c][i] * g * 32767), 44 + i * 4 + c * 2);
  }
}
writeFileSync("score.wav", buf);
console.log("peak", peak.toFixed(3), "gain", g.toFixed(2));
