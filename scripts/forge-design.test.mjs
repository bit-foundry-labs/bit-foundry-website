import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const main=readFileSync("src/main.tsx","utf8");
const foundation=readFileSync("src/index.css","utf8");
const homepage=readFileSync("src/forge-design.css","utf8");
const legacy=readFileSync("public/legacy-theme.css","utf8");

test("forge theme is loaded after base styles, without editing animation choreography",()=>{
  assert.ok(main.indexOf('import "./index.css"') < main.indexOf('import "./forge-design.css"'));
  assert.match(homepage,/--forge-ember: #f68b43/);
  assert.match(homepage,/--forge-bone: #efe1d1/);
  assert.doesNotMatch(foundation,//\* Forge design language: these overrides/);
  assert.match(foundation,/\.forge-casting__stream/);
});
test("narrative sections, navigation and archive share material tokens",()=>{
  for(const selector of [".nav-shell", ".about-section", ".artifact-sticky",".method-section",".lab-intro",".archive-section",".forge-section",".closing-sticky","footer"])
    assert.ok(homepage.includes(selector),selector);
  assert.match(homepage,/\.archive-list a::before \{ background: linear-gradient/);
  assert.match(homepage,/\.method-list article::before/);
  assert.match(homepage,/@keyframes forge-seam-pulse/);
  assert.match(homepage,/@keyframes forge-indicator/);
});
test("legacy lessons and archive are themed without recoloring data visualizations",()=>{
  assert.match(legacy,/body\.learn-page, body\.labs-page/);
  assert.match(legacy,/body\.learn-page\.fortran-page/);
  assert.match(legacy,/body\.labs-page \.artifact-card/);
  assert.match(legacy,/body\.disk-page \{ background: #eae0d2/);
  assert.doesNotMatch(legacy.slice(legacy.lastIndexOf("Bit Foundry forge material system")),/\.osi-layer\s*\{/);
});
test("motion respects reduced preferences and hover polish does not run indefinitely",()=>{
  assert.match(homepage,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(homepage,/\.about-section::after, \.forge-section::after \{ animation: none !important/);
  assert.match(homepage,/:is\(\.soft-button,\.glass-button\):is\(:hover,:focus-visible\)::after/);
  assert.match(legacy,/body\.labs-page \.artifact-card::after \{ transition: none !important/);
});
