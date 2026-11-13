import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const entry=readFileSync("src/main.tsx","utf8");
const app=readFileSync("src/App.tsx","utf8");
const foundation=readFileSync("src/index.css","utf8");
const design=readFileSync("src/forge-design.css","utf8");
const legacy=readFileSync("public/legacy-theme.css","utf8");

test("steel and fire visual layer loads last, remains compatible with forge motion",()=>{
  assert.ok(entry.indexOf('import "./index.css"')<entry.indexOf('import "./forge-design.css"'));
  assert.match(design,/--forge-red: #df352b/);
  assert.match(design,/--forge-ember: #ff742f/);
  assert.match(design,/--forge-coal: #12161b/);
  assert.match(foundation,/\.forge-casting__stream/);
});
test("homepage has no floating branding bar or filler interludes",()=>{
  assert.match(app,/className="nav-shell"/);
  assert.match(app,/className="menu-toggle"/);
  assert.doesNotMatch(app,/className="wordmark"|className="nav-location"|hero-kicker|hero-coordinate/);
  assert.doesNotMatch(app,/method-section|lab-intro|How we shape understanding|Two ways|We don’t simplify/);
  assert.match(app,/id="labs" data-scroll-scene/);
  assert.match(app,/href="\/learn\/networking\/"/);
  assert.match(app,/href="\/learn\/fortran\/"/);
  assert.match(app,/\["Labs", "\/labs\/"\]/);
  assert.match(app,/<a className="soft-button" href="\/labs\/">/);
  assert.match(app,/<a href="\/labs\/">Labs<\/a>/);
  assert.match(design,/\.nav-shell \{[\s\S]*?right:clamp\(16px,3\.6vw,58px\)/);
});
test("black steel and flames across the editorial sections",()=>{
  for(const cls of [".nav-shell",".about-section",".artifact-sticky",".archive-section",".forge-section",".closing-sticky","footer"])
    assert.ok(design.includes(cls),cls);
  assert.match(design,/\.archive-section \{\s*background:radial-gradient/);
  assert.match(design,/\.archive-list a::before \{ background:linear-gradient/);
  assert.match(design,/:is\(\.soft-button,\.glass-button\):is\(:hover,:focus-visible\)::after/);
});
test("standalone learning routes remain separately styled and motion is optional",()=>{
  assert.match(legacy,/body\.learn-page, body\.labs-page/);
  assert.match(design,/@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(design,/position:fixed;top:0;height:100svh/);
});
