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
   - User site: `dimroe.github.io` → baseUrl stays `dimroe.github.io`
   - Own domain later: just the domain, e.g. `codex.dimroe.com`

   If you change the address, also update the RSS link in the footer
   plugin entry in the same file (`RSS: https://…/index.xml`).

4. **Turn on Pages correctly — this is the step that breaks most often.**
   On GitHub: repo _Settings_ → _Pages_ → under **Build and deployment**,
   set **Source: GitHub Actions**.

   ⚠️ Do **not** use the "Deploy from a branch" option. That mode serves
   your repository's markdown straight through **Jekyll**, which is what
   causes the `liquid syntax error` / `{{ }}`-interpretation failures and
   the "only the homepage works, /notes gives 404" symptoms. This repo
   must be built by the included workflow (`.github/workflows/deploy-site.yaml`),
   which runs Quartz, emits the compiled HTML into `public/`, drops a
   `.nojekyll` file (so Pages never runs Jekyll over the output), and
   publishes that artifact instead.

5. **Custom domain (optional)** — buy the domain, point a CNAME record
   at `dimroe.github.io`, put the domain in `quartz.config.yaml`
   `baseUrl`, and **re-enable the `cname` plugin** in the same file
   (it is disabled by default because writing a CNAME with the
   `username.github.io` value breaks non-custom-domain deploys). The
   plugin copies the domain into the build automatically.

## After setup, publishing is one motion

```bash
git add -A && git commit -m "what changed" && git push
```

Wait for the green check in the Actions tab. That is the entire loop.
(If you use Obsidian to edit `content/`, the [Obsidian Git
plugin](https://github.com/denolehov/obsidian-git) can automate even
this.)

## What the workflow does (so you can debug it)

1. checkout → 2. Node 22 → 3. `npm ci` → 4. `npm run build`, which runs
   the `prebuild` hook first — `node scripts/link-local-plugins.cjs` (links
   `local-plugins/*` into `.quartz/plugins/`; Windows needs junctions, Linux
   symlinks, this script picks the right one) and `npm run install-plugins`
   (community plugins from `quartz.config.yaml`, cached in `.quartz/`,
   never committed) — then `npx quartz build` → 5. a smoke test that fails
   the deploy early if `index.html`, `404.html` or `.nojekyll` are missing
   or only one page was built → 6. upload `public/` → 7. deploy.

If a build goes red: open the failed step and read the _first_ error,
not the last. The usual suspects are a bad YAML edit in
`quartz.config.yaml` (build fails in step 4) or a broken wikilink
warning — though warnings don't fail builds.

## Other hosts (same build, different last mile)

- **Cloudflare Pages** — build command `npm run build`, output dir
  `public`. Free, fast, custom domains easy.
- **Netlify / Vercel** — same two settings, or drag-and-drop the
  `public/` folder for a one-off preview.
- **Any web server** — `public/` is the site. Copy it wherever.

## Pre-flight checklist (before your first real deploy)

- [ ] `npm run build` exits clean locally
- [ ] `baseUrl` in `quartz.config.yaml` matches where you'll actually live
- [ ] Pages **Source** is set to **GitHub Actions** (not deploy-from-branch)
- [ ] placeholder text replaced in `content/index.md` (name, email, links)
- [ ] `mailto:` address in `content/how-to-use.md` is yours
- [ ] you looked at the site once more in both light and dark mode
