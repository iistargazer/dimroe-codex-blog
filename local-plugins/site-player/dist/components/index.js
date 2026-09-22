// SitePlayer component: renders nothing itself — the floating player is
// built by the afterDOMLoaded script below so it survives SPA navigation
// (one persistent <audio> element, re-anchored after each page swap).
//
// Edit the playlist at quartz/static/playlist.json:
//   [{ "title": "...", "src": "/static/music/file.mp3", "note": "why" }]

const css = `
#site-player {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  background: color-mix(in srgb, var(--light) 88%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 18px rgba(0,0,0,0.12);
  font-family: var(--headerFont);
  opacity: 0.92;
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
}
#site-player:hover { opacity: 1; box-shadow: 0 6px 22px rgba(0,0,0,0.18); }
#site-player.sp-hidden { display: none; }
#site-player .sp-title {
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
  font-size: 0.85rem;
  color: var(--darkgray);
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  user-select: none;
}
#site-player .sp-title:hover { color: var(--secondary); }
#site-player button {
  all: unset;
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 50%;
  color: var(--secondary);
  transition: background 0.2s ease, transform 0.15s ease;
}
#site-player button:hover { background: var(--highlight); transform: scale(1.08); }
#site-player button.sp-play { width: 1.9rem; height: 1.9rem; }
#site-player button svg { width: 0.95rem; height: 0.95rem; display: block; }
#site-player button.sp-play svg { width: 1.1rem; height: 1.1rem; }
#site-player .sp-sep { width: 1px; height: 1.1rem; background: var(--lightgray); }
#site-player .sp-bar {
  position: relative;
  width: 4.5rem;
  height: 3px;
  border-radius: 2px;
  background: var(--lightgray);
  cursor: pointer;
  overflow: hidden;
}
#site-player .sp-bar > span {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0%;
  background: var(--secondary);
  border-radius: 2px;
}

/* the little revival button after closing the bar */
#site-player-restore {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 999;
  all: unset;
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--lightgray);
  background: color-mix(in srgb, var(--light) 88%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 18px rgba(0,0,0,0.12);
  color: var(--secondary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
#site-player-restore:hover { transform: scale(1.1); box-shadow: 0 6px 22px rgba(0,0,0,0.18); }
#site-player-restore svg { width: 1.1rem; height: 1.1rem; display: block; }
#site-player-restore.sp-hidden { display: none; }
/* while the bar is open the restore button hides behind it */

/* the playlist popup */
#site-playlist {
  position: fixed;
  right: 1.1rem;
  bottom: 4.4rem;
  z-index: 1000;
  width: 17rem;
  max-height: 60vh;
  overflow: auto;
  padding: 0.6rem;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  background: color-mix(in srgb, var(--light) 96%, transparent);
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.16);
  font-family: var(--headerFont);
}
#site-playlist.sp-hidden { display: none; }
#site-playlist h3 {
  font-size: 0.72rem;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: var(--gray);
  margin: 0.15rem 0.4rem 0.5rem;
}
#site-playlist ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
#site-playlist li {
  padding: 0.45rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s ease;
}
#site-playlist li:hover { background: var(--highlight); }
#site-playlist li.sp-current .sp-pl-title {
  color: var(--secondary);
  background-image: var(--gilt-line);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 0.22em;
}
#site-playlist .sp-pl-title {
  display: block;
  font-size: 0.88rem;
  font-style: italic;
  color: var(--darkgray);
}
#site-playlist .sp-pl-note {
  display: block;
  font-size: 0.74rem;
  color: var(--gray);
  margin-top: 0.1rem;
}
#site-playlist .sp-vol {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.55rem 0.4rem 0.15rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--lightgray);
  color: var(--gray);
  font-size: 0.72rem;
}
#site-playlist .sp-vol input[type="range"] {
  flex: 1;
  accent-color: var(--secondary);
  height: 3px;
}
#site-playlist .sp-vol svg { width: 0.85rem; height: 0.85rem; }

@media (max-width: 600px) {
  #site-player, #site-player-restore { right: 0.7rem; bottom: 0.7rem; }
  #site-playlist { right: 0.7rem; bottom: 4rem; width: calc(100vw - 1.4rem); max-width: 17rem; }
  #site-player .sp-bar { width: 3rem; }
}
`

