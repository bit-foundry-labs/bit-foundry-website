# Bit Foundry Labs web frontend

The homepage is built with **React 19 / Vite / Tailwind CSS v4** using the Figma Make redesign. The existing interactive networking, Fortran, LAN, and floppy archive pages remain standalone HTML/JavaScript applications.

## Development

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify
```

The Figma favicon is kept at `public/favicon.png`. The `build` script runs Vite and then copies the legacy assets, scripts, courses and archives into `dist/`. It injects `legacy-theme.css` into the copied legacy pages without altering their source. The `index.html` at the repository root is the only route compiled as a React entrypoint; there is intentionally **no SPA catch-all rewrite**.

## Deployment

Vercel should use framework **Vite**, build command `pnpm run build`, and output directory `dist`. Review a preview deployment and validate the legacy routes before promoting to the production domain.

## Forge landing image

The homepage loads responsive WebP derivatives of `assets/forge-hall-upscaled.png`: `/assets/forge-hall-desktop.webp` (1672×941) and `/assets/forge-hall-mobile.webp` (1600×900). Regenerate from the original source with `python scripts/optimize-forge-image.py` after installing Pillow 11.3.0. The original PNG is preserved for future image upgrades. Ambient heat, sparks and sword highlights are CSS-only; `src/lib/forge-motion.mjs` provides bounded scroll-linked transforms. The site disables ambient movement for `prefers-reduced-motion` and keeps the existing short hero scroll duration.


## Forge material system

The React homepage imports `src/forge-design.css` after `src/index.css`; this keeps editorial composition, scroll choreography and the molten casting geometry separate from the new visual language. The palette uses coal/oxide surfaces, copper/ember accents and warm-bone reading chapters. Key motion signatures are a low-frequency edge seam, a restrained navigation indicator and pointer-triggered metallic sweeps. All optional motion is disabled for reduced-motion preferences.

Standalone learning and archive routes retain their independent HTML and scripts. Their forge palette is scoped inside `public/legacy-theme.css`, where interactive educational diagrams and the archive's light reading surfaces remain distinct. The existing Chromium CI smoke test checks the homepage theme and labs hub at 390px and 1280px without third-party test dependencies.


## X-Ray Foundry inspection prototype

The vintage computer on the homepage now hosts an optional, conceptual systems-inspection layer (`src/components/ComputerXRay.tsx`). It retains the original photographic silhouette and reveals a vector circuit diagram using a clipped SVG lens. Move a mouse/pen over the machine to inspect; tap the machine or use the accessible *Inspect internals* button for a persistent mobile/keyboard-friendly view. Component descriptions come from `src/lib/xray-model.mjs` and are deliberately educational, not a claim that this illustration is a physical teardown of the pictured machine.

The effect uses native SVG and React only; it has no dependency on shaders, paid services, images, or 3D libraries. The signal animation pauses for reduced-motion preferences. Browser CI checks the real toggle, lens and viewport fit at phone and desktop sizes.


## Natural scrolling & molten circuitry

The React landing page no longer holds visitors in sticky viewport-sized scroll tracks. The original scene sections are in normal document flow, with short incidental visual changes. The vintage computer is horizontally centered as a full-width exhibit on mobile and desktop. The networking preview now includes `src/components/MoltenCircuit.tsx`, a three-stage SVG experiment (pour, cool, conduct) that visualizes metal becoming copper paths and then propagating conceptual DNS/TCP/TLS/HTTP signals. The controls are explicit, keyboard-accessible, mobile-friendly, and stop continuous motion when reduced motion is requested. Neither interaction uses a third-party animation library or captures wheel/touch scroll events.
