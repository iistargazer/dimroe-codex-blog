# TUTORIAL — How to code this website yourself

GUIDE.md teaches you to *run* this site. This teaches you to *build* it —
to open a file, understand what it does, and change it without asking anyone.

Everything here points at a real file in this repository. Nothing is
hypothetical. Work through it in order; each section ends with an exercise.
The exercises are the point — reading alone teaches nothing.

Prerequisites: Node 22+, and the site running locally (`npx quartz build --serve`,
then open localhost:8080 — keep it running the whole time you do this tutorial;
every change should be *seen*, not imagined).

---

## 1. What a website actually is (mapped onto this repo)

A browser does exactly three things with any website:

1. **HTML** — the structure. "This is a heading, this is a paragraph, this is a link."
2. **CSS** — the appearance. "Headings are Garamond, links are cobalt."
3. **JavaScript** — the behavior. "When the theme button is clicked, flip the palette."

Your site's trick is that **you never write HTML directly**. The pipeline is:

```
content/*.md  →  Quartz build (TypeScript code)  →  public/*.html + *.css + *.js
   (you)              (the engine, this repo)            (what browsers see)
```

So "coding this website" means three distinct skills, in this order:

| Skill | What it edits | Files in this repo |
|---|---|---|
| Markdown + frontmatter | the words | `content/` |
| CSS | the look | `quartz/styles/custom.scss`, `quartz.config.yaml` colors |
| TypeScript | the machinery | `quartz/components/*`, `quartz/plugins/*`, `quartz.ts` |

**Exercise 1.** Open `public/index.html` in your editor (it's the *output*).
Find the `<header class="hero">` block, and find where the text "Dimroe's Codex"
appears. Now open `content/index.md` and find the same text. You've just traced
one piece of data through the pipeline. Do this reflex every time something
looks wrong: *find the output, then find the input.*

---

## 2. Reading the pipeline (where "build" actually happens)

The build is a sequence of stages over every content file. Open
`quartz/plugins/loader/config-loader.ts` — this is where your
`quartz.config.yaml` gets turned into a live pipeline. The stages, conceptually:

1. **Parse** — each `.md` file becomes a syntax tree (remark/hast). Markdown
   text becomes structured objects: `{type: 'heading', depth: 2, children: [...]}`
2. **Transform** — plugins in the `transformers` list rewrite the tree:
   wikilinks resolved, KaTeX math parsed, descriptions extracted, dates attached
3. **Filter** — plugins decide what's published (the `remove-draft` plugin
   drops `draft: true` files here)
4. **Emit** — plugins write output files: HTML pages, RSS, sitemap, CSS bundles

Where each lives in *your* config: every entry in `quartz.config.yaml` under
`plugins:` with `enabled: true` is one stage of this pipeline, in `order`.

The most useful file for understanding output structure is
`quartz/components/renderPage.tsx` — it assembles the final HTML: head, header,
beforeBody, body, afterBody, footer. When you wonder *"where does X come from
on the page?"* — it's one of those slots, and §8 tells you how slots are filled.

**Exercise 2.** In `quartz.config.yaml`, find `@quartz-community/table-of-contents`
and change its layout `position: right` to `position: left`. Save. Watch the dev
server rebuild. Look at the page. Change it back. You now understand layout slots
physically, not abstractly.

---

## 3. Markdown, precisely

Markdown is a *syntax tree description*, and Obsidian-flavored Markdown
(the `@quartz-community/obsidian-flavored-markdown` plugin) adds:

- `[[wikilinks]]` — become links + feed the backlinks component + graph view
- `![[image.png]]` — embeds (images *in* the text flow)
- `> [!quote] callouts` — styled admonition blocks
- frontmatter — the YAML block between `---` lines, which becomes `fileData`

One habit that separates hand-made sites from generated-feeling ones:
**frontmatter discipline**. Open `templates/post-template.md`. Every content
file should have `title`, `description`, `date`, and `tags` — description and
date feed the meta line, RSS, and og-images automatically.

**Exercise 3.** Write a real note (not in Posts — put it in `Thoughts/`) about
something you actually think. Link it from `content/index.md` with a wikilink.
Then open its page and scroll to the footer — check it appears in backlinks of
the homepage. You've grown the graph; that's the whole gardening loop.

---

## 4. CSS for real — using this repo as the lab

CSS looks simple and is subtle. The four concepts that cover 95% of it:

**Selectors** — *which elements* a rule hits.

```css
p              → every paragraph
.hero-title    → every element with class="hero-title"
article a      → links inside an article
p:has(> img)   → paragraphs that directly contain an image (used for
                 painting captions — see custom.scss)
```

