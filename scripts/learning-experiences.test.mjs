import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("computer artifact clips the original foreground without a rectangular backdrop", () => {
  const app = read("src/App.tsx");
  const css = read("src/index.css");
  assert.match(app, /id="artifact-computer-outline"/);
  assert.match(app, /<image\s+href="\/assets\/retro-computer-front.webp"/);
  assert.match(app, /clipPath="url\(#artifact-computer-outline\)"/);
  assert.match(css, /\.artifact-image--cutout\s*\{/);
  assert.match(css, /mask-image: none/);
});

test("Fortran compiler and Fibonacci models preserve interactive controls", () => {
  const html = read("learn/fortran/index.html");
  for (const action of ["compile", "link", "run", "reset-build", "fib-step", "fib-run", "fib-reset"]) {
    assert.ok(html.includes(`data-action="${action}"`), action);
  }
  const js = read("learn.js");
  assert.match(js, /document\.addEventListener\("visibilitychange"/);
  assert.match(js, /stopFib\(\)/);
  assert.match(read("public/legacy-theme.css"), /body\.fortran-page \.build-stage\.is-complete/);
});

test("networking OSI model remains seven layers and responds at tablet widths", () => {
  const html = read("learn/networking/index.html");
  for (let layer = 1; layer <= 7; layer += 1) {
    assert.ok(html.includes(`data-osi-layer="${layer}"`), `missing layer ${layer}`);
  }
  const bridge = read("public/legacy-theme.css");
  assert.match(bridge, /min-width: 821px\) and \(max-width: 1120px/);
  const source = read("learn/networking/course-models.js");
  assert.match(source, /Paused while tab is inactive/);
});
