# ICJIA QR Generator — Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the vanilla-JS QR generator to a canonical Astro static site with an ICJIA center-logo feature, real content pages, full SEO, a modern UI, and all extraneous files removed.

**Architecture:** Astro SSG (static `dist/`, no adapter) on Netlify. The generator is a single hydrated client island backed by small vanilla ES modules; QR rendering via `qr-code-styling`; URL validation via the existing `validator`-backed modules. Content pages are Markdown through a shared layout. Tests via Vitest.

**Tech Stack:** Astro 5, qr-code-styling, validator, Vitest (+ happy-dom), Ghostscript (EPS→PNG), rsvg-convert (SVG→PNG), Netlify, Node 20.

**Reference:** spec at `docs/superpowers/specs/2026-06-06-icjia-qr-astro-migration-design.md`. Current behavior source: `index.html`, `src/script.js`, `src/utils/*`, `styles.css`, `README.md`.

**Conventions:** Commit after each task. Keep `yarn build` and `yarn test` green from Phase 2 onward. Verify QR library API against current docs via Context7 before relying on a method name.

---

## File Structure

**Created:**

- `astro.config.mjs`, `tsconfig.json`, `vitest.config.js`, `.github/workflows/ci.yml`
- `src/layouts/BaseLayout.astro`, `src/layouts/ContentLayout.astro`
- `src/components/Header.astro`, `Footer.astro`, `Nav.astro`, `ThemeToggle.astro`, `QrGenerator.astro`
- `src/pages/index.astro` + four `.md` content pages
- `src/scripts/qr-renderer.js`, `url-validator.js`, `enhanced-url-validator.js`, `history.js`, `theme.js`, `toast.js`, `logo.js`, `generator.js` (island entry)
- `src/styles/global.css`
- `src/assets/icjia-logo.png` (from EPS), `src/assets/og-image.svg`, `public/og-image.png`

**Deleted (Phase 7):** root `script.js`, `src/script.js`, `src/utils/`, root `styles.css`, root `index.html`, `vite.config.js`, `babel.config.cjs`, `jest.config.js`, `URL_VALIDATION_IMPROVEMENTS.md`.

---

## Phase 1 — Astro Scaffold

### Task 1: Install Astro + base config

**Files:** Modify `package.json`; Create `astro.config.mjs`, `tsconfig.json`.

- [ ] **Step 1: Add Astro + qr-code-styling, update scripts**

```bash
yarn add astro qr-code-styling
yarn add -D vitest happy-dom @vitest/coverage-v8
```

- [ ] **Step 2: Set scripts in `package.json`**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "lint": "eslint . --ext js,astro --fix",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://qr.icjia.cloud",
  output: "static",
  server: { port: 3000 },
});
```

- [ ] **Step 4: Create `tsconfig.json`** (Astro's strict base; code stays JS)

```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro", "src"] }
```

- [ ] **Step 5: Verify install** — Run `yarn astro --version`. Expected: prints a 5.x version.
- [ ] **Step 6: Commit** — `chore: add Astro + qr-code-styling, switch scripts`

### Task 2: BaseLayout + global CSS tokens + no-FOUC theme

**Files:** Create `src/layouts/BaseLayout.astro`, `src/styles/global.css`.

- [ ] **Step 1: `global.css`** — modern design tokens + reset (CSS custom properties for color/space/radius/shadow, light + `[data-theme="dark"]` palettes, base typography via Inter/system stack, `prefers-reduced-motion` guard). Establish tokens now; component polish lands in Phase 6. Seed from the good parts of `styles.css` but rebuild as token-driven.

- [ ] **Step 2: `BaseLayout.astro`** — props `{ title, description, image="/og-image.png" }`. `<head>`: charset/viewport, `<title>`, description, canonical (`new URL(Astro.url.pathname, Astro.site)`), favicons, OG (`og:title/description/image/type/url`), `twitter:card=summary_large_image`, `import "../styles/global.css"`. Inline pre-paint theme script (reads `localStorage.theme` or `prefers-color-scheme`, sets `data-theme` on `<html>` before render → no flash). Body: `<slot/>`. (Header/Footer added in Phase 5.)

- [ ] **Step 3: Temp `src/pages/index.astro`** wrapping `BaseLayout` with an `<h1>QR Code Generator</h1>` placeholder.

- [ ] **Step 4: Verify** — `yarn build` succeeds; `yarn dev` renders the page with no theme flash.
- [ ] **Step 5: Commit** — `feat: add BaseLayout, design tokens, no-FOUC theme`

### Task 3: Netlify + Node 20

**Files:** Modify `netlify.toml`, `.nvmrc`.

- [ ] **Step 1:** `.nvmrc` → `20`.
- [ ] **Step 2:** `netlify.toml` → `command = "yarn build"`, `publish = "dist"`, `NODE_VERSION = "20"`. Drop the manual JS content-type headers (Astro serves correct types). Add security headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
```

