// Generates three short ambient loops as WAV files for the site's music
// player. Pure math — no dependencies. Run once:
//   node scripts/generate-music.js
// Output: quartz/static/music/*.wav
//
// The trick for seamless loops: every frequency is an integer multiple of
// 1/duration, so a waveform ends exactly where it began.

const fs = require("fs")
const path = require("path")

const SR = 22050 // sample rate — plenty for soft ambient material

function wavFromFloat32(samples) {
  const n = samples.length
  const buf = Buffer.alloc(44 + n * 2)
  buf.write("RIFF", 0)
  buf.writeUInt32LE(36 + n * 2, 4)
  buf.write("WAVE", 8)
  buf.write("fmt ", 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write("data", 36)
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2)
  }
  return buf
}

// Soft sine with a slow amplitude wobble; harmonic adds a little air
function tone({ freq, dur, amp = 0.22, wobble = 0.15, harm = 0.25 }) {
  const n = Math.round(SR * dur)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const env =
      1 +
      wobble * Math.sin((2 * Math.PI * t) / dur) + // one full wobble per loop
      (wobble / 2) * Math.sin((4 * Math.PI * t) / dur)
    out[i] =
      amp * env * (Math.sin(2 * Math.PI * freq * t) + harm * Math.sin(4 * Math.PI * freq * t))
  }
  // normalize
  let peak = 0
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]))
  if (peak > 0) for (let i = 0; i < n; i++) out[i] /= peak
  return out
}

function mix(...layers) {
  const n = Math.max(...layers.map((l) => l.length))
  const out = new Float32Array(n)
  for (const l of layers) for (let i = 0; i < l.length; i++) out[i] += l[i]
  let peak = 0
  for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]))
  if (peak > 0) for (let i = 0; i < out.length; i++) out[i] = (out[i] / peak) * 0.85
  return out
}

const DUR = 12 // seconds per loop

const tracks = [
  {
    file: "morning-sky.wav",
    // C major warmth — the dawn painting
    layers: [
      tone({ freq: 130.81, dur: DUR, amp: 0.3, harm: 0.3 }), // C3
      tone({ freq: 196.0, dur: DUR, amp: 0.2 }), // G3
      tone({ freq: 261.63, dur: DUR, amp: 0.15, wobble: 0.3 }), // C4
      tone({ freq: 329.63, dur: DUR, amp: 0.08, wobble: 0.4 }), // E4 shimmer
    ],
  },
  {
    file: "garden-urns.wav",
    // A minor cooler shade — the garden painting
    layers: [
      tone({ freq: 110.0, dur: DUR, amp: 0.3 }), // A2
      tone({ freq: 164.81, dur: DUR, amp: 0.18 }), // E3
      tone({ freq: 220.0, dur: DUR, amp: 0.14, wobble: 0.35 }), // A3
      tone({ freq: 523.25, dur: DUR, amp: 0.05, wobble: 0.5 }), // C5 high air
    ],
  },
  {
    file: "prometheus-night.wav",
    // D minor ember — the night painting
    layers: [
      tone({ freq: 146.83, dur: DUR, amp: 0.3 }), // D3
      tone({ freq: 220.0, dur: DUR, amp: 0.16 }), // A3
      tone({ freq: 293.66, dur: DUR, amp: 0.12, wobble: 0.3 }), // D4
      tone({ freq: 587.33, dur: DUR, amp: 0.04, wobble: 0.55 }), // D5 faint
    ],
  },
]

const outDir = path.join(__dirname, "..", "quartz", "static", "music")
fs.mkdirSync(outDir, { recursive: true })
for (const t of tracks) {
  const wav = wavFromFloat32(mix(...t.layers))
  fs.writeFileSync(path.join(outDir, t.file), wav)
  console.log("wrote", t.file, `${(wav.length / 1024).toFixed(0)} KB`)
}