**The cascade** — when two rules hit the same element, later/specificer wins.
This repo has real layers: base styles come in `@layer quartz-base`, npm-plugin
styles in `@layer quartz-fonts` etc. **Unlayered rules beat all layers** —
which is why everything in `quartz/styles/custom.scss` (unlayered) can
override anything. If a style "won't apply," the answer is almost always:
something more specific or later wins. Find it with DevTools (F12 → click
the element → look at the Styles panel; crossed-out rules lost the cascade).

**Custom properties** — CSS variables, declared with `--name:` and read with
`var(--name)`. The whole theme is ~12 of them, set from `quartz.config.yaml`
(`colors:`) and defined by the engine in `quartz/styles/variables.scss`.
`--headerFont`, `--secondary` (link color), `--light` (paper), `--gray`,
`--highlight`. Change once, propagates everywhere.

**Dark mode** — Quartz sets `saved-theme="dark"` on `<html>`. Every themed
rule in `custom.scss` has a `:root[saved-theme="dark"]` twin. Two palettes,
one stylesheet.

The single most valuable CSS tool in this repo is the **hand-drawn squiggle**
under links (stolen honestly from yana-log.net). Look at it in
`quartz/styles/custom.scss` — search for `--gilt-line`. It's an inline SVG
`background-image`: a `<path>` with deliberately wobbly coordinates, drawn
once, repeated horizontally. *Study how it works* — one small SVG beats a
plugin, and it's the kind of detail that reads as human.

**Exercise 4.** In `custom.scss`, make blockquote borders use `var(--secondary)`
instead of their current color, and give them `border-radius: 4px`. Reload.
Then revert. Then make one change you *keep* — something you think looks better.
Owning the stylesheet starts with small kept diffs.

---

## 5. TypeScript for readers (not writers)

You don't need to *write* TypeScript to modify this engine — you need to
*read* it. Decode a real example, `quartz.ts` (your override file):

```ts
registerCondition("is-index", (props) => props.fileData.slug === "index")
```

Reading it: `registerCondition` is a function taking a name and a function.
The arrow function receives `props` (the page being rendered) and returns
true when the page's slug is exactly `index`. Everywhere the layout says
`condition: is-index` (see `recent-notes` in the config), that component
appears **only on the homepage**.

The vocabulary you need to read components:

- `import { X } from "..."` — pulling in a tool from another file
- `const f = (a) => b` — a function; `async`/`await` — waiting for IO
- `type Foo = { a?: string }` — a shape; `?` means optional
- `export default` — what this file gives to importers

That's it. With those five forms you can read 90% of the engine.