- [ ] **Step 3: Verify** — `yarn build`; confirm `dist/` produced.
- [ ] **Step 4: Commit** — `chore: Netlify static deploy + Node 20 + security headers`

---

## Phase 2 — Validators → Vitest (TDD, keep green)

### Task 4: Relocate validators + port tests to Vitest

**Files:** Create `src/scripts/url-validator.js`, `src/scripts/enhanced-url-validator.js`, `vitest.config.js`; move `test/*.test.js`, `test/fixtures/*`, `test/setup.js`.

- [ ] **Step 1: Move validator modules** — copy `src/utils/url-validator.js` → `src/scripts/url-validator.js` and `src/utils/enhanced-url-validator.js` → `src/scripts/enhanced-url-validator.js` (logic unchanged). (Old `src/utils/` deleted in Phase 7.)

- [ ] **Step 2: `vitest.config.js`**

```js
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.js"],
    globals: true,
  },
});
```

- [ ] **Step 3: Update test imports** — in `test/enhanced-url-validation.test.js` and `test/static-url-validation.test.js`, point imports at `../src/scripts/...`. Vitest's `globals: true` keeps `describe/it/expect` working without Babel. Reconcile `test/url-validation.test.js` with the README's "37 tests" claim: either fix its imports and include it, or delete it as redundant with the static suite — decide while reading it; do not leave it half-wired.

- [ ] **Step 4: Run failing-first check** — `yarn test`. Expected initially: failures only from stale import paths; fix paths until green.
- [ ] **Step 5: Verify** — `yarn test` all green.
- [ ] **Step 6: Commit** — `test: migrate URL validator tests to Vitest`

---

## Phase 3 — Generator Island (parity + cleanup)

### Task 5: qr-renderer module (wrap qr-code-styling)

**Files:** Create `src/scripts/qr-renderer.js`, `test/qr-renderer.test.js`.

- [ ] **Step 1: Confirm API** — via Context7, confirm `qr-code-styling` constructor options (`width/height/type/data/image/qrOptions.errorCorrectionLevel/imageOptions/dotsOptions/backgroundOptions`), `.append(el)`, `.update(opts)`, and `.getRawData(ext)` return type + accepted extensions (`png|jpeg|webp|svg`). Map UI "jpg" → "jpeg".

- [ ] **Step 2: `qr-renderer.js`**

```js
import QRCodeStyling from "qr-code-styling";

const SIZE = 320;
const EXT = { png: "png", jpg: "jpeg", jpeg: "jpeg", webp: "webp", svg: "svg" };

export function createQr({ data, image }) {
  return new QRCodeStyling({
    width: SIZE,
    height: SIZE,
    type: "canvas",
    data,
    image,
    qrOptions: { errorCorrectionLevel: "H" },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 6,
      imageSize: 0.2,
      hideBackgroundDots: true,
    },
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
  });
}

export async function getBlob(qr, format) {
  const extension = EXT[format] || "png";
  return qr.getRawData(extension); // Promise<Blob> in browser
}
```

