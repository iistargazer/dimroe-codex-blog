// Generates a subtle grayscale noise texture (ewan.my-style paper grain)
// and writes it to quartz/static/noise.png. Pure math, zero dependencies.
// Run: node scripts/generate-noise.cjs
//
// The texture is random per-pixel gray with full alpha, sized 128x128 so
// it tiles invisibly. CSS applies it at low opacity + blend mode, so the
// PNG itself should be full-strength randomness.

const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

const SIZE = 128

// PNG chunks
function crc32(buf) {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32LE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32LE(crc32(body))
  return Buffer.concat([len, body, crc])
}

// raw grayscale+alpha rows, each prefixed with filter byte 0
const raw = Buffer.alloc(SIZE * (SIZE * 2 + 1))
let p = 0
// deterministic seed so rebuilds are identical
let seed = 0x9e3779b9
const rand = () => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return (seed >>> 0) / 0xffffffff
}
for (let y = 0; y < SIZE; y++) {
  raw[p++] = 0
  for (let x = 0; x < SIZE; x++) {
    // mid-gray noise: values 96..160 — gentle when blended
    const v = Math.round(96 + rand() * 64)
    raw[p++] = v
    raw[p++] = 255 // alpha
  }
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 4 // color type: gray+alpha

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
])

const out = path.join(__dirname, "..", "quartz", "static", "noise.png")
fs.writeFileSync(out, png)
console.log("wrote", out, `${(png.length / 1024).toFixed(1)} KB`)
