# Bit Foundry website / agent working agreement

This is a real web product, not a blank dashboard. Read existing code and tests before suggesting changes.

## Current source of truth
- React 19 homepage: `src/App.tsx`, `src/index.css`, `src/forge-design.css`; entrypoint `src/main.tsx`.
- Interactive standalone routes: `learn/networking/`, `learn/fortran/`, `labs/`, and `disks/`. Preserve their JavaScript behavior and independent styles.
- Build: Vite, `scripts/preserve-static.mjs` copies standalone routes and injects `public/legacy-theme.css`. There is no SPA catch-all.
- Tests: `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run verify`, `node learn/networking/scripts/validate-course.mjs`, `node scripts/mobile-browser-smoke.mjs`.
- Deployment: Vercel previews on pull requests; production is `main`.
- In-flight design: PR #9 (`feature/xray-foundry-inspection`) centers the interactive computer, removes pinned scroll chapters and adds Molten Circuitry. Do not independently redo or overwrite its work. Verify its merge status before changing overlapping files.

## Interaction principles
- The visitor should find Networking, Fortran, Labs and the studio's work without guessing; prioritize wayfinding over surprise.
- Originality comes from system behavior: inspecting internals, forged circuit paths, deliberate mechanical feedback. Avoid boilerplate SaaS cards, gratuitous gradients, cursor trails, scroll hijacking, long sticky scenes and atmospheric effects that obscure content.
- Keep touch, keyboard and pointer interactions equivalent. Provide focus indicators and clear affordances, honor `prefers-reduced-motion`, and check 390px phone and 1280px desktop. Chromium emulation is not physical iOS Safari.
- Keep educational analogies technically honest; do not label invented circuit diagrams as an authentic hardware teardown. Ensure legible contrast consistent with WCAG 2.2 AA where applicable.
- Use local assets and existing dependencies where feasible. No new paid APIs, telemetry, external trackers, runtime subscriptions, build services, spending, or live agents.
- No unapproved production deployments or direct writes to `main`. Work in a narrow feature branch, run verification, open a reviewable pull request, and summarize tests and risks.
- Prefer one measurable improvement per PR; no repeated redesigns or parallel edits to the same component.
- If a task depends on PR #9, do not silently simulate it from `main`. Wait for its merge or explicitly target the right branch with approval.