**Exercise 5.** Open `quartz/components/Date.tsx` (or the created-modified-date
plugin's equivalent) and explain to yourself, out loud, what it renders and
where the date comes from. If you can narrate a component, you can modify one.

---

## 6. Anatomy of a component — the Colophon walkthrough

The best way to learn components is that **this repo already has a hand-made
one you can study**: `local-plugins/colophon/`. It renders the italic line
"2026 · Set by hand" at the bottom of every page.

Three files, and every plugin you'll ever write has the same shape:

**`package.json`** — the manifest. The `quartz` field is what the engine reads:
its `components` map says "this plugin exports a component named `Colophon`,
its default home is the footer slot, priority 60." The `optionSchema` declares
what options it accepts (so `quartz.config.yaml` can set `line:`).

**`dist/components/index.js`** — the component itself. Strip the styling and
it's ten lines:

```js
import { h } from "preact"

const Colophon = (opts) => {              // called once with config options
  const Colophon = ({ fileData }) =>      // called per page, with page data
    h("p", { class: "colophon" },         // <p class="colophon">
      h("span", { class: "colophon-year" }, `${yr} · `),
      h("span", { class: "colophon-line" }, line))
  Colophon.css = `.colophon { ... }`      // styles auto-bundled by the engine
  return Colophon
}
export { Colophon }
```

Two nested functions is the entire pattern: outer = options, inner = the page
renderer, which receives `fileData` (title, dates, tags — everything the
pipeline knows about the current page). `h(tag, props, children)` is Preact's
hyperscript; JSX in `.tsx` files compiles to exactly these calls, so
`<p class="colophon">` and `h("p", {class: "colophon"})` are the same thing.

The `css` property is the elegant part: attach a string to the component and
the build bundles it into the site CSS automatically. No wiring.

**How it gets loaded:** the config entry `source: ./local-plugins/colophon`
points the installer at the folder; it links the folder into `.quartz/plugins/`
(see `.quartz/plugins/colophon` — it's a junction/symlink), reads the manifest,
registers the component under the name `colophon`, and the layout resolver
matches it to the config's `layout: {position: footer}` block. All visible in
`quartz/plugins/loader/componentLoader.ts` if you want the real machinery.

**Exercise 6.** Change the colophon's `line` default in the manifest AND pass
an explicit `line` option from `quartz.config.yaml`. Confirm the config wins.
That's the options system: config > defaults, function-level via `quartz.ts`.

---

## 7. Transformers and emitters (when components aren't enough)

Components place *content* in slots. Two other plugin kinds change *every* page:

- **Transformer** (runs in the parse stage): receives each page's syntax tree
  and may rewrite it. Example: the `description` plugin walks the tree, makes
  a plaintext excerpt, and stores it in `fileData.description`. A transformer
  is right for anything that should become *data*.
- **Emitter** (runs in the write stage): receives all pages and writes files.
  `content-index` emits `index.xml` (RSS) and `sitemap.xml`. An emitter is
  right for anything that becomes a *file*.

You already know one emitter intimately without reading it: `og-image` —
it renders each page's title to a PNG. Reading emitter code is the same
skill as reading component code: find the `emit` method, find what it writes.

**Exercise 7.** (Stretch) Write a transformer that adds `reading-time` to
`fileData` — count the words in the tree, divide by 220. Then render it in
the Colophon or a copy of the content-meta component. This is a real-world
afternoon project and teaches you the tree shape (`hast`) for real.

---

## 8. The layout system, completely

A page is assembled from named **slots** (see `renderPage.tsx`):

```
head → header → beforeBody → body(page-type plugin) → afterBody → footer
                  left sidebar (explorer, search)   right sidebar (toc, graph, backlinks)
```

In `quartz.config.yaml`, every component entry has a `layout:` block:

```yaml
- source: "@quartz-community/recent-notes"
  layout:
    position: afterBody    # which slot
    priority: 40           # order within the slot (lower = higher)
    condition: is-index    # when it shows (registered in quartz.ts)
    display: mobile-only   # optional: mobile-only | desktop-only
```

Conditions available out of the box: `not-index` (used by article-title,
breadcrumbs, content-meta — that's why the homepage has no chrome), plus
page-type conditions. Custom ones are one line in `quartz.ts` (§5).

Groups: `group: toolbar` in the left sidebar clusters search + darkmode +
reader-mode into one row — configured under `layout.groups.toolbar`.

**Exercise 8.** Move the graph view from right to left sidebar, look at it,
decide you hate it, move it back. Layout fluency is pure repetition.

---

## 9. Build-your-own-plugin: the full checklist

From zero to a working local plugin (the Colophon did exactly this):

1. `mkdir local-plugins/my-thing`, add `package.json` — copy Colophon's and
   rename; the `quartz.components` map is the contract
2. `dist/components/index.js` — outer function takes options, returns inner
   renderer; attach `displayName` and `css`
3. `mkdir -p .quartz/plugins` and link the folder in. On Windows:
   `cmd //c "mklink /J .quartz\plugins\my-thing local-plugins\my-thing"`
   (a junction — no admin needed). On mac/Linux the installer symlinks itself.
4. Add to `quartz.config.yaml`: `source: ./local-plugins/my-thing` +
   `layout: {position: ..., priority: ...}`
5. Build. If it silently doesn't appear: check the manifest name matches the
   folder name, and the export name matches the manifest's `components` key.

**Exercise 9 (capstone).** Build a `Now` component — a small fixed block in
the footer or left sidebar that reads a content file `now.md` (title +
description) and renders "currently: {description}" with a link. This one
plugin exercises: manifest, component, options, CSS, layout config, and
reading `allFiles` (the component props give you every published page —
find `now` in it). Ship it and you've graduated.

---

## 10. Debugging like a professional

The debugging loop that fixes 90% of problems on this site:

1. **Reproduce in DevTools** (F12 on the preview). Elements panel → click the
   thing → Styles panel shows every rule that hit it, crossed-out rules lost.
2. **Is the output stale?** `npx quartz build` fresh, hard-reload the browser
   (Ctrl+Shift+R). The dev server watches content only — changes to
   `quartz.ts` or plugin code need a server restart. (This cost the site's
   author real time; learn it now.)
3. **Find the emitted truth.** The built CSS is `public/component-*.css` and
   `public/index-*.css` — `grep` it for your selector to learn whether the
   rule exists in the output at all. HTML: `public/<path>.html`.
4. **Read errors bottom-up.** A TS error names file:line. Fix the first one,
   ignore the rest — they're usually downstream of the first.
5. **Bisect config.** Something broke after a config change? Comment the
   entry (`enabled: false`), rebuild, confirm, uncomment, re-modify carefully.

Symptom table (from real debugging on this very site):

| Symptom | First check |
|---|---|
| style "won't apply" | DevTools cascade; is a layer or later rule winning? |
| font falls back to Times | `grep` built CSS for `--bodyFont`; fonts must be declared in *both* `theme.typography` and the `quartz-fonts` plugin options |
| component missing from page | does its `layout.position` exist on that page type? (`byPageType` exclusions in config) |
| plugin not loading | manifest name = folder name; export name = manifest key |
| preview shows old design | stale webview — hard reload; restart server if you touched TS |

---

## 11. The curriculum, in honest order

If you do these in sequence you will never need an AI to maintain this site:

1. **HTML literacy** — read `public/index.html` until the tags are boring.
   (1 evening)
2. **CSS cascade + DevTools** — §4 exercises, then restyle one element per
   day for a week. (1 week, 15 min/day)
3. **Markdown + frontmatter discipline** — write 10 real notes. The site is
   the writing; the code exists to serve it. (ongoing, forever)
4. **Read TypeScript** — §5. Then read one component per day. (1 week)
5. **The pipeline** — trace one piece of content end-to-end (§1–2). Do it
   twice. (1 evening)
6. **Write the Colophon clone from memory** — §9 without looking. (1 evening)
7. **The capstone `Now` plugin** — §9 exercise. (1 weekend afternoon)
8. **Git fluency** — `status`, `diff`, `add <file>`, `commit -m`, `push`,
   `log --oneline`. That's the whole daily set. (1 evening + habit)
9. **Deployment** — GUIDE.md §7; push and watch the Actions tab go green.

After that: you own it. The engine has more to give (transforms, emitters,
frames), but it's optional — a site that's *yours* is one voice, one theme,
and notes that link to each other. The code was never the hard part.

---

## 12. Case study: how a feature actually gets added

You now have **three working examples** in `local-plugins/`, each teaching
a different plugin category. Here's the exact thought process of how the
music player got built, compressed into the reusable recipe:

### The recipe (works for any feature)

1. **State the feature as data + behavior.** "A floating player that plays
   a list of tracks" = data: a playlist file; behavior: an audio element
   that survives page navigation.
2. **Find the category.** Does it *place content* on pages → **component**.
   Does it *rewrite pages* → **transformer**. Does it *write files* →
   **emitter**. Does it *remove pages* → **filter**. The player places
   nothing visible (script builds it) → component with an
   `afterDOMLoaded` script. The clean RSS feed writes a file → emitter.
3. **Find the integration point by reading, not guessing.** How does SPA
   navigation work? Open `quartz/components/scripts/spa.inline.ts`, see
   `micromorph` + `data-persist` + the `nav` event — now the player's
   whole architecture is dictated by the engine's facts, not vibes.
4. **Copy the nearest existing example and mutate it.** The Colophon was
   the component template; `@quartz-community/content-index`'s public
   behavior was the emitter spec.
5. **Build, verify in the OUTPUT, then in the browser.** `grep public/`
   first (is my code even in the bundle?), then DevTools. When the player
   seemed missing, `grep -c site-player public/index.html` said 0 — but
   the code was in a lazy-loaded chunk. Two minutes of output-checking
   beat an hour of guessing.

### The three worked examples (read in this order)

- `local-plugins/colophon` — simplest component; options, CSS property
- `local-plugins/site-player` — component doing real work: persistent
  script, SPA survival, localStorage, fetch, SVG icons in a template string
- `local-plugins/clean-rss` — emitter; the filter that fixed a real bug
  (the stock feed was full of tag pages — found by `grep -o "<title>"
  public/index.xml`)

### Bugs found and fixed during this build (learn from each)

| Bug | Root cause | The general lesson |
|---|---|---|
| feed full of tag pages | stock emitter has no filter option | read the plugin's `dist` — 10 minutes of reading beats assuming |
| no RSS icon in browser | no `<link rel=alternate>` in head | features need an *announcement*, not just a file |
| fonts fell back to Times | two font systems disagreeing | when a var() "doesn't work", check what writes it |
| `$$math$$` rendered inline | `$$` must sit on its own lines (fence syntax) | engines have dialects; test the exact syntax you'll use |
| player "missing" from HTML | script lives in a lazy-loaded chunk | verify against the built output, not your memory of it |
| Windows couldn't symlink plugins | `fs.symlinkSync` needs privileges | junctions; and `scripts/link-local-plugins.cjs` picks per-OS |

### Your next feature, start to finish

Take the smallest feature you actually want ("show a random painting in
the sidebar", "word count in the meta line", "highlight active section in
the TOC"). Write one sentence: what it does. Then follow the recipe above.
Expect the first one to take an evening. The second will take an hour.

---

*This tutorial was written against this exact repository. If a file named
here doesn't match what you see, trust the file — code moves, principles don't.*
