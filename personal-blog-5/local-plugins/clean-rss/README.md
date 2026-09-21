# clean-rss

Custom RSS emitter. The stock `content-index` feed includes tag pages and
folder listings; this one lists only real writing (`posts/`, `thoughts/`,
`notes/`). Demonstrates the **emitter** plugin category — see TUTORIAL.md §7.

Options (in `quartz.config.yaml`): `slug` (feed path, default `index` →
`/index.xml`), `limit` (max items, default 20).
