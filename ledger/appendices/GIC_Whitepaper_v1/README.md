# Appendix III - The Existential Loop (GIC Whitepaper v1)

This folder contains the hybrid-format appendix for the GIC Unified Whitepaper v1.

Contents:
- `Appendix_III_Existential_Loop.tex`: LaTeX source (hybrid: IEEE-style + ledger inscriptions)
- `figures/`: TikZ figure sources (optional; main .tex includes inline TikZ for portability)

## Build

Prerequisites:
- TeX Live (or MacTeX/MiKTeX) with `tikz`, `titlesec`, `geometry`, `hyperref`, `enumitem`
- `latexmk` (recommended)

Build commands:

```bash
latexmk -pdf Appendix_III_Existential_Loop.tex
# or
pdflatex Appendix_III_Existential_Loop.tex && pdflatex Appendix_III_Existential_Loop.tex
```

Output:
- `Appendix_III_Existential_Loop.pdf`

## Notes

- Figures are embedded via TikZ to ensure vector quality and reproducibility.
- If you prefer externalized PDFs, enable TikZ externalization and render to `figures/`.
