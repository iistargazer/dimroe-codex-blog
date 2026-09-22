// Site-wide internal link checker: walks public/**/*.html and verifies
// every internal href resolves to an emitted file. Run: node scripts/check-links.cjs
//
// Subpath-aware, matching GitHub Pages project-site serving:
//   - relative hrefs resolve from the page's own directory
//   - root-absolute hrefs that already start with the baseUrl subpath
//     (e.g. /user/repo/...) resolve from public/
//   - any other root-absolute href escapes the subpath and is reported BROKEN
//     (on project pages it would 404 in production)
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")
const pub = path.join(root, "public")

// Read the top-level configuration.baseUrl from quartz.config.yaml
let basePath = ""
try {
  const yaml = fs.readFileSync(path.join(root, "quartz.config.yaml"), "utf8")
  const m = yaml.match(/^ {2}baseUrl:\s*(\S+)\s*$/m)
  if (m) {
    const url = m[1].replace(/^["']|["']$/g, "")
    basePath = new URL(`https://${url}`).pathname.replace(/\/+$/, "")
  }
} catch {}

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
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#"))
      continue

    if (href.startsWith("/")) {
      // Project-site serving: the href must stay under the baseUrl subpath.
      if (basePath && !href.startsWith(basePath + "/") && href !== basePath) {
        checked++
        missing.add(`${path.relative(pub, page)} → ${href} (escapes subpath ${basePath})`)
        continue
      }
      const rel = href.slice(basePath.length).replace(/^\//, "").split(path.sep).join("/")
      checked++
      if (!exists(rel)) missing.add(`${path.relative(pub, page)} → ${href}`)
      continue
    }

    const dir = path.dirname(page)
    const rel = path.relative(pub, path.resolve(dir, href)).split(path.sep).join("/")
    checked++
    if (!exists(rel)) missing.add(`${path.relative(pub, page)} → ${href}`)
  }
}
console.log("checked", checked, "links across", pages.length, "pages")
if (basePath) console.log("subpath hosting:", basePath)
if (missing.size) {
  console.log("BROKEN:")
  for (const x of missing) console.log(" ", x)
  process.exit(1)
}
console.log("ALL INTERNAL LINKS OK")
