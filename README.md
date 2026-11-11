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
