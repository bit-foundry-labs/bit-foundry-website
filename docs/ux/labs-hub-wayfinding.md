# Labs navigation: direct route

The homepage's floating Menu now routes **Labs** to the actual `/labs/` hub, not the Networking showcase `#labs`. The About CTA and footer use the same real route. The Networking and Fortran menu entries remain direct; `#labs` remains the internal anchor for the Networking showpiece.

This fixes the main discoverability gap recorded in `docs/ux/wayfinding-audit.md` after the Steel & Fire redesign. From the top of the homepage, visitors can open the hub in two actions (Menu → Labs), then select LAN Workbench in one additional action.

Verification: deterministic assertions in `scripts/forge-design.test.mjs` and browser-based real-link checks in `scripts/mobile-browser-smoke.mjs`, run at 390px and 1280px by the existing website CI workflow. Review direct navigation in actual Safari before merge if available.
