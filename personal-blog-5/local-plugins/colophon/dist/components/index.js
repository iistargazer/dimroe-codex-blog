// Colophon component — hand-written (no JSX) because this plugin ships
// prebuilt JS. h(tag, props, children) is Preact's hyperscript API; JSX
// compiles to exactly these calls.
import { h } from "preact"

const Colophon = (opts) => {
  const line = opts?.line ?? "Set by hand"
  const Colophon = ({ fileData }) => {
    const yr = opts?.year ?? new Date(fileData.dates?.modified ?? Date.now()).getFullYear().toString()
    return h("p", { class: "colophon" },
      h("span", { class: "colophon-year" }, `${yr} · `),
      h("span", { class: "colophon-line" }, line),
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

export { Colophon }