- [ ] **Step 3: Smoke test `test/qr-renderer.test.js`** — assert `createQr({data:'https://icjia.illinois.gov'})` returns an object exposing `append`/`update`/`getRawData`; assert `EXT` maps `jpg→jpeg`. (Pure/instance checks under happy-dom; do not assert pixel output.)

- [ ] **Step 4: Verify** — `yarn test` green.
- [ ] **Step 5: Commit** — `feat: qr-renderer wrapper around qr-code-styling`

### Task 6: Generator markup (QrGenerator.astro)

**Files:** Create `src/components/QrGenerator.astro`.

- [ ] **Step 1:** Port the markup from `index.html` (input + generate, qr-container, url-display, copy/format-select/download/reset, encoding-confirm dialog container, test-warning, best-practices, toast-container, history modal). **Changes:** exactly **one** "My QR Codes" button (`#history-btn`); add a **logo toggle** (`<input type="checkbox" id="logo-toggle" checked>` "Add ICJIA logo"); keep all ARIA. Add `<script>` importing the island entry: `import "../scripts/generator.js"`.

- [ ] **Step 2:** Mount in `src/pages/index.astro` (replace placeholder) with intro copy linking to the doc pages.
- [ ] **Step 3: Verify** — `yarn dev`; markup renders (wiring lands next task).
- [ ] **Step 4: Commit** — `feat: QrGenerator markup (single history btn, logo toggle)`

### Task 7: Island modules (theme, toast, history, logo) + entry

**Files:** Create `src/scripts/theme.js`, `toast.js`, `history.js`, `logo.js`, `generator.js`.

- [ ] **Step 1: `theme.js`** — `initThemeToggle(checkboxEl)`: sync checkbox to current `data-theme`, on change set attribute + persist `localStorage.theme`. (Pre-paint set already in BaseLayout.)
- [ ] **Step 2: `toast.js`** — `showToast(message, type, duration=3000)` ported from `src/script.js:330-409`, building DOM with `textContent` (multiline → `<p>` per line), correct `role`/`aria-live` by type.
- [ ] **Step 3: `history.js`** — `getHistory/addToHistory/clearHistory` (localStorage `qrCodeHistory`, max 50) and `renderHistory(tbody, onPick)` that builds rows with **`textContent`/created nodes** (NO `innerHTML` of URLs — closes XSS), incl. the per-row regenerate handler. Port modal open/close + delete-confirmation dialog (with focus trap) from `src/script.js:478-590,888-970`.
- [ ] **Step 4: `logo.js`** — `import logoUrl from "../assets/icjia-logo.png"` (added Phase 4; until then export `null`); `isLogoEnabled(checkboxEl)`, `getLogoImage()` → `logoUrl | undefined`, persist preference in `localStorage.logoEnabled`.
- [ ] **Step 5: `generator.js`** (island entry) — `DOMContentLoaded`: feature detection (clipboard/Blob/localStorage/URL); wire theme/history/logo; Generate flow using `sanitizeAndValidateURL` + the encoding-confirm and double-slash dialogs (DOM via safe nodes), then `createQr` + `.append`; copy (PNG blob → clipboard); download (`getBlob` + anchor download or library `.download`); reset; Enter-to-submit; global error handlers → toast. Behavior mirrors `src/script.js` minus the removed duplicate button and innerHTML interpolation.

- [ ] **Step 6: Verify (manual)** — `yarn dev`: generate a QR, copy, download all four formats, reset, history add/regenerate/delete, theme toggle. Use `viewcap` for a screenshot.
- [ ] **Step 7: Commit** — `feat: generator island parity (XSS-safe, single button)`

---

## Phase 4 — Logo (EPS → PNG)

### Task 8: Convert EPS → high-res PNG

**Files:** Create `src/assets/icjia-logo.png`.

- [ ] **Step 1: Convert**

