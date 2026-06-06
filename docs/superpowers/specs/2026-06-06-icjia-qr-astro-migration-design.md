# ICJIA QR Code Generator — Astro Migration, Center Logo, Content Site & Modern UI

**Date:** 2026-06-06
**Status:** Approved — ready for implementation planning
**Branch:** `feat/astro-migration`

## 1. Goal & Scope

Migrate the existing vanilla-JS QR code generator (`qr.icjia.cloud`) to a **canonical Astro static site** deployed on Netlify, while:

1. Folding in the "Tier 1" cleanup (remove dead code, consolidate dependencies, fix the duplicate history button, close a stored-XSS hole, align README/tests).
2. Adding an **ICJIA center-logo** feature using `qr-code-styling`.
3. Surfacing the README's QR educational content as **real, SEO-indexed pages**.
4. Adding full **SEO meta + a generated `og:image`**.
5. Delivering a **modern, sleek UI refresh** (not a straight port of the current look).
6. **Deleting all extraneous files** once the migration builds and is verified.

Out of scope this round: Preact/framework rewrite, Playwright E2E (noted as a future stretch), multi-payload QR types (Wi-Fi/vCard/etc.), new TLD/IDN validation policy.

## 2. Decisions (locked)

| Decision                 | Choice                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| App shell                | **Astro** static site (SSG), Netlify                                                           |
| Generator implementation | **Vanilla JS ES modules** hydrated as one Astro client island (no UI framework)                |
| QR library               | **qr-code-styling** (replaces CDN `qrcodejs` + `file-saver` + the unused npm `qrcode`)         |
| URL validation           | Keep `validator` + existing validator logic (relocated)                                        |
| Logo asset               | `ICJIAblue [Converted].eps` → **high-res transparent PNG** via Ghostscript (no SVG conversion) |
| Logo behavior            | Toggle "Add ICJIA logo", **default ON**                                                        |
| Content                  | **Full content site** — 4 Markdown pages + generator home                                      |
| Tests                    | **Migrate Jest → Vitest** (Vite-native; removes Babel + `NODE_OPTIONS` hack)                   |
| CI                       | GitHub Actions: install → lint → test → `astro build`                                          |
| UI                       | **Modern refresh** (see §8)                                                                    |
| Node                     | Bump to **Node 20** (Astro 5 requires ≥18.20.8) on Netlify + `.nvmrc`                          |

## 3. Canonical Astro Directory Structure

```
icjia-qr-code/
├── astro.config.mjs              # replaces vite.config.js
├── tsconfig.json                 # Astro default (editor IntelliSense; code stays JS)
├── package.json
├── netlify.toml
├── .nvmrc (→ 20) · .npmrc · .yarnrc · .gitignore
├── public/                       # served verbatim
│   ├── favicon.svg · favicon.png · apple-touch-icon.png
│   └── og-image.png              # generated, 1200×630
├── src/
│   ├── assets/
│   │   └── icjia-logo.png        # from EPS, Astro-optimized
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Nav.astro
│   │   ├── ThemeToggle.astro
│   │   └── QrGenerator.astro     # the interactive island
│   ├── layouts/
│   │   ├── BaseLayout.astro      # <head>, SEO/OG meta, theme init, header/footer
│   │   └── ContentLayout.astro   # prose wrapper for the doc pages
│   ├── pages/
│   │   ├── index.astro           # generator (home)
│   │   ├── what-is-a-qr-code.md
│   │   ├── how-qr-codes-work.md
│   │   ├── scanning-guide.md
│   │   └── best-practices.md
│   ├── scripts/                  # client-side ES modules used by the island
│   │   ├── qr-renderer.js        # wraps qr-code-styling
│   │   ├── url-validator.js      # relocated from src/utils/
│   │   ├── enhanced-url-validator.js
│   │   ├── history.js
│   │   ├── theme.js
│   │   ├── toast.js
│   │   └── logo.js
│   └── styles/
│       └── global.css            # modern UI (rebuilt, not a verbatim port)
└── test/                         # Vitest validator + qr-renderer tests
```

