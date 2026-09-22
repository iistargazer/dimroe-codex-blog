import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname } from "path"

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  async *emit({ argv, cfg }) {
    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    const outputStaticPath = joinSegments(argv.output, "static")
    await fs.promises.mkdir(outputStaticPath, { recursive: true })
    for (const fp of fps) {
      const src = joinSegments(staticPath, fp) as FilePath
      const dest = joinSegments(outputStaticPath, fp) as FilePath
      await fs.promises.mkdir(dirname(dest), { recursive: true })
      await fs.promises.copyFile(src, dest)
      yield dest
    }

    // GitHub Pages: disable Jekyll processing of the build output. Without this
    // file, Pages runs Jekyll over the site by default, which chokes on
    // `{{ }}` / `{% %}` sequences in generated HTML ("liquid syntax error") and
    // silently excludes folders whose names start with `_`.
    const nojekyllPath = joinSegments(argv.output, ".nojekyll") as FilePath
    await fs.promises.writeFile(nojekyllPath, "")
    yield nojekyllPath
  },
  async *partialEmit() {},
})
