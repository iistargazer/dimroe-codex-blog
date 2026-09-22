# GUIDE — Run this website yourself

This is the manual for owning Dimroe's Codex without asking an AI for everything.
Read sections 1–3 once and you can run the site daily. Sections 4–6 are what
turn "I have a Quartz site" into "I built my website."

> **Companion docs:** `TUTORIAL.md` — the from-zero coding curriculum
> (HTML, CSS, TypeScript, and writing your own plugin, all anchored in this
> repo). `FONTS.md` — change the site's default fonts; visitors can also
> switch fonts live with the Aa button. `DEPLOY.md` — put the site online.
> `DOMAIN.md` — get a custom domain (including short `.my`-style ones).
> Read this GUIDE to operate the site; those to build and ship it.

---

## 1. The mental model (read this first)

Your site is a **Markdown → HTML compiler with opinions**:

```
content/*.md  ──►  Quartz build pipeline  ──►  public/*.html  ──►  GitHub Pages
 (your words)     (quartz.config.yaml)        (static files)      (hosting)
```

Three things to internalize:

1. **`content/` is the site.** Everything else is machinery you rarely touch.
   You write Markdown files. The machinery handles HTML, links, search, RSS,
   themes, the graph.
2. **The build is pure.** `content/` in → `public/` out. You can delete `public/`
   whenever you want; it regenerates. Your *source of truth* is `content/` +
   `quartz.config.yaml` + `quartz/styles/custom.scss`.
3. **ewan.my is this exact code with different `content/`.** Its "design" is 95%
   stock Quartz. The personality you admire is (a) a name, (b) a theme config,
   (c) hundreds of densely cross-linked notes written by hand. There is no
   secret fourth thing.

### The two commands you'll use forever

```bash
npx quartz build --serve   # local dev: builds + live-reloads at localhost:8080
npx quartz build           # production build into public/
```

Pushing to GitHub triggers the deploy workflow automatically (`.github/workflows/deploy-v5.yaml`).

---

## 2. Daily workflow

**Writing a post:**
1. `cp templates/post-template.md content/Posts/my-post.md`
2. Edit the title, date, tags; delete `draft: true` when it's ready.
3. Look at `localhost:8080` — it hot-reloads as you save.
4. `git add content/Posts/my-post.md && git commit -m "post: my-post" && git push`

**Writing a thought** (the garden behavior):
- Create `content/Thoughts/whatever.md`, tag it `#folio`, don't finish it. That's the point.
- Link it to other pages with `[[wikilinks]]` or `[text](Thoughts/whatever)`.
- Promote it later: move the file to `Notes/` or `Posts/`, update the tag.

**The number one habit that makes this kind of site good:** whenever you write
a page, ask "what two existing pages does this relate to?" and link them. Dense
linking is what makes search, backlinks, popovers, and the graph come alive.
Ewan's site has ~1000 notes that all reference each other — that's the entire effect.

---

## 3. Frontmatter (the YAML block at the top of a file)

**House conventions** (what makes this site feel maintained rather than
assembled):

- **Math**: inline `$x^2$` works anywhere; display math needs the `$$`
  fences on their own lines (like code fences) — `$$x = y$$` on one line
  renders as inline math. LaTeX/typst engine is already configured.
- **Papers**: one note per paper in `Papers/` — cite, one-paragraph
  summary, why it matters, links. See the shelf's index for the format.
- **Zettelkasten**: thoughts get one idea per note, a claim-as-title, and
  at least one link. Full rules: `Thoughts/zettelkasten-how`.
- **Music**: edit `quartz/static/playlist.json` to change the player's
  tracks; drop audio files in `quartz/static/music/`.
- **Art**: add images to `content/attachments/`, embed with `![[file]]`
  and one italic caption line — see `Paintings/index.md`.

```markdown
---
title: How transformers work     # shown as the page heading
date: 2026-09-21                 # sorts Posts; powers RSS
description: One-sentence summary # search + link previews + OG images
tags:
  - machine-learning             # every tag gets its own page at /tags/<tag>
  - folio                        # your maturity system
aliases: [transformers, attention] # other names pages can link to
draft: true                      # true = skipped entirely at build time
---
```

Rules of thumb:
- `title` is the only field with a default fallback (the filename). Set it anyway.
- Dates: `YYYY-MM-DD`. Sorting uses the `created-modified-date` plugin's priority:
  frontmatter → git history → file mtime. Since this repo has no git history
  warning-free workflow yet, **put `date:` in your frontmatter explicitly**.
