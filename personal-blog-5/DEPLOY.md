# DEPLOY.md — putting Dimroe's Codex on the internet

The site builds to static files in `public/` — any static host works.
The recommended path is **GitHub Pages**, free, with automatic builds.

## One-time setup (GitHub Pages, ~10 minutes)

1. **Create the repo** — on github.com, make a new repository
   (e.g. `dimroe/codex`). Do not initialize it with a README.

2. **Connect your folder** — in this project folder:

   ```bash
   git init
   git add -A
   git commit -m "the codex, first edition"
   git remote add origin https://github.com/dimroe/codex.git
   git branch -M main
   git push -u origin main
   ```

3. **Set your real address** — open `quartz.config.yaml`, find
   `baseUrl: dimroe.github.io` and change it to your real URL.
   - Repo pages: `dimroe.github.io/codex` → baseUrl: `dimroe.github.io/codex`
   - Own domain later: just the domain, e.g. `codex.dimroe.com`

4. **Turn on Pages** — on GitHub: repo *Settings* → *Pages* →
   **Source: GitHub Actions**. That's it. The included workflow
   (`.github/workflows/deploy-site.yaml`) builds and deploys on every
   push to `main`. Watch it in the repo's *Actions* tab; first build
   takes ~3 minutes. Your site: `https://dimroe.github.io/codex/`.

5. **Custom domain (optional)** — buy the domain, point a CNAME record
   at `dimroe.github.io`, put the domain in `quartz.config.yaml`
   `baseUrl`, and add a `static/CNAME` file containing just the domain.
   The `cname` plugin already in your config copies it into the build.

## After setup, publishing is one motion

```bash
git add -A && git commit -m "what changed" && git push
```

Wait for the green check in the Actions tab. That is the entire loop.
(If you use Obsidian to edit `content/`, the [Obsidian Git
plugin](https://github.com/denolehov/obsidian-git) can automate even
this.)

## What the workflow does (so you can debug it)

1. checkout → 2. Node 24 → 3. `npm install` → 4. `npx quartz plugin
install` (community plugins, from package.json) → 5. `node
scripts/link-local-plugins.cjs` (links `local-plugins/*` into
`.quartz/plugins/` — Windows needs junctions, Linux symlinks, this
script picks the right one) → 6. `npx quartz build` → 7. upload
`public/` → 8. deploy.

If a build goes red: open the failed step and read the *first* error,
not the last. The usual suspects are a bad YAML edit in
`quartz.config.yaml` (build fails in step 6) or a broken wikilink
warning — though warnings don't fail builds.

## Other hosts (same build, different last mile)

- **Cloudflare Pages** — build command `npx quartz build`, output dir
  `public`. Free, fast, custom domains easy.
- **Netlify / Vercel** — same two settings, or drag-and-drop the
  `public/` folder for a one-off preview.
- **Any web server** — `public/` is the site. Copy it wherever.

## Pre-flight checklist (before your first real deploy)

- [ ] `npx quartz build` exits clean locally
- [ ] `baseUrl` in `quartz.config.yaml` matches where you'll actually live
- [ ] placeholder text replaced in `content/index.md` (name, email, links)
- [ ] `mailto:` address in `content/how-to-use.md` is yours
- [ ] you looked at the site once more in both light and dark mode
