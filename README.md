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

The `build` script runs Vite and then copies the legacy assets, scripts, courses and archives into `dist/`. It injects `legacy-theme.css` into the copied legacy pages without altering their source. The `index.html` at the repository root is the only route compiled as a React entrypoint; there is intentionally **no SPA catch-all rewrite**.

## Deployment

Vercel should use framework **Vite**, build command `pnpm run build`, and output directory `dist`. Review a preview deployment and validate the legacy routes before promoting to the production domain.