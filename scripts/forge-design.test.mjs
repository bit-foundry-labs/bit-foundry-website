import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const entry=readFileSync("src/main.tsx","utf8");
const app=readFileSync("src/App.tsx","utf8");
const foundation=readFileSync("src/index.css","utf8");
const design=readFileSync("src/forge-design.css","utf8");
const legacy=readFileSync("public/legacy-theme.css","utf8");
const forgeLoop=readFileSync("forgeloop/index.html","utf8");

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
  assert.doesNotMatch(app,/method-section|lab-intro|How we shape understanding|Two ways|We don’t simplify|Connecting to system/);
  assert.match(app,/id="labs" data-scroll-scene/);
  assert.match(app,/href="\/learn\/networking\/"/);
  assert.match(app,/href="\/learn\/fortran\/"/);
  assert.match(app,/\["Labs", "\/labs\/"\]/);
  assert.match(app,/<a className="soft-button" href="\/labs\/">/);
  assert.match(app,/href="\/labs\/">Interactive labs<\/a>/);
  assert.doesNotMatch(app,/Private alpha · local-first developer tooling|forge-status/);
  assert.match(app,/href="\/forgeloop\/"/);
  assert.doesNotMatch(app,/href="https:\/\/github\.com\/bit-foundry-labs" target="_blank" rel="noreferrer">\s*<span>Discover our work/);
  assert.match(design,/\.nav-shell \{[\s\S]*?right:clamp\(16px,3\.6vw,58px\)/);
});
test("ForgeLoop page uses readable sentence-case labels instead of tiny all-caps filler",()=>{
  assert.match(forgeLoop,/A private-alpha workspace for deliberate engineering work\./);
  assert.match(forgeLoop,/A work objective, at a glance/);
  assert.doesNotMatch(forgeLoop,/class="eyebrow"|text-transform:uppercase|MISSION CONTROL|NEEDS REVIEW|APPROVED OBJECTIVE/);
});
test("homepage calls to action and closing copy retain readable sentence case",()=>{
  assert.match(design,/\.forge-detail a \{ border-color:#ff702c;font:500 15px\/1\.4 var\(--sans\);text-transform:none; \}/);
  assert.match(design,/\.closing-copy > p \{ font:400 clamp\(15px,1\.1vw,18px\)\/1\.55 var\(--sans\);text-transform:none; \}/);
  assert.match(design,/\.footer-links \{ justify-self:end;display:grid;grid-template-columns:repeat\(2,minmax\(150px,1fr\)\);/);
});
test("footer provides clear company context, contact and product navigation",()=>{
  assert.match(app,/Independent software studio for systems, developer tools, and learning experiences\./);
  assert.match(app,/href="mailto:hello@bitfoundrylabs\.io">hello@bitfoundrylabs\.io/);
  assert.match(app,/href="\/forgeloop\/">ForgeLoop<\/a>/);
  assert.match(app,/A New Mexico limited liability company/);
  assert.match(design,/\.footer-links h2 \{ margin:0 0 8px;color:#f2f4f6;font:500 18px\/1\.2 var\(--sans\);letter-spacing:0; \}/);
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
