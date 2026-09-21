// Site-wide internal link checker: walks public/**/*.html and verifies
// every internal href resolves to an emitted file. Run: node scripts/check-links.cjs
const fs = require("fs")
const path = require("path")

const pub = path.join(__dirname, "..", "public")
const pages = []
;(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p)
    else if (f.endsWith(".html")) pages.push(p)
  }
})(pub)

const exists = (slug) => {
  const clean = slug.split("#")[0].split("?")[0]
  if (!clean) return true
  const norm = clean.replace(/\\/g, "/")
  const candidates = [
    path.join(pub, norm),
    path.join(pub, norm + ".html"),
    path.join(pub, norm, "index.html"),
  ]
  return candidates.some((c) => fs.existsSync(c))
}

let checked = 0
const missing = new Set()
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8")
  const re = /href="([^"]*)"/g
  let m
  while ((m = re.exec(html))) {
    const href = m[1]
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) continue
    const dir = path.dirname(page)
    const abs = href.startsWith("/") ? path.join(pub, href) : path.resolve(dir, href)
    const rel = path.relative(pub, abs).split(path.sep).join("/")
    checked++
    if (!exists(rel)) missing.add(path.relative(pub, page) + " → " + href)
  }
}
console.log("checked", checked, "links across", pages.length, "pages")
if (missing.size) {
  console.log("BROKEN:")
  for (const x of missing) console.log(" ", x)
  process.exit(1)
}
console.log("ALL INTERNAL LINKS OK")