const ICON = {
  play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5-9-5.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h2v12H3zM14 2.5v11L6 8l8-5.5z"/></svg>',
  next: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11 2h2v12h-2zM2 2.5v11L10 8 2 2.5z"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
  list: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5.5 4h8M5.5 8h8M5.5 12h8"/><circle cx="2.6" cy="4" r="0.9" fill="currentColor" stroke="none"/><circle cx="2.6" cy="8" r="0.9" fill="currentColor" stroke="none"/><circle cx="2.6" cy="12" r="0.9" fill="currentColor" stroke="none"/></svg>',
  note: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M13 1v8.5a2.5 2.5 0 1 1-1.5-2.29V3.8L7 4.9v7.1a2.5 2.5 0 1 1-1.5-2.29V3.6L13 1z"/></svg>',
  vol: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 2L4.5 5H2v6h2.5L8 14V2z"/><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
}

const LS_KEY = "site-player"

const afterDOMLoaded = `
(async function () {
  const ID = "site-player"
  const RID = "site-player-restore"
  const PID = "site-playlist"
  if (!window.__sitePlayerAudio) window.__sitePlayerAudio = null

  const saved = (() => {
    try { return JSON.parse(localStorage.getItem("${LS_KEY}") || "{}") } catch { return {} }
  })()

  // ---- build once; re-anchor on every navigation -------------------------
  const BASE = document.body?.dataset?.basepath || ""
  const withBase = (p) => {
    if (!p || !p.startsWith("/") || p.startsWith("//")) return p
    if (BASE && p.startsWith(BASE + "/")) return p
    return BASE + p
  }
  async function buildOnce() {
    let tracks = []
    try {
      const res = await fetch(withBase("/static/playlist.json"))
      tracks = await res.json()
    } catch {}
    if (!Array.isArray(tracks) || tracks.length === 0) return
    // re-anchor absolute track srcs to the site's base path (GitHub Pages subpaths)
    tracks = tracks.map((t) => (t && typeof t === "object" ? { ...t, src: withBase(t.src) } : t))

    const audio = window.__sitePlayerAudio ?? new Audio()
    window.__sitePlayerAudio = audio
    audio.volume = saved.vol ?? 0.6

    let i = Math.min(saved.i ?? 0, tracks.length - 1)
    audio.src = tracks[i].src
    let saveT = 0

    // --- bar -------------------------------------------------------------
    const bar = document.createElement("div")
    bar.id = ID
    bar.dataset.persist = ""
    bar.innerHTML =
      '<button class="sp-prev" title="previous">' + '{{ICON_PREV}}' + '</button>' +
      '<button class="sp-play" title="play / pause">' + '{{ICON_PLAY}}' + '</button>' +
      '<button class="sp-next" title="next">' + '{{ICON_NEXT}}' + '</button>' +
      '<span class="sp-sep"></span>' +
      '<button class="sp-title" title="open playlist"></button>' +
      '<span class="sp-bar"><span></span></span>' +
      '<button class="sp-list" title="playlist">' + '{{ICON_LIST}}' + '</button>' +
      '<button class="sp-close" title="hide player">' + '{{ICON_CLOSE}}' + '</button>'

    // --- restore button (what you click to get the bar back) --------------
    const restore = document.createElement("button")
    restore.id = RID
    restore.dataset.persist = ""
    restore.title = "show player"
    restore.innerHTML = '{{ICON_NOTE}}'

    // --- playlist popup ----------------------------------------------------
    const pl = document.createElement("div")
    pl.id = PID
    pl.dataset.persist = ""
    pl.classList.add("sp-hidden")
    pl.innerHTML =
      '<h3>the playlist</h3>' +
      '<ol>' +
      tracks.map((t, n) =>
        '<li data-n="' + n + '">' +
        '<span class="sp-pl-title">' + (t.title || t.src) + '</span>' +
        (t.note ? '<span class="sp-pl-note">' + t.note + '</span>' : '') +
        '</li>').join("") +
      '</ol>' +
      '<div class="sp-vol">' + '{{ICON_VOL}}' + '<input type="range" min="0" max="1" step="0.05" value="' + (saved.vol ?? 0.6) + '"></div>'

    const btnPlay = bar.querySelector(".sp-play")
    const title = bar.querySelector(".sp-title")
    const bar_ = bar.querySelector(".sp-bar")
    const fill = bar_.querySelector("span")
    const vol = pl.querySelector("input[type=range]")

    const show = () => {
      title.textContent = tracks[i].title
      title.title = "open playlist"
    }
    const persist = () => {
      try {
        localStorage.setItem("${LS_KEY}", JSON.stringify({ i, t: audio.currentTime, vol: audio.volume }))
      } catch {}
    }
    const setIcon = () => { btnPlay.innerHTML = audio.paused ? '{{ICON_PLAY}}' : '{{ICON_PAUSE}}' }
    const markCurrent = () => {
      pl.querySelectorAll("li").forEach((li, n) => li.classList.toggle("sp-current", n === i))
    }

    function play(n) {
      i = ((n % tracks.length) + tracks.length) % tracks.length
      audio.src = tracks[i].src
      audio.play()
      show(); setIcon(); markCurrent(); persist()
    }

    btnPlay.addEventListener("click", () => {
      if (audio.paused) { if (!audio.src) audio.src = tracks[i].src; audio.play() } else audio.pause()
      setIcon()
    })
    bar.querySelector(".sp-prev").addEventListener("click", () => play(i - 1))
    bar.querySelector(".sp-next").addEventListener("click", () => play(i + 1))
    title.addEventListener("click", () => pl.classList.toggle("sp-hidden"))
    bar.querySelector(".sp-list").addEventListener("click", () => pl.classList.toggle("sp-hidden"))
    pl.querySelectorAll("li").forEach((li) =>
      li.addEventListener("click", () => { play(parseInt(li.dataset.n)); pl.classList.add("sp-hidden") }))
    bar.querySelector(".sp-close").addEventListener("click", () => {
      pl.classList.add("sp-hidden")
      bar.classList.add("sp-hidden")
      restore.classList.remove("sp-hidden")
      try {
        localStorage.setItem("${LS_KEY}", JSON.stringify({ i, t: audio.currentTime, vol: audio.volume, closed: true }))
      } catch {}
    })
    restore.addEventListener("click", () => {
      restore.classList.add("sp-hidden")
      bar.classList.remove("sp-hidden")
    })
    document.addEventListener("click", (e) => {
      if (!pl.classList.contains("sp-hidden") && !pl.contains(e.target) && !bar.contains(e.target))
        pl.classList.add("sp-hidden")
    })
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") pl.classList.add("sp-hidden")
    })
    bar_.addEventListener("click", (e) => {
      const r = bar_.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
      if (audio.duration) audio.currentTime = p * audio.duration
    })
    vol.addEventListener("input", () => { audio.volume = parseFloat(vol.value); persist() })
    audio.addEventListener("ended", () => play(i + 1))
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) fill.style.width = (audio.currentTime / audio.duration) * 100 + "%"
      const now = Date.now()
      if (now - saveT > 2000) { saveT = now; persist() }
    })

    show()
    setIcon()
    markCurrent()
    if (saved.t > 1) audio.currentTime = saved.t

    // decide initial visibility: closed last session → restore button only
    if (saved.closed) {
      bar.classList.add("sp-hidden")
    } else {
      restore.classList.add("sp-hidden")
    }
    document.body.appendChild(bar)
    document.body.appendChild(restore)
    document.body.appendChild(pl)
    window.__sitePlayerNode = bar
    window.__sitePlayerRestore = restore
    window.__sitePlayerPlaylist = pl
  }

  async function ensure() {
    if (!window.__sitePlayerNode) await buildOnce()
    for (const el of [window.__sitePlayerNode, window.__sitePlayerRestore, window.__sitePlayerPlaylist]) {
      if (el && !document.body.contains(el)) document.body.appendChild(el)
    }
  }

  await ensure()
  document.addEventListener("nav", () => { ensure() })
})()
`
  .replaceAll("{{ICON_PREV}}", ICON.prev)
  .replaceAll("{{ICON_NEXT}}", ICON.next)
  .replaceAll("{{ICON_PLAY}}", ICON.play)
  .replaceAll("{{ICON_PAUSE}}", ICON.pause)
  .replaceAll("{{ICON_LIST}}", ICON.list)
  .replaceAll("{{ICON_NOTE}}", ICON.note)
  .replaceAll("{{ICON_VOL}}", ICON.vol)
  .replaceAll("{{ICON_CLOSE}}", ICON.close)

const SitePlayer = () => {
  const SitePlayer = () => null
  SitePlayer.css = css
  SitePlayer.afterDOMLoaded = afterDOMLoaded
  return SitePlayer
}

export { SitePlayer }
