// FontPicker component: a small "Aa" button in the toolbar that opens a
// panel of font presets. Choosing one loads the Google-Fonts stylesheet
// on the fly and rewrites the three font CSS variables. Choice persists
// in localStorage and survives SPA navigation (the variables live on the
// persistent <html> element, and the loader re-runs on `nav`).
//
// Edit presets at quartz/static/font-presets.json:
//   [{ id, label, note, header, body, code }] — names must be exact
//   Google Fonts family names. "Berkeley Mono" has no Google Fonts
//   version; the loader falls back to an installed/monospace stack.

const css = `
#font-picker-btn {
  all: unset;
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 4px;
  color: var(--darkgray);
  font-family: var(--headerFont);
  font-style: italic;
  font-size: 0.85rem;
  transition: background 0.2s ease, color 0.2s ease;
}
#font-picker-btn:hover { background: var(--highlight); color: var(--secondary); }

#font-picker-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1001;
  width: 15rem;
  max-height: 65vh;
  overflow: auto;
  padding: 0.5rem;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  background: color-mix(in srgb, var(--light) 97%, transparent);
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.16);
  font-family: var(--headerFont);
}
#font-picker-panel.sp-hidden { display: none; }
#font-picker-panel h3 {
  font-size: 0.7rem;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.08em;
  color: var(--gray);
  margin: 0.2rem 0.35rem 0.45rem;
}
#font-picker-panel .fp-opt {
  padding: 0.45rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s ease;
}
#font-picker-panel .fp-opt:hover { background: var(--highlight); }
#font-picker-panel .fp-opt.fp-current { background: var(--highlight); }
#font-picker-panel .fp-label {
  display: block;
  font-size: 0.88rem;
  color: var(--darkgray);
}
#font-picker-panel .fp-opt.fp-current .fp-label {
  color: var(--secondary);
  background-image: var(--gilt-line);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 0.22em;
}
#font-picker-panel .fp-sample {
  display: block;
  font-size: 1.05rem;
  line-height: 1.25;
  margin-top: 0.15rem;
  color: var(--gray);
}
#font-picker-panel .fp-note {
  display: block;
  font-size: 0.72rem;
  color: var(--gray);
  font-style: italic;
}
`

