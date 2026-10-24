# Bit Foundry

An independent systems studio exploring systems software, developer tools, and interactive learning.

## Pages

- `/` — Studio home
- `/learn/networking/` — Network Lab: follow a browser request through DNS, TCP, TLS, HTTP, and the response
- `/learn/fortran/` — Field Note 001: compiler flow and an interactive Fibonacci flowchart

## Run locally

This is a static site with no build step or dependencies. From this directory, start a local server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser. The interactive pages are available at `/learn/networking/` and `/learn/fortran/`.

## Stylesheet structure

The shared `styles.css` entry point imports ordered layers from `styles/`:

- `foundation.css`: base rules and shared components
- `learning.css`: course and lesson layouts
- `site-design.css`: site-wide visual direction and archive styling
- `workstation.css`: home workstation, Matrix screen, and floppy disks

Keep the import order intact; later layers contain intentional refinements to earlier rules.