```bash
gs -dSAFER -dEPSCrop -sDEVICE=pngalpha -r600 \
  -o src/assets/icjia-logo.png \
  '/Users/cschweda/Downloads/design_files/_ICJIA Logo/ICJIAblue [Converted].eps'
```

- [ ] **Step 2: Fallback if gs chokes on the DOS-EPS header** — extract the PostScript section (header bytes give PS start=32, length) into a clean `.eps`, then re-run gs. Verify output with `file src/assets/icjia-logo.png` (expect PNG, sane dimensions) and a `viewcap` screenshot.
- [ ] **Step 3:** Sample the dominant blue hex from the PNG (for later token/og:image use); note it in the commit body.
- [ ] **Step 4: Commit** — `assets: ICJIA logo PNG from EPS (high-res, transparent)`

### Task 9: Wire logo into rendering + verify scannability

**Files:** Modify `src/scripts/logo.js`, `generator.js`.

- [ ] **Step 1:** Finalize `logo.js` import of `icjia-logo.png`; pass `getLogoImage()` into `createQr` when the toggle is on; on toggle change, re-render the current QR.
- [ ] **Step 2: Verify scannability (hard gate)** — generate a logo QR, screenshot via `viewcap`, and **scan with a real phone**. If it fails, lower `imageSize` toward 0.15 and/or increase `imageOptions.margin`; re-verify. Confirm toggle-off renders a plain QR and SVG export still includes the logo.
- [ ] **Step 3: Commit** — `feat: ICJIA center logo with toggle (level-H, scannable)`

---

## Phase 5 — Content Pages, Nav, SEO, og:image

### Task 10: ContentLayout + Nav + Header/Footer

**Files:** Create `src/layouts/ContentLayout.astro`, `src/components/Nav.astro`, `Header.astro`, `Footer.astro`, `ThemeToggle.astro`; modify `BaseLayout.astro`.

- [ ] **Step 1:** `Header` (site title + `Nav` + `ThemeToggle`) and `Footer` (ICJIA attribution + repo link, `rel="noopener noreferrer"`); render both in `BaseLayout` around the slot. `Nav` links: Home, What is a QR code, How QR codes work, Scanning guide, Best practices, with `aria-current` on the active path.
- [ ] **Step 2:** `ContentLayout` wraps `BaseLayout` with a `.prose` container for Markdown.
- [ ] **Step 3: Verify** — `yarn build`; nav appears on home.
- [ ] **Step 4: Commit** — `feat: header/nav/footer + ContentLayout`

### Task 11: Four content pages

**Files:** Create `src/pages/what-is-a-qr-code.md`, `how-qr-codes-work.md`, `scanning-guide.md`, `best-practices.md`.

- [ ] **Step 1:** Each `.md` starts with frontmatter `layout: ../layouts/ContentLayout.astro`, plus `title`/`description`. Port content from `README.md`: "What is a QR Code" (≈165-167), "How QR Codes Work" (≈169-204, keep the 4 numbered stages + reference links), "Scanning QR Codes" (≈206-225), "Best Practices" (≈227-232). Tighten prose for the web; keep external reference links with `rel`.
- [ ] **Step 2: Verify** — all four routes render with correct titles; nav `aria-current` works.
- [ ] **Step 3: Commit** — `feat: QR educational content pages`

### Task 12: og:image (SVG → PNG)

**Files:** Create `src/assets/og-image.svg`, `public/og-image.png`.

- [ ] **Step 1:** Author `og-image.svg` at 1200×630 — ICJIA-blue background/accent (use the sampled hex), a stylized QR motif, "QR Code Generator" headline, and `qr.icjia.cloud`. Modern, high-contrast, minimal.
- [ ] **Step 2: Convert** — `rsvg-convert -w 1200 -h 630 src/assets/og-image.svg -o public/og-image.png`; verify with `file` + `viewcap`.
- [ ] **Step 3:** Confirm `BaseLayout` `og:image` resolves to `/og-image.png` (absolute via `Astro.site`).
- [ ] **Step 4: Commit** — `feat: branded og:image (SVG→PNG) + SEO meta`

