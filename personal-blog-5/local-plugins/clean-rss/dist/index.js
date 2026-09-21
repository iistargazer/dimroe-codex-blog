// clean-rss — an emitter plugin.
//
// Emitters run in the WRITE stage: they receive every processed page and
// produce output files. This one writes /index.xml (the RSS feed) from
// real content pages only — Posts, Thoughts, Notes — skipping the machine
// pages (tag indexes, folder listings, 404) that the stock feed included.
//
// A Quartz emitter is an object with an `emit(ctx, content)` method.
// `ctx.argv.output` is the build output folder; `content` is an array of
// [syntaxTree, file] pairs where `file.data` carries the page's metadata.

const escapeXML = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")

const pageOf = (slug) => (slug ? slug.split("/")[0] : "")

export default function CleanRSS(opts) {
  const slug = opts?.slug ?? "index"
  const limit = opts?.limit ?? 20

  const emit = async (ctx, content) => {
    const cfg = ctx.cfg.configuration
    const base = cfg.baseUrl ?? ""
    const title = cfg.pageTitle ?? ""

    const items = content
      .map(([_, file]) => file.data)
      .filter((data) => {
        if (!data?.slug) return false
        if (data.unlisted === true) return false
        // skip folder listing pages themselves (posts/index, thoughts/index, …)
        if (data.slug === "index" || data.slug.endsWith("/index")) return false
        // keep only real content: posts, thoughts, notes
        return ["posts", "thoughts", "notes"].includes(pageOf(data.slug))
      })
      .map((data) => {
        const d = data.dates ?? {}
        const date = d.published ?? d.modified ?? d.created ?? new Date()
        return {
          slug: data.slug,
          title: data.frontmatter?.title ?? data.slug,
          description: data.description ?? "",
          date,
        }
      })
      .sort((a, b) => b.date - a.date)
      .slice(0, limit)

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
      <title>${escapeXML(title)}</title>
      <link>https://${base}</link>
      <description>${escapeXML("Writing from " + title)}</description>
      <generator>Quartz</generator>
      ${items
        .map(
          (it) => `<item>
        <title>${escapeXML(it.title)}</title>
        <link>https://${base}/${it.slug}</link>
        <guid>https://${base}/${it.slug}</guid>
        <description><![CDATA[ ${it.description} ]]></description>
        <pubDate>${it.date.toUTCString()}</pubDate>
      </item>`,
        )
        .join("\n")}
    </channel>
</rss>`

    const fs = await import("fs/promises")
    const path = await import("path")
    const out = path.join(ctx.argv.output, slug + ".xml")
    await fs.mkdir(path.dirname(out), { recursive: true })
    await fs.writeFile(out, xml)
    return [out]
  }

  return { name: "CleanRSS", emit, partialEmit: emit }
}
