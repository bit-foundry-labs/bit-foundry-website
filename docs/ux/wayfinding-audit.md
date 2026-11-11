# Wayfinding audit — homepage and learning labs

Date: 2026-11-11  
Repository: `bit-foundry-labs/bit-foundry-website`  
Scope guard: PR #9 is still open, so this audit does not modify `src/App.tsx` or `src/forge-design.css`.

## Measurement method

- Measured in local Chromium via Playwright at **390x844** and **1280x800** against `http://127.0.0.1:4173`.
- Keyboard observations use focusable-order checks and page interaction on the same build.
- This is **not** real iPhone Safari testing.
- Report separates measured behavior from hypotheses that depend on PR #9.

## Task-path evidence table

| Priority | Task | Viewport(s) | Repro path | Action count (pointer / keyboard) | Blockers | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | 1) Homepage → Networking course → first lesson | 390, 1280 | From `/`: use top `Labs` anchor (`#labs`) → continue scroll to “Computer Networking” card → `Open lesson` (`/learn/networking/`) → first `Open model` (`#module-1-1`). | 4 pointer actions (incl. one scroll segment) / 15 tabs + Enter to first lesson (`/` networking link focus index 10, networking page first model index 14) | Networking entry is far below first viewport (`~5783px` at 390; `~5558px` at 1280), so users must infer they should keep scrolling after hitting `#labs`. | Measured: homepage links include `/learn/networking/`; networking reader opens with hash `#module-1-1` and dialog state `open: true`. |
| P1 | 2) Homepage → Fortran → return to studio | 390, 1280 | From `/`: scroll to Fortran card → `Open lesson` (`/learn/fortran/`) → use `Bit Foundry home` link in header (`../../`) to return. | 3 pointer actions / 11 tabs + Enter from `/` to Fortran (`focus index 10`), then first tab on Fortran is home link (`index 0`) | Fortran entry is also deep below fold (`~6838px` at 390; `~6678px` at 1280). | Measured: `/learn/fortran/` loads; returning via header link lands at `/` with `scrollY: 0`. |
| P0 | 3) Find Labs / LAN Workbench without browser search | 390, 1280 | From `/`: no direct `/labs/` or “LAN Workbench” link found. Working route is to manually navigate to `/labs/` (or discover via non-homepage paths), then select `LAN Workbench` (`/labs/lan/`). | Current homepage path is exploratory and unbounded; on `/labs/` it is 1 click to LAN Workbench | Discoverability gap on homepage: no direct Labs hub route (`/labs/`) and no LAN Workbench mention. | Measured: homepage `labsRouteLinks: []`, `lanWorkbenchLinks: []`; Labs page exposes `LAN Workbench` as a large card link. |
| P1 | 4) Understand “X-Ray Inspect” control | 390, 1280 | On current branch, no inspect control is present on homepage. | N/A until PR #9 merge | Cannot validate wording, placement, or affordance until PR #9 lands. | Measured: `inspectControl: false` on homepage. Hypothesis: PR #9 describes a persistent “Inspect internals” control; re-audit required post-merge. |
| P1 | 5) Find products/projects and contact | 390, 1280 | From `/`: scroll to `#products` section for “Discover our work” (GitHub) and continue to closing section for `Start a conversation` (mailto). | 3 pointer actions (2 scroll segments + 1 click) / 18 tabs + Enter to contact (`focus index 17`) | Targets are available but very deep in narrative order (project link ~8568px, contact ~9439px at 390). | Measured: `#products` exists; “Discover our work” and `mailto:hello@bitfoundrylabs.io` links are present and keyboard-focusable. |

## Keyboard and touch-target notes

- Keyboard focus order is consistent (no tab trap observed), but required destinations are late in tab order on homepage because they are deep in document order.
- Mobile header controls on audited pages include very small measured text-bound boxes (examples observed around 11–20px height), which may reduce tap confidence even when links are technically reachable.

## Measured vs hypothesis summary

### Measured now
- All five journey areas can be inspected except X-Ray inspect behavior.
- Networking, Fortran, and Labs destinations are functional once reached.
- Major discoverability risk is **path depth from homepage** rather than broken links.

### Hypothesis (pending PR #9 merge)
- The new inspect affordance may improve machine-interaction discoverability, but label clarity and first-time comprehension still need post-merge validation at 390/1280 + keyboard.

## Single follow-up fix recommendation (small PR after PR #9)

**Recommendation:** Add one explicit homepage route to the Labs hub (e.g., `Open Labs hub` linking to `/labs/`, with “LAN Workbench” in supporting copy) in an already-existing navigation/CTA area.

Why this is highest-impact + low-risk:
- It directly addresses the largest measured blocker (no direct Labs/LAN entry on homepage).
- It is a small information-architecture/linking change that should not alter course simulations or visual system behavior.
- It avoids scroll traps and preserves the foundry identity.

### Success criteria for follow-up PR

- Before: no direct `/labs/` route or “LAN Workbench” mention from homepage.
- After: from top of homepage, users can reach `/labs/` in <=2 actions and `/labs/lan/` in <=3 actions on both 390 and 1280.
- Keyboard: Labs hub link appears within first 8 tab stops on homepage.
- Regression guard: Networking and Fortran lesson links remain unchanged and functional.
