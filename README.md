# Sheet Cutting Planner

**Website: <https://sheet-cutting-planner.netlify.app/>**

Sheet nesting calculator built with React + TypeScript + Vite and Bootstrap 5.

Enter a sheet size and a list of parts, get an optimized cutting layout with a visual plan,
cut list and export.

## Features

- MaxRects nesting with several heuristics and sort orders, best result wins
- Blade kerf and edge margin, optional 90° rotation
- Multiple sheets when parts do not fit on one
- Units: mm, cm, m, in. Lengths are stored in millimetres, switching units only changes the display
- Number inputs accept a comma or a dot as the decimal separator, ↑ / ↓ change the value by one step
- SVG layout preview, cut list, utilization and waste summary
- Ten part colors; parts 11-40 reuse them with a `/`, `\` or `×` hatch, so every part stays
  distinguishable on screen, in SVG and in PDF
- Export to PDF (with a list of parts that were not placed) and SVG (scaled in millimetres),
  print-friendly layout
- Light / dark / system color mode (Bootstrap `data-bs-theme`), printing always uses the light theme
- Project is stored in `localStorage`, projects saved by older versions are migrated on load

## Scripts

```bash
npm install
npm run dev       # dev server
npm run build     # typecheck + production build
npm run preview   # serve the production build
npm test          # vitest, run once
npm run test:watch
npm run lint      # oxlint
npm run format    # prettier
```

## Project structure

```text
public/         icons, link preview image, robots.txt, sitemap.xml, Netlify headers, theme.js
src/
  components/   UI panels and the SVG canvas
  hooks/        theme and persisted state
  lib/          packing algorithm, units, exports, *.test.ts next to the code they cover
  donate.ts     card number and links for the "Buy me a coffee" window
  types.ts      shared model
```

The layout uses one column on phones and tablets, two columns from 992px (inputs and
results) and three from 1200px (inputs, plan, summary). From 992px each column scrolls on
its own.

## Algorithm

`src/lib/packer.ts` implements a MaxRects bin with four placement heuristics
(best short side, best area, best long side, bottom-left). `src/lib/layout.ts` expands parts
by quantity, sorts them (area, max side, height, width), packs them sheet by sheet and keeps
the variant with the most placed parts, then the fewest sheets, then the densest first sheets.

Kerf is handled by enlarging every piece and the usable sheet area by one kerf width, so the
gap between neighbouring parts is always at least the blade width, while the outer edge stays
exact. Edge margin shrinks the usable area on all four sides.

One layout holds up to 2000 pieces on up to 60 sheets. Pieces beyond these limits, and pieces
larger than the usable sheet area, are listed as not placed.

## Deploy to Netlify

A static site, no server needed. The settings are in the project:

- `netlify.toml`: build command `npm run build`, publish folder `dist`, Node.js 22;
- `public/_headers`: security headers (a strict Content-Security-Policy: the app loads nothing from
  other sites) and a long cache for `assets/` (their file names contain a hash). Vite copies the
  file into `dist`, so it works for every way of deploying.

Ways to deploy:

1. **From the Git repository.** Create a Netlify site from the repository, the build settings come
   from `netlify.toml`.
2. **Drag and drop.** `npm run build`, then drop the `dist` folder on <https://app.netlify.com/drop>.
3. **Netlify CLI.** `npx netlify-cli deploy --prod --dir=dist` after `npm run build` and logging in.

The color mode is set before the page is drawn by `public/theme.js` (same storage key as
`src/hooks/useTheme.ts`), so a dark theme does not flash white. It is a file rather than an inline
script because the CSP allows only scripts served by the site itself.

### Search engines and link previews

- `index.html`: title and description with what people search for ("cut list optimizer", plywood,
  MDF…), `canonical`, Open Graph (the link preview image for Telegram and social networks is
  `public/og-image.png`, 1200×630) and structured data (JSON-LD is data, not a script, the CSP does
  not block it): `WebSite` gives the site's name in results ("Sheet Cutting Planner", not the host's
  "Netlify"), `WebApplication` describes the app.
- `#root` holds a short text about the app: search engines read it, people only see it if the app
  takes more than half a second to load. React replaces it on start.
- `public/robots.txt` and `public/sitemap.xml`.
- Icons as files (Google does not show an icon from a `data:` URL in results): `favicon.ico` (16,
  32 and 48 px, what Google's crawler takes most readily), `favicon.svg` and `apple-touch-icon.png`
  (180 px, iPhone home screen). The `.ico`, the touch icon and the logo on `og-image.png` are drawn
  from `public/favicon.svg`: redraw them when the logo changes.
- `public/googled22276b9a01c7106.html` confirms ownership in Google Search Console. If the console
  offers a different file for this site, replace it.

The site address is written in full in `index.html` (`canonical`, `og:url`, `og:image`, JSON-LD),
`robots.txt` and `sitemap.xml`: when moving to another domain, change it in all three
(`grep -rn sheet-cutting-planner.netlify.app index.html public`).

## Buy me a coffee

Put a card number (`card`) and/or payment pages (`links`: a PUMB MoneyBox, a monobank jar, Ko-fi…)
in `src/donate.ts`. The navbar then shows a ☕ button that opens a window with the links and the
number with a Copy button. While both are empty, there is no button.

There is one link now, to a PUMB MoneyBox: people pay there with Google Pay, Apple Pay or a QR code
from their bank app, and no card number is shown. The link's `title` follows "Support via", so it
can name the service or the way to pay.

Everything in that file ends up in the site's code, so it is public: only the number, never the
expiry date or the CVV. Widgets and image buttons from other sites (such as the Buy Me a Coffee
script) are not used, the CSP would block them; plain links work.
