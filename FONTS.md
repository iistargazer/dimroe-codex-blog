# FONTS.md — changing the site's fonts

You need to edit **two places** in `quartz.config.yaml` (the engine loads
fonts through two systems, and if they disagree the body font silently
falls back to a browser default — the classic "why is my text Times?"
bug). Both spots are marked with `FONTS (spot 1 of 2)` and
`FONTS (spot 2 of 2)` comments.

1. **Spot 1** — under `configuration.theme.typography`
2. **Spot 2** — inside the `@quartz-community/quartz-fonts` plugin options

Change `header` (titles, hero), `body` (everything you read), and/or `code`
(inline and block code). Use the exact name Google Fonts uses, e.g.
`EB Garamond`, `Cormorant Garamond`, `IBM Plex Serif`. Then rebuild
(`npx quartz build`) and hard-reload the browser (Ctrl+Shift+R).

One extra place fonts can hide: `quartz/styles/custom.scss` sets a few
accents to `var(--headerFont)` — you rarely need to touch these; they
follow spot 1 automatically.

## Ready-made pairings (copy-paste, both spots)

All three lines in each block go in BOTH spots. Keep `code` unless you
want a different mono.

**1. Current — Parrish bookish** (what the site ships with)

```yaml
header: EB Garamond
body: Source Serif 4
code: IBM Plex Mono
```

**2. Yana-log academic** (the CMU-adjacent paper feel)

```yaml
header: Crimson Pro
body: Lora
code: JetBrains Mono
```

**3. Gallery modern** (cleaner, less antique — closer to aarnphm)

```yaml
header: Fraunces
body: Inter
code: Fira Code
```

**4. Manuscript** (warmer, handwritten-header energy)

```yaml
header: Cormorant Garamond
body: Crimson Text
code: IBM Plex Mono
```

**5. Night-sky sharp** (sleek, contemporary)

```yaml
header: Spectral
body: Source Sans 3
code: Space Grotesk
```

## Just want to try one quickly?

Search the config for `spot 1 of 2`, change one font name, then search for
`spot 2 of 2` and change the same line there. Save. The dev server rebuilds
automatically; reload the tab. If text turns Times New Roman, the two spots
disagree — that's the bug telling you where to look.

## Why two places? (the one-paragraph lesson)

Quartz v5 has a built-in font system (`theme.typography`) AND a community
plugin (`quartz-fonts`) that re-declares fonts inside a CSS `@layer`.
Layers lose to unlayered CSS but beat other layers — so whichever system
loads last inside its layer wins. Declaring the same fonts in both keeps
them in agreement. This is written up as a real debugging case in
TUTORIAL.md §10.