const afterDOMLoaded = `
(async function () {
  const BTN = "font-picker-btn"
  const PANEL = "font-picker-panel"

  let presets = []
  try {
    const res = await fetch("/static/font-presets.json")
    presets = await res.json()
  } catch {}

  // load the Google Fonts stylesheet for a list of families (idempotent)
  const loaded = new Set()
  function loadFonts(families) {
    const fresh = families.filter((f) => f && !loaded.has(f))
    if (fresh.length === 0) return
    fresh.forEach((f) => loaded.add(f))
    const q = fresh.map((f) => "family=" + f.replace(/ /g, "+") + ":ital,wght@0,400;0,500;0,600;1,400").join("&")
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/css2?" + q + "&display=swap"
    link.dataset.persist = ""
    document.head.appendChild(link)
  }

  function apply(preset) {
    loadFonts([preset.header, preset.body, preset.code].filter((f) => f !== "Berkeley Mono"))
    const mono = preset.code === "Berkeley Mono"
      ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
      : "'" + preset.code + "', monospace"
    // Direct element rules with !important — immune to every layer and
    // specificity race in the engine's stylesheets, and to var() resolution
    // quirks. The vars are ALSO set so var()-based rules follow along.
    let style = document.getElementById("font-preset-vars")
    if (!style) {
      style = document.createElement("style")
      style.id = "font-preset-vars"
      style.dataset.persist = ""
      document.head.appendChild(style)
    }
    const H = "'" + preset.header + "', serif"
    const B = "'" + preset.body + "', Georgia, serif"
    style.textContent =
      ":root { --headerFont: " + H + " !important; --titleFont: " + H + " !important; --bodyFont: " + B + " !important; --codeFont: " + mono + " !important; }" +
      "body, p, li, td, th, dd, dt, figcaption, input, button { font-family: " + B + " !important; }" +
      "h1, h2, h3, h4, h5, h6, thead, .page-title, .hero-title, .hero-sub, .colophon, .content-meta, .sp-title, .tag-link, #site-playlist, #font-picker-panel { font-family: " + H + " !important; }" +
      "code, pre, kbd, .linenums { font-family: " + mono + " !important; }"
    document.documentElement.dataset.fontPreset = preset.id
    try { localStorage.setItem("font-preset", preset.id) } catch {}
    markCurrent()
  }

  function markCurrent() {
    if (!window.__fpPanel) return
    const cur = document.documentElement.dataset.fontPreset
    window.__fpPanel.querySelectorAll(".fp-opt").forEach((el) =>
      el.classList.toggle("fp-current", el.dataset.id === cur))
  }

  function buildPanel() {
    const panel = document.createElement("div")
    panel.id = PANEL
    panel.dataset.persist = ""
    panel.classList.add("sp-hidden")
    panel.innerHTML =
      "<h3>set the type</h3>" +
      presets.map((p) =>
        '<div class="fp-opt" data-id="' + p.id + '">' +
        '<span class="fp-label">' + p.label + '</span>' +
        '<span class="fp-sample" style="font-family:\\'' + p.header + '\\', serif">Aa — the sky was cobalt</span>' +
        '<span class="fp-note">' + (p.note || "") + '</span>' +
        '</div>').join("")
    panel.querySelectorAll(".fp-opt").forEach((el) =>
      el.addEventListener("click", () => {
        const p = presets.find((x) => x.id === el.dataset.id)
        if (p) { apply(p); panel.classList.add("sp-hidden") }
      }))
    return panel
  }

  async function ensure() {
    if (presets.length === 0) return
    let btn = document.getElementById(BTN)
    if (!btn) {
      // sit next to the darkmode toggle inside the toolbar group
      const anchor = document.querySelector(".toolbar, .darkmode, .explorer")
      btn = document.createElement("button")
      btn.id = BTN
      btn.dataset.persist = ""
      btn.title = "change fonts"
      btn.textContent = "Aa"
      btn.setAttribute("aria-label", "change fonts")
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(btn, anchor.nextSibling)
      } else {
        document.querySelector(".sidebar.left")?.appendChild(btn)
      }
    }
    if (!window.__fpPanel) {
      window.__fpPanel = buildPanel()
      // panel must be positioned relative to a wrapper
      const wrap = document.createElement("div")
      wrap.dataset.persist = ""
      wrap.style.position = "relative"
      wrap.style.display = "inline-block"
      btn.parentNode.insertBefore(wrap, btn.nextSibling)
      wrap.appendChild(btn.contains(btn) ? btn : btn)
      wrap.appendChild(window.__fpPanel)
      // move btn inside wrap
      wrap.insertBefore(btn, window.__fpPanel)
      document.addEventListener("click", (e) => {
        if (!window.__fpPanel.classList.contains("sp-hidden") &&
            !wrap.contains(e.target)) window.__fpPanel.classList.add("sp-hidden")
      })
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") window.__fpPanel.classList.add("sp-hidden")
      })
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        window.__fpPanel.classList.toggle("sp-hidden")
      })
    }
    // restore saved choice on first load
    if (!document.documentElement.dataset.fontPreset) {
      let saved = null
      try { saved = localStorage.getItem("font-preset") } catch {}
      const p = presets.find((x) => x.id === saved)
      if (p) apply(p)
      else markCurrent()
    }
  }

  await ensure()
  document.addEventListener("nav", () => { ensure() })
})()
`

const FontPicker = () => {
  const FontPicker = () => null
  FontPicker.css = css
  FontPicker.afterDOMLoaded = afterDOMLoaded
  return FontPicker
}

export { FontPicker }
