# ICJIA QR Code Generator

![ICJIA QR Code Generator](./public/og-image.png)

A modern, accessible QR code generator built with [Astro](https://astro.build).
Turn any URL into a downloadable QR code — optionally branded with the ICJIA
badge in the center — and download it as PNG, JPG, WEBP, or SVG.

**Live site:** https://qr.icjia.cloud

## Features

- Generate a QR code from any valid URL (error-correction level **H**)
- Optional **ICJIA center badge** (navy badge with white "ICJIA" text, always visible) — toggle on/off
- Download as **PNG, JPG, WEBP, or SVG**; copy to clipboard
- **Dark mode by default** with a persisted light/dark toggle
- Robust **URL validation and encoding** (spaces, special characters, trailing/duplicate slashes) with a confirmation step before any change
- **QR code history** stored locally in your browser (never sent anywhere)
- **Shareable deep links**: `https://qr.icjia.cloud/?url=https://example.com` pre-fills and generates
- Educational content pages: what QR codes are, how they work, scanning, and best practices
- Accessible (WCAG AA contrast, keyboard navigation, screen-reader support, reduced-motion and print styles) and fully responsive

## Tech stack

- **Astro** static site (no server runtime)
- **[qr-code-styling](https://github.com/kozakdenys/qr-code-styling)** for rendering and export
- **[validator](https://github.com/validatorjs/validator.js)** for URL validation
- **[astro-seo](https://github.com/jonasmerlin/astro-seo)** for Open Graph / Twitter / canonical meta
- **Public Sans** + **Fraunces** (self-hosted variable fonts)
- **Vitest** for tests, **Prettier** for formatting
- Deployed on **Netlify**

## Project structure

```
src/
├── assets/        icjia-badge (PNG/SVG), og-image.svg  (build-optimized assets)
├── components/    Header, Nav, Footer, ThemeToggle, QrGenerator
├── layouts/       BaseLayout (SEO, theme), ContentLayout (prose)
├── pages/         index.astro + 4 Markdown content pages
├── scripts/       client ES modules: generator, qr-renderer, validators,
│                  history, theme, toast, logo, dialogs
└── styles/        global.css (design tokens + components)
public/            favicons, og-image.png
test/              Vitest suites (URL validation, qr-renderer)
```

## Prerequisites

- Node.js >= 22.12 (Astro 6 requirement)
- Yarn 1.x (this project uses Yarn — do not use npm)

## Getting started

```bash
yarn install
yarn dev        # dev server at http://localhost:3000
```

## Scripts

- `yarn dev` — start the dev server
- `yarn build` — build the static site to `dist/`
- `yarn preview` — preview the production build locally
- `yarn test` — run the Vitest suite
- `yarn test:watch` — run tests in watch mode
- `yarn lint` — check formatting (Prettier)
- `yarn format` — format the codebase (Prettier)

## How the center badge stays scannable

QR codes include Reed–Solomon error correction. This tool generates at level
**H (~30% recoverable)**, so a small center badge can overlay the code without
breaking it. The badge is kept to ~20% of the code's width with a white "quiet"
gap around it. **Always test a branded code on a real device before publishing
it** — the app reminds you to do this on every generation.

## URL validation

Only well-formed `http`/`https` URLs are accepted. The validator:

- requires a valid protocol and host,
- rejects unescaped spaces (and suggests an encoded version),
- encodes special and international characters,
- normalizes duplicate and trailing slashes,

and shows a confirmation dialog whenever it needs to modify your URL, so a
printed code never points somewhere unexpected.

## Deployment

Netlify builds with `yarn build` and publishes `dist/` (see `netlify.toml`,
which also sets a Content-Security-Policy and other security headers). The
project is a static site and can be hosted on any static host.

## License

MIT — see [LICENSE](LICENSE).