- Tags are lowercase, no spaces. Tags create pages automatically — that's the
  "use tags not folders" navigation you liked on ewan.my.

---

## 4. Anatomy of `quartz.config.yaml`

Change these, in order of impact:

### `configuration` — the identity block
| Key | What it does |
| --- | --- |
| `pageTitle` | Site name (sidebar, browser tab, RSS) |
| `baseUrl` | Your domain. **Must be right** for RSS/sitemaps/OG images. No `https://`, no trailing slash |
| `theme.typography` | Any Google Fonts by name: `header`, `body`, `code` |
| `theme.colors` | The entire palette, both modes. Each key is described in `docs/configuration.md` |
| `ignorePatterns` | Folder names the build skips (`private`, `templates`, `.obsidian`) |
| `analytics` | Plausible/umami/goatcounter/etc. Keep `null` until you care |

### `plugins` — the pipeline
Each entry: `source` (package), `enabled`, `options`, and optionally `layout`
(where a component appears on the page). The ones you'll actually touch:

| Plugin | What it controls | Why you'd touch it |
| --- | --- | --- |
| `explorer` | Left sidebar file tree | options for sort/spacing |
| `graph` | The graph view | `localGraph` depth/force settings |
| `table-of-contents` | Right sidebar TOC | collapse behavior |
| `recent-notes` | Homepage "Recent Notes" | `limit`, `linkToMore`, `showTags` |
| `content-index` | RSS + sitemap | `enableRSS`, `enableSiteMap` |
| `og-image` | Social card images | turn off if you don't like them |
| `footer` | The footer links | put your socials here |
| `comments` | Giscus (GitHub) comments | enable when you want replies |

### `layout` — where components sit
Positions: `left`, `right`, `beforeBody`, `afterBody`, `footer`. Each component
declares a `position` + `priority` (lower = earlier). Two tricks you're already using:

```yaml
condition: not-index   # only render when NOT on the homepage
display: mobile-only   # only render on phones
```

Built-in conditions: `not-index`, `has-tags`, `has-backlinks`, `has-toc`
(source: `quartz/plugins/loader/conditions.ts`). You can add your own in `quartz.ts`.

**To move/remove anything on the page:** find its plugin entry, change/delete its
`layout:` block. That's it. No templates to edit.

---

## 5. When YAML isn't enough: `quartz.ts`

`quartz.ts` is your one TypeScript file, the sanctioned override point. You're
already using it for two things:

1. **Custom conditions** — `registerCondition("is-index", ...)`
2. **Function options** — options that are functions (like `filter`, `sort`,
   `mapFn`) can't live in YAML, so you set them with
   `componentRegistry.setOptionOverrides("<plugin-name>", { ... })`

The key must match the plugin's source string exactly — for scoped npm packages
that's the full name: `"@quartz-community/recent-notes"`.

This is also where you'd override Explorer's folder labels, RecentNotes sorting,
etc. The docs cover the pattern: search `docs/` for "TS override".

---

## 6. CSS (custom.scss) — and restraint

`quartz/styles/custom.scss` is compiled into the final stylesheet. You can
override anything, but the site already looks good — every line you add is a
line that can look wrong later. The current file is intentionally nearly empty.

The site's colors come from CSS variables set by your config:

```scss
a.internal { color: var(--secondary); }        // links
body { background: var(--light); }             // page background (both modes handled)
```

Variables: `--light --lightgray --gray --darkgray --dark --secondary --tertiary
--highlight --textHighlight`. Style *with* these and dark mode works for free.

Layout constants live in `quartz/styles/variables.scss` (page widths, breakpoints).

**The anti-slop checklist** (why your first version felt AI-made — these are
the tells): decorative characters (:::), ornaments on every hr, small-caps
everywhere, "system pages" that describe the site instead of being the site,
symmetric bullet triads, tables where prose would do. When in doubt, delete.

---

## 6.5 The theme: "Parrish light"

The look is Maxfield Parrish: cobalt skies, gilt gold, ivory marble. Two files own it:

- **`quartz.config.yaml` → `theme:`** — every color, both modes. Light mode is
  ivory `#fbf7ec` + cobalt links `#2758c4` + gilt highlights. Dark mode is
  Prometheus-night `#131522` + gilt `#d9a83f`. Fonts: EB Garamond (headers),
  Source Serif 4 (body).
- **`quartz/styles/custom.scss`** — the signature moves, all borrowed:
  - the **hand-drawn squiggle underline** (from yana-log.net) — an SVG path with
    wobbly coordinates, recolored to gilt; tag links get it on hover
  - **two-stage links** (also yana-log): highlight wash, then underline on hover
  - **lowercase titles + quiet metadata** (from notes.aarnphm.xyz)
  - gallery matting on images

