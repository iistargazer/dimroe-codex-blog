import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

type ColophonOptions = {
  /** the main text of the colophon */
  line?: string
  /** optional fixed year range, e.g. "2026–" (defaults to the page's modified year) */
  year?: string
}

/**
 * Colophon — a hand-set line at the very bottom of every page.
 *
 * A colophon is the page at the back of a book where the printer
 * notes the type, paper, and press used. Bookish sites deserve one.
 */
const Colophon: QuartzComponentConstructor<ColophonOptions> = (opts) => {
  const line = opts?.line ?? "Set by hand"
  const Colophon = ({ fileData }: QuartzComponentProps) => {
    const yr =
      opts?.year ?? new Date(fileData.dates?.modified ?? Date.now()).getFullYear().toString()
    return (
      <p class="colophon">
        <span class="colophon-year">{yr} · </span>
        <span class="colophon-line">{line}</span>
      </p>
    )
  }
  Colophon.displayName = "Colophon"
  Colophon.css = `
.colophon {
  font-family: var(--headerFont);
  font-style: italic;
  font-size: 0.82rem;
  color: var(--gray);
  text-align: center;
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
}
.colophon-year { font-variant-numeric: oldstyle-nums; }
`
  return Colophon
}

export default Colophon
