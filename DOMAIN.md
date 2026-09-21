# DOMAIN.md — getting a domain like ewan.my

`ewan.my` is short because it's a **country-code second-level domain**:
`.my` is Malaysia's TLD, and MYNIC (the Malaysian registry) sells
second-level names directly — `anything.my`, no `co.` or `com.` needed.
That's the cleanest kind of domain: short, memorable, one word.

## the whole process (any domain, ~20 minutes + DNS waiting)

### 1. Choose and buy the name

Registrars (the shops) — Cloudflare Registrar and Porkbun are the
cheapest and least scammy; Namecheap is fine too. Avoid hosting-company
bundles.

| You want | Register through | Rough cost/year |
|---|---|---|
| `name.my` (like ewan.my) | a MYNIC-accredited reseller (search "MYNIC accredited reseller list"; e.g. Exabytes, Shinjiru) | ~RM 80–120 (~$20) |
| `name.dev` / `name.app` / `name.me` | Cloudflare / Porkbun | $12–15 |
| `name.io` | Porkbun / Cloudflare | $30–40 |
| `lastname.com` | Cloudflare / Porkbun | $10 |

Notes on `.my`: some resellers ask for documentation, and certain
`.my` subdomains (like `.gov.my`) are restricted — but plain
second-level `.my` names are open to foreigners through the resellers.
If the process feels heavy, `.me` or `.dev` give the same effect
(`ewan.my`-style: `dimroe.me`, `dimroe.dev`) with zero paperwork.

Pick something you'd be happy saying out loud. Short beats clever.

### 2. Point the DNS at GitHub Pages

After buying, open the registrar's DNS panel and add (replace
`dimroe.github.io` with your real Pages URL):

- **A records** for the apex (`your.domain` → GitHub's four IPs):
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- **CNAME record** for `www` → `dimroe.github.io`

(If your registrar has Cloudflare nameservers by default, the same
records are added in Cloudflare's DNS panel. Set proxy status to
"DNS only" for the CNAME — GitHub needs to see it.)

### 3. Tell GitHub and the site

1. Repo **Settings → Pages → Custom domain**: type your domain, save.
   Wait for the DNS check to go green (minutes to a few hours).
2. Add a file `static/CNAME` in this repo containing exactly one line:
   your domain (`your.domain`). Your `cname` plugin already copies it
   into the build — this is what makes GitHub keep the domain on
   redeploy.
3. In `quartz.config.yaml`, set `baseUrl: your.domain` (no `https://`,
   no trailing slash). This feeds RSS links, sitemap, and og-images.
4. Enable **Enforce HTTPS** once the certificate is issued.
5. Commit, push, wait for the Actions build to go green.

### 4. Verify

- `https://your.domain` loads the site
- `https://your.domain/index.xml` is the RSS feed
- share a page into a chat app — the og-image should appear

## Mental model for later

- **Registrar** = where you *buy* the name (they hold the registration)
- **DNS host** = where the *records* live (often the registrar)
- **GitHub Pages** = where the *files* live (already done)
- The CNAME file + config `baseUrl` + DNS records must all say the same
  thing. When something 404s after a domain change, it's almost always
  a mismatch between those three.
