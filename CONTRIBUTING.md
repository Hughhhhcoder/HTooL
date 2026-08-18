# Contributing

<p align="right">English · <a href="./CONTRIBUTING.zh-CN.md">简体中文</a></p>

Thanks for helping improve HTooL. Small, focused Pull Requests are easier to review and help keep the toolkit stable and deliberate.

## Before you start

1. Use Node.js 20 or newer.
2. Install dependencies with `npm ci`.
3. Start the development environment with `npm run dev`.
4. Search existing Issues before starting behavioral changes so work is not duplicated.

## Development conventions

- Put pages in `src/views/`, shared components in `src/components/`, and reusable logic in `src/utils/`.
- Add unit/component tests for new behavior and E2E coverage for user-facing flows.
- Keep tool pages responsive and check both light and dark modes.
- Respect the two current design gates: do not use CSS gradients in `src/`, and keep the production bundle within its performance budget.
- Never commit secrets, personal data, or real user files.

## Branches and commits

Create a branch from `master`, for example:

```bash
git switch -c feat/your-change
```

Commit messages should use a short Conventional Commits-style prefix:

```text
feat: add a new utility
fix: handle invalid input
docs: improve setup guide
refactor: simplify converter state
test: cover keyboard shortcut
```

## Opening a Pull Request

Run the full verification suite before submitting:

```bash
npm run check
```

If Playwright browsers are not installed, run `npx playwright install chromium` first. A PR description should explain:

- what changed and why;
- how it was verified;
- whether the UI changed, with screenshots or a recording when useful;
- any compatibility, performance, or breaking changes.

Every PR runs through CI. Maintainers may ask for a narrower scope, additional tests, or interaction refinements.
