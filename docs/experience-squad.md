# Website experience squad

These are versioned **GitHub Copilot custom agent profiles**, not always-running services. GitHub can select them after the profiles are merged into the default branch.

- [Wayfinding Architect](../.github/agents/wayfinding-architect.agent.md) evaluates task completion, navigation, breadcrumbs and discoverability.
- [Motion Smith](../.github/agents/motion-smith.agent.md) builds one expressive, meaningful interactive system at a time.
- [Experience QA](../.github/agents/experience-qa.agent.md) checks accessibility, performance, keyboard navigation and responsive regressions.

## Operating model

1. Inspect current PRs and assign an issue with a specific outcome to **one** specialist.
2. Each agent works on its own narrow branch and opens a reviewable PR, never pushing to production.
3. Do not start two implementation agents against the same files; especially avoid independent changes to `src/App.tsx`, `src/forge-design.css`, or `scripts/mobile-browser-smoke.mjs` while PR #9 is open.
4. Observe checks and review in the real browser. Actual iPhone Safari verification is a separate manual step.
5. No default continuous loop. Start tasks individually to limit Copilot premium-request consumption and avoid surprise usage.

**Current dependency:** PR #9 introduces centered X-Ray, natural page scrolling and Molten Circuitry. Review/merge it before starting visual implementation tasks that depend on those components.

## Baseline visitor scenarios

| Goal | Evidence needed |
| --- | --- |
| Find Networking from home | Visible route and action count, mobile and keyboard |
| Open the first interactive networking module | Launch control and preserved reader behavior |
| Find Fortran and return home | Entry link, lesson navigation and back path |
| Explore the X-Ray computer | Obvious inspect affordance; touch/keyboard equivalent |
| Try Molten Circuitry | Three discoverable stages and their explanations |
| Explore studio work | Clear link to products, project and contact without dead ends |

An agent's proposal should improve at least one of these scenarios without harming another. Quantify where measurements are available, and explicitly mark unmeasured outcomes.
