# Sheet Cutting Planner

Sheet nesting calculator built with React + TypeScript + Vite and Bootstrap 5.

Enter a sheet size and a list of parts, get an optimized cutting layout with a visual plan,
cut list and export.

## Features

- MaxRects nesting with several heuristics and sort orders, best result wins
- Blade kerf and edge margin, optional 90° rotation
- Multiple sheets when parts do not fit on one
- Units: mm, cm, m, in
- SVG layout preview, cut list, utilization and waste summary
- Export to PDF and SVG, print-friendly layout
- Light / dark / system color mode (Bootstrap `data-bs-theme`)
- Project is stored in `localStorage`

## Scripts

```bash
npm install
npm run dev       # dev server
npm run build     # typecheck + production build
npm run preview   # serve the production build
npm run lint      # oxlint
npm run format    # prettier
```

## Project structure

```
src/
  components/   UI panels and the SVG canvas
  hooks/        theme and persisted state
  lib/          packing algorithm, units, exports
  types.ts      shared model
```

## Algorithm

`src/lib/packer.ts` implements a MaxRects bin with four placement heuristics
(best short side, best area, best long side, bottom-left). `src/lib/layout.ts` expands parts
by quantity, sorts them (area, max side, height, width), packs them sheet by sheet and keeps
the variant with the most placed parts, then the fewest sheets, then the densest first sheets.

Kerf is handled by enlarging every piece and the usable sheet area by one kerf width, so the
gap between neighbouring parts is always at least the blade width, while the outer edge stays
exact. Edge margin shrinks the usable area on all four sides.
