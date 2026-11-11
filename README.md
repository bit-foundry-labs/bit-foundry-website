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
