import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const app=readFileSync("src/App.tsx","utf8");
const css=readFileSync("src/forge-design.css","utf8");
const baseline=readFileSync("src/index.css","utf8");

test("intro remains bounded and never blocks indefinitely on hero image",()=>{
  assert.match(app,/introStartedAt\.current === null/);
  assert.match(app,/heroReady \? 1750 : 2400/);
  assert.match(app,/Math\.max\(0, revealAfter - elapsed\)/);
  assert.match(baseline,/animation: introProgress 1\.75s/);
});
test("every narrative scene now participates in normal document flow",()=>{
  assert.match(css,/\.hero-scroll,\s*\.artifact-scroll,\s*\.project-scroll,\s*\.closing-scroll\s*\{\s*height: auto !important/);
  assert.match(css,/\.hero-sticky,\s*\.artifact-sticky,\s*\.project-sticky,\s*\.closing-sticky\s*\{\s*position: relative/);
  assert.match(app,/const travel = Math\.max\(1, rect\.height\)/);
  assert.doesNotMatch(app,/rect\.height - window\.innerHeight/);
});
test("X-ray display stays centered outside a pinned track",()=>{
  assert.match(css,/\.artifact-sticky--xray\s*\{[\s\S]*?flex-direction: column/);
  assert.match(css,/\.artifact-sticky--xray \.artifact-image--cutout\s*\{[\s\S]*?margin-inline: auto/);
  assert.match(css,/\.artifact-sticky--xray \.artifact-copy\s*\{[\s\S]*?text-align: center/);
});
test("reduced motion disables continuous effects",()=>{
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css,/\.molten-circuit__signal path,[\s\S]*?\{ animation: none !important/);
});
