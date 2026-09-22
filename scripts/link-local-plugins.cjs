// Links every folder in local-plugins/ into .quartz/plugins/ so the
// Quartz plugin installer can find them. Handles the Windows/Unix
// difference: Windows junctions (no admin rights needed) vs symlinks.
//
// Runs automatically on `npx quartz build` via the prebuild hook, and
// standalone: node scripts/link-local-plugins.cjs

const fs = require("fs")
const path = require("path")

const srcRoot = path.join(__dirname, "..", "local-plugins")
const destRoot = path.join(__dirname, "..", ".quartz", "plugins")

if (!fs.existsSync(srcRoot)) {
  console.log("no local-plugins/ directory — nothing to link")
  process.exit(0)
}
fs.mkdirSync(destRoot, { recursive: true })

let linked = 0
for (const name of fs.readdirSync(srcRoot)) {
  const src = path.join(srcRoot, name)
  const dest = path.join(destRoot, name)
  if (!fs.statSync(src).isDirectory()) continue

  // already correctly linked?
  try {
    const st = fs.lstatSync(dest)
    if (st.isSymbolicLink() || st.isJunction?.()) {
      if (fs.realpathSync(dest) === fs.realpathSync(src)) continue
      fs.rmSync(dest, { recursive: true })
    } else {
      fs.rmSync(dest, { recursive: true })
    }
  } catch {
    // dest doesn't exist — fall through
  }

  try {
    fs.symlinkSync(src, dest, "junction")
    linked++
    console.log(`linked plugin: ${name}`)
  } catch (e) {
    // last-resort fallback: copy (works everywhere, needs re-run after edits)
    fs.cpSync(src, dest, { recursive: true })
    console.log(`copied plugin (symlink failed): ${name} — ${e.message}`)
  }
}
if (linked === 0) console.log("local plugins already linked")