Canonical Astro dirs (`src/pages`, `src/layouts`, `src/components`, `src/assets`, `public`) are honored. Client ES modules live in `src/scripts/`. The four doc pages are plain Markdown using `layout:` frontmatter → `ContentLayout` (simpler and just as canonical as a content collection for four pages).

## 4. Generator Island (vanilla JS modules)

`QrGenerator.astro` renders the markup and a single client `<script>` that imports and wires the modules. **Feature parity preserved** with today's app:

- URL input + Generate, Enter-to-submit
- URL validation + the encoding-confirmation dialog (before/after diff)
- Double-trailing-slash warning + correction
- Copy-to-clipboard (PNG blob)
- Download in **PNG / JPG / WEBP / SVG**
- Reset
- History modal (localStorage, max 50) + delete-with-confirmation
- Theme toggle (persisted)
- Toast notifications
- "Test your QR code" warning + best-practices teaser
- Required-browser-feature detection; global error/unhandledrejection → toast

**Module responsibilities:**

- `qr-renderer.js` — wraps `qr-code-styling`: build instance (`width/height 320`, `errorCorrectionLevel: 'H'`, optional `image`), render into the target node, and export raw data per format. Single source of truth for QR creation.
- `url-validator.js` / `enhanced-url-validator.js` — unchanged validation logic, relocated; still backed by `validator`.
- `history.js` — localStorage CRUD + safe table rendering.
- `theme.js` — theme read/persist/toggle (paired with the no-FOUC head script).
- `toast.js` — accessible toast creation/teardown.
- `logo.js` — logo toggle state (+ persisted preference) and supplying the logo image to `qr-renderer`.

**Cleanup folded in here:**

- No CDN `<script>` tags — everything bundled by Astro/Vite.
- Root `script.js` and `src/script.js` are not carried over.
- **One** history button (today there are two — one hardcoded in HTML, one created in JS).
- History rows and the encoding dialog are built with `textContent`/DOM nodes instead of interpolating user URLs into `innerHTML` — closes the stored-XSS vector via localStorage.
- External links get `rel="noopener noreferrer"`.

## 5. Logo Handling (EPS → high-res PNG)

- Convert `~/Downloads/design_files/_ICJIA Logo/ICJIAblue [Converted].eps` → `src/assets/icjia-logo.png` with Ghostscript (`-dEPSCrop`, `pngalpha`, high resolution, cropped to bounding box). If the DOS-EPS binary header trips up `gs`, extract the PostScript section using the header byte offsets and retry.
- In `qr-code-styling`: `image: <logo>`, `imageOptions: { imageSize ≈ 0.2, margin: a few px, hideBackgroundDots: true }`, `errorCorrectionLevel: 'H'`. The library paints a white knockout pad, so the blue mark stays legible in both light and dark themes.
- **Toggle** "Add ICJIA logo" (default ON); when off, render a plain QR.
- SVG export embeds the logo as a data-URI `<image>`, so all four export formats include the mark.
- **Scannability is a hard acceptance criterion** — generated codes (with logo, level H) must scan on a real phone; keep `imageSize` ≤ ~0.2 and verify.

## 6. Content Pages, Nav & SEO

- Four Markdown pages built from the existing README content: **What is a QR code**, **How QR codes work** (data analysis, error correction, structure, module placement), **Scanning guide** (iPhone/Android/other), **Best practices** (testing, size, contrast, quiet zone). External reference links carried over.
- `Nav` in the header links the generator + four pages; `Footer` with ICJIA attribution + repo link.
- `BaseLayout` emits full meta: `<title>`, `description`, canonical, `og:title/description/image/type/url`, `twitter:card=summary_large_image`. Per-page title/description via layout props.
- Home (generator) gets a short intro that links into the docs.

## 7. og:image

- Author a modern, sleek **SVG at 1200×630**: ICJIA-blue brand color (sampled from the converted logo PNG), a stylized QR motif, "QR Code Generator", and `qr.icjia.cloud`.
- Convert SVG → `public/og-image.png` with `rsvg-convert`.
- Referenced from the social meta in `BaseLayout` and shown at the top of the README.