To retheme: change the `theme.colors` values and watch which variables move
(`--secondary` = links, `--tertiary` = hovers, `--highlight` = washes). The
squiggle's color lives inside the `--gilt-line` SVG data-URL in custom.scss —
edit the `%23c99b2e` hex there (light) and `%23eec25f` (dark).

A gotcha this theme survived: the `quartz-fonts` plugin emits its own font
variables, so fonts must be declared in BOTH `theme.typography` AND the plugin's
`options:` — that's why `quartz-fonts` has `header/body/code` options set.

## 7. Deploying

1. Create a GitHub repo, push everything.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. The included `deploy-v5.yaml` runs on every push to `main`.
4. Set `baseUrl` in `quartz.config.yaml` to `yourname.github.io` (or your custom
   domain — the `cname` plugin writes the CNAME file; add the DNS record).

First deploy failing? Read the Actions log tab; it's usually `baseUrl` or a
plugin install issue.

---

## 8. What to actually learn (the honest roadmap)

You don't need to "learn programming" for this. You need, in order:

1. **Markdown** (30 min) — headings, links, lists, tables, code fences.
   Then Obsidian-flavored extras: `[[wikilinks]]`, `![[embeds]]`, callouts
   (`> [!tip]`), tags.
2. **Git basics** (2 hours, permanent value) — `status`, `add`, `commit`,
   `push`, `log`, `diff`, and `checkout -- .` to undo. GitHub's own tutorial +
   using it daily beats any course.
3. **YAML** (20 min) — indentation matters, lists vs maps. You'll edit config
   files for the rest of your life; YAML is everywhere.
4. **A little CSS** (a weekend, optional but empowering) — selectors, the box
   model, flexbox. FreeCodeCamp's Responsive Web Design is genuinely good.
   You need maybe 10% of it.
5. **DevTools** (ongoing) — F12 in the browser: inspect elements, read the
   Console for errors, read the Network tab when something 404s. This skill
   turns "it's broken" into "this selector is wrong" or "this file 404s".
6. **Reading error messages** (ongoing, meta-skill) — build errors in the
   terminal are almost always a YAML typo or a bad link. Read the message
   bottom-up; the last line usually names the actual problem.

The web fundamentals (HTML/CSS/jargon like "static site generator") are worth
learning *through this project*, not before it.

---

## 9. The debugging playbook

| Symptom | First checks |
| --- | --- |
| Build fails | Run `npx quartz build` (not serve) to see the error cleanly. Read the last lines. 90%: YAML indentation, or a plugin entry with a typo'd option |
| Page missing from the site | Has `draft: true`? Inside an `ignorePatterns` folder? Filename typo in a link? |
| Link shows red / "broken" | The target file must exist under `content/`. Wikilinks resolve by filename. Aliases go in the target's frontmatter |
| Styles don't change | Hard-refresh (Ctrl+Shift+R). Check you edited the right file and saved. SCSS syntax errors fail the build — check the terminal |
| Fonts/colors wrong | `theme:` block typos silently fall back. Colors need all keys present in both light and dark mode |
| RSS/OG images broken | `baseUrl` wrong. No protocol, no trailing slash |
| `--serve` stops reacting to edits | Restart it (Ctrl+C, rerun). Changes to `quartz.config.yaml` or `quartz.ts` always need a restart; content files do not |

**The universal technique:** change one thing, look at the result, change the
next thing. Never batch five edits before checking.

---

## 10. Where things live (the map)

```
content/                    ← YOUR WORDS (everything public)
templates/                  ← post template (ignored by build)
quartz.config.yaml          ← identity, theme, plugins, layout
quartz.config.default.yaml  ← pristine reference copy, don't edit
quartz.ts                   ← your TS overrides (conditions, function options)
quartz/styles/custom.scss   ← your CSS
quartz/                     ← the engine. Read freely; edit rarely/never
.quartz/plugins/            ← installed community plugins (generated)
public/                     ← build output (generated, gitignored usually)
docs/                       ← official Quartz docs as Markdown, local!
```

Start with `docs/index.md` and `docs/getting-started/`, then read
`docs/configuration.md`, `docs/layout.md`, and `docs/advanced/` when you're ready
to go deeper. The showcase in `docs/showcase.md` links to other Quartz sites
worth stealing from (structure, not words).

---

*Last thing: write the boring pages too. Ewan's site works because a hundred
small notes exist, not because any one page is special. Volume + links = the thing.*
