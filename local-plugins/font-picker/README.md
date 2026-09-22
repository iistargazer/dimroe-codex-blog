# font-picker

An "Aa" button beside the theme toggle opens a panel of font presets —
including the pairings used by ewan.my (Lora) and notes.aarnphm.xyz
(grotesque body). The choice persists per visitor in localStorage and is
applied by rewriting the `--headerFont` / `--bodyFont` / `--codeFont`
variables at runtime; nothing in the build changes.

Add or edit presets in `quartz/static/font-presets.json`. Family names
must match Google Fonts exactly.
