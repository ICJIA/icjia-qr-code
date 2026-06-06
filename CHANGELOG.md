# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-06-06

A full rebuild of the QR Code Generator as an Astro static site.

### Added

- Migrated to **Astro** (static SSG) with a canonical project structure.
- **ICJIA center badge** on QR codes — a navy badge with white "ICJIA" text that is always visible; toggle on by default. Codes use error-correction level H so they stay scannable with the badge.
- **QR rendering via `qr-code-styling`** (replacing the CDN `qrcodejs`); SVG export is now path-based instead of one rectangle per pixel.
- **Content pages**: What is a QR code, How QR codes work, Scanning guide, and Best practices.
- **SEO** via `astro-seo`: full Open Graph + Twitter meta, canonical URLs, and a branded `og:image`.
- **Modern UI**: Public Sans (interface) + Fraunces (display) typography, refined light/dark themes, and a responsive header/nav/footer.
- **Dark mode by default**, with a persisted light/dark toggle.
- **Shareable deep links** (`?url=…`) that pre-fill the input and generate a code on load.
- **Vitest** test suite for URL validation and the QR renderer.
- **GitHub Actions CI** (format check, tests, build) and a Content-Security-Policy plus security headers on Netlify.

### Changed

- Generator refactored from a single ~970-line script into focused ES modules.
- Default theme is now dark (previously followed the system preference).
- Build tooling moved from raw Vite to Astro; tests from Jest to Vitest.

### Fixed

- **Stored-XSS vector**: history rows and confirmation dialogs no longer interpolate user URLs into `innerHTML`.
- Removed a duplicate "My QR Codes" button.
- The encoding-confirmation dialog no longer appears for harmless trailing-slash normalization.
- Removed CDN runtime dependencies (`qrcodejs`, FileSaver) in favor of bundled modules.

### Removed

- Legacy files: root `script.js`, `styles.css`, `index.html`; `src/utils/`; Vite/Babel/Jest config; `URL_VALIDATION_IMPROVEMENTS.md`.
- Unused dependencies: `file-saver`, `qrcode`, `jest`, `babel`, `vite`, `terser`, `eslint`.

## [1.0.0]

- Original vanilla-JS QR code generator (Vite build, `qrcodejs` and FileSaver via CDN).