---

## Phase 6 — Modern UI Pass

### Task 13: Component-level polish

**Files:** Modify `src/styles/global.css` and component `<style>` where scoped.

- [ ] **Step 1:** Invoke the `frontend-design` skill for direction; refine per spec §8 — card generator, type scale, ICJIA-blue accent, soft elevation, 12–16px radii, restrained micro-interactions, polished true dark mode. Style: input/primary button, format-select/download, encoding dialog, toasts, history modal/table, theme + logo toggles, content `.prose`.
- [ ] **Step 2:** Preserve accessibility — focus rings, `forced-colors`, `prefers-reduced-motion`, print styles, ARIA/live regions intact.
- [ ] **Step 3: Verify (hard gate)** — `viewcap` screenshots in **light + dark** at **desktop + mobile** widths; check contrast (WCAG AA) with the `contrastcap`/`axecap` tools. Iterate until clean.
- [ ] **Step 4: Commit** — `style: modern UI refresh (light/dark, responsive, a11y)`

---

## Phase 7 — Cleanup & Quality

### Task 14: Delete extraneous files + prune deps

**Files:** Delete per spec §10; modify `package.json`.

- [ ] **Step 1: Delete** — `script.js`, `src/script.js`, `src/utils/`, `styles.css`, `index.html`, `vite.config.js`, `babel.config.cjs`, `jest.config.js`, `URL_VALIDATION_IMPROVEMENTS.md` (fold its substance into the README first).
- [ ] **Step 2: Remove deps** — `file-saver`, `qrcode`, `jest`, `babel-jest`, `@babel/core`, `@babel/preset-env`, `@vitejs/plugin-legacy`, `terser`, `vite`. Keep `validator`, `astro`, `qr-code-styling`, `vitest`, `happy-dom`, eslint/prettier.
- [ ] **Step 3: Verify (hard gate)** — `yarn install`, then `yarn build` AND `yarn test` both green; `yarn dev` smoke-check the generator still works.
- [ ] **Step 4: Commit** — `chore: remove legacy files + unused deps`

### Task 15: CI + README refresh

**Files:** Create `.github/workflows/ci.yml`; modify `README.md`.

- [ ] **Step 1: `ci.yml`**

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "yarn" }
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn test
      - run: yarn build
```

- [ ] **Step 2: README** — update for Astro (dev/build/preview, structure, `qr-code-styling`, logo feature, content pages); add the og:image at top; fix the stale "37 tests"/TLD claims; absorb the URL-validation-improvements notes.
- [ ] **Step 3: Verify** — `yarn lint && yarn test && yarn build` all green.
- [ ] **Step 4: Commit** — `ci: GitHub Actions + README refresh for Astro`

---

## Self-Review

**Spec coverage:** §3 structure → Tasks 1-2,6,10-11; §4 generator parity + cleanup → Tasks 5-7; §5 logo → Tasks 8-9; §6 content/nav/SEO → Tasks 10-12; §7 og:image → Task 12; §8 modern UI → Task 13; §9 tests/CI → Tasks 4,5,15; §10 deletions → Task 14; phases (§11) map 1:1. No gaps.

**Placeholders:** None — commands, configs, code, and source line refs are concrete. Two deliberate decision-points (Task 4 `url-validation.test.js` keep-or-delete; Task 9 `imageSize` tuning) are framed as "decide and don't leave half-done," not vague TODOs.

**Type/name consistency:** `createQr`/`getBlob`/`EXT` (Task 5) reused in Tasks 7,9; `getLogoImage`/`isLogoEnabled` (Task 7) finalized in Task 9; `showToast`, `getHistory/addToHistory/clearHistory/renderHistory` consistent across tasks; `sanitizeAndValidateURL` matches the existing validator export.
