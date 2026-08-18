<div align="center">
  <img src="./public/favicon.svg" width="88" height="88" alt="HTooL icon" />
  <h1>HTooL</h1>
  <p>A browser-first utility suite that brings everyday tools into one focused, dependable workspace.</p>
  <p>
    <a href="https://htool.vercel.app/">Live demo</a>
    ·
    <a href="https://github.com/Hughhhhcoder/HTooL/issues/new/choose">Report an issue</a>
    ·
    <a href="./CONTRIBUTING.md">Contribute</a>
  </p>
</div>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/Hughhhhcoder/HTooL/actions/workflows/ci.yml"><img src="https://github.com/Hughhhhcoder/HTooL/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI status" /></a>
  <a href="https://github.com/Hughhhhcoder/HTooL/issues"><img src="https://img.shields.io/github/issues/Hughhhhcoder/HTooL?color=2f3f63" alt="GitHub Issues" /></a>
  <a href="https://htool.vercel.app/"><img src="https://img.shields.io/badge/demo-htool.vercel.app-2f3f63" alt="Live demo" /></a>
</p>

## What is HTooL?

HTooL is a small, task-oriented toolkit for writing, development, and everyday data handling. It keeps most work in the browser and avoids turning simple utilities into an account-based platform.

## Tools

| Group | Tool | Capabilities |
| --- | --- | --- |
| Writing | Markdown editor | Editing, toolbar actions, live preview, local folder access, and saving |
| Writing | Markdown ↔ HTML | Two-way conversion, preview, copy, and download |
| Image & encoding | Image converter | Single/batch conversion, PNG/JPG/WebP/GIF selection, and quality control |
| Image & encoding | QR code tool | Text/URL generation, size and color settings, image decoding, and download |
| Image & encoding | Drawing board | Brush, eraser, color/size controls, and PNG export |
| System & data | Data processor | Regex testing, URL encoding/decoding, Base64, MD5, and SHA-256 |
| System & data | IP lookup | IPv4 location, timezone, and network information |

## Highlights

- Browser-first: image conversion, QR codes, drawing, and text processing run locally by default.
- Lazy-loaded tools: heavier Markdown and QR dependencies load only when their tools are opened.
- Focused interface: responsive layouts, light/dark mode, and clear task groups.
- Verifiable quality gates: unit/component tests, E2E flows, bundle budgets, and design-constraint checks.
- Deployment-ready: the Vercel configuration includes the SPA route fallback required by Vue Router.

## Tech stack

- [Vue 3](https://vuejs.org/) + [Vue Router](https://router.vuejs.org/)
- [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright](https://playwright.dev/)
- [Marked](https://marked.js.org/) + [Turndown](https://github.com/mixmark-io/turndown)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [QRCode](https://github.com/soldair/node-qrcode) + [jsQR](https://github.com/cozmo/jsQR)

## Quick start

### Requirements

- Node.js 20 or newer
- npm 10 or newer
- Playwright Chromium for E2E tests

### Run locally

```bash
git clone https://github.com/Hughhhhcoder/HTooL.git
cd HTooL
npm ci
npm run dev
```

The development server runs at <http://localhost:3000> by default.

### Build and preview

```bash
npm run build
npm run preview
```

### Test

```bash
# Unit and component tests
npm run test:unit

# Design constraint check: CSS gradients are not allowed
npm run test:no-gradient

# Production bundle performance budget
npm run test:perf-budget

# Install the Playwright browser the first time
npx playwright install chromium

# End-to-end tests
npm run test:e2e

# Full verification: tests + constraints + build + budget + E2E
npm run check
```

## Environment variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_ENABLE_ANALYTICS` | `false` | Set to `true` to inject Vercel Analytics in production. |

## Privacy and data boundaries

- Images, QR codes, drawings, Markdown, encoding, and hash operations run in the browser; HTooL does not upload those inputs to a project-owned server.
- “Get current IP” calls `api.ipify.org`; IP location lookup calls `ipinfo.io`. These requests happen only when the IP tool is used.
- Vercel Analytics is disabled by default and is enabled only with `VITE_ENABLE_ANALYTICS=true`.
- Markdown and HTML previews are sanitized with DOMPurify. Review downloaded HTML before publishing it, especially when the source is untrusted.

## Project structure

```text
.
├── public/                  # Static assets such as the favicon
├── scripts/                 # Performance and design-constraint checks
├── src/
│   ├── components/          # Shared Vue components
│   ├── utils/               # Reusable conversion and validation logic
│   ├── views/               # Tool pages
│   ├── App.vue
│   └── router/              # Routes and lazy loading
├── tests/
│   ├── component/           # Vue component tests
│   ├── e2e/                 # Playwright end-to-end flows
│   └── unit/                # Utility and router tests
├── .github/                 # CI, bilingual templates, and dependency updates
└── vercel.json              # SPA deployment fallback
```

## Deployment

HTooL can be imported directly into Vercel:

1. Import this repository in Vercel.
2. Select the Vite framework preset, which is normally detected automatically.
3. Use `npm run build` as the Build Command.
4. Use `dist` as the Output Directory.
5. Set `VITE_ENABLE_ANALYTICS=true` only if analytics are needed.

The included `vercel.json` handles SPA route fallback, so refreshing `/markdown`, `/qrcode`, and other client-side routes works as expected.

## Contributing

Bug fixes, UX improvements, and new tools are welcome. Start with [CONTRIBUTING.md](./CONTRIBUTING.md), and include your browser, reproduction steps, and screenshots when opening an Issue.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Issue templates](https://github.com/Hughhhhcoder/HTooL/issues/new/choose)

## License

This repository does not currently declare an open-source license. Unless a license file is added, the code is not granted for copying, modification, or distribution by default.