## 8. Modern UI Refresh

Rebuild the styling for a clean, professional, **government-appropriate but modern** feel — not a verbatim port of the current CSS. Direction:

- **Layout:** card-based generator with generous whitespace; clear visual hierarchy; mobile-first responsive.
- **Type:** modern sans (Inter or a refined system stack), deliberate type scale.
- **Color:** ICJIA-blue accent; neutral surfaces; **polished true dark mode** (not a naive invert); WCAG AA contrast.
- **Depth & shape:** soft elevation/shadows, ~12–16px radii, subtle borders.
- **Interaction:** smooth, restrained micro-interactions (hover/active/focus), visible focus rings, `prefers-reduced-motion` respected.
- **Components refreshed:** input + primary button, format select + download, the encoding-confirm dialog, toasts, the history modal/table, theme toggle, and the new logo toggle.
- **Preserve every existing accessibility win** (ARIA roles, live regions, focus trapping, high-contrast/forced-colors, print styles, sr-only announcements).
- Execution guided by the `frontend-design` skill to avoid a generic look.

**Acceptance:** visually verified via screenshots (light + dark, desktop + mobile widths) before completion.

## 9. Tests & CI

- Port the existing validator unit tests **Jest → Vitest** (logic unchanged; relocate import paths). Remove `jest.config.js`, `babel.config.cjs`, and the `jest`/`babel-jest`/`@babel/*` devDeps + the `NODE_OPTIONS` test-script hack.
- Add a small **Vitest smoke test** for `qr-renderer` (renders with logo on/off; export helpers return data for each format) — using jsdom/happy-dom where DOM/canvas is needed, otherwise testing pure data-prep.
- Add **GitHub Actions CI**: `yarn install --frozen-lockfile` → `yarn lint` → `yarn test` → `yarn build`.

## 10. Files Removed (final cleanup phase, after the build is verified)

`script.js` (root, dead) · `src/script.js` · `src/utils/` · `styles.css` (root) · `index.html` (root) · `vite.config.js` · `babel.config.cjs` · `jest.config.js` · `URL_VALIDATION_IMPROVEMENTS.md` (content folded into README).

**Deps removed:** `file-saver`, `qrcode`, CDN `qrcodejs`, `jest`, `babel-jest`, `@babel/core`, `@babel/preset-env`, `@vitejs/plugin-legacy`, `terser`, `vite` (Astro brings its own).
**Deps added:** `astro`, `qr-code-styling`, `vitest` (+ `jsdom`/`happy-dom`), and an Astro Netlify/static setup as needed.
**Kept:** `validator`, ESLint + Prettier (config updated for Astro).

## 11. Implementation Phases

1. **Scaffold** — Astro project, `astro.config.mjs`, `BaseLayout`, modern `global.css` base, Netlify + Node 20 config; static shell builds.
2. **Generator parity** — `QrGenerator` island on `qr-code-styling` (vanilla modules), all features working, cleanup folded in (no CDN, no dead code, one history button, XSS-safe DOM).
3. **Logo** — EPS→PNG conversion, toggle, `qr-code-styling` image options, scannability verified.
4. **Content + SEO + og:image** — four Markdown pages, Nav/Footer, full meta, generated `og-image.png`.
5. **Modern UI pass** — refine all components per §8; verify light/dark + responsive via screenshots.
6. **Cleanup & quality** — delete extraneous files (§10), Vitest migration, CI, README refresh (incl. og:image).

## 12. Acceptance Criteria

- `yarn build` produces a deployable static `dist/`; Netlify config valid.
- Generator reaches **feature parity** with the current app, plus the logo toggle.
- Logo-bearing codes (level H) **scan on a real device**.
- All four download formats work and include the logo when enabled; SVG is path-based (no per-pixel hack).
- No CDN runtime dependencies; no dead/duplicate code; XSS vector closed.
- Four content pages render with correct SEO/OG meta; `og-image.png` present and referenced.
- Modern UI verified in light/dark at desktop + mobile widths; accessibility preserved.
- Vitest suite green; CI workflow present; README updated; extraneous files deleted.
