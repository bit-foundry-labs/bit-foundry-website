import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const app=readFileSync("src/App.tsx","utf8");
const component=readFileSync("src/components/ForgeCasting.tsx","utf8");
const css=readFileSync("src/index.css","utf8");
test("five section-specific hand-designed casting motifs exist",()=>{
  for(const tool of ["hammer","calipers","key","compass","blade"])
    assert.match(app,new RegExp('<ForgeCasting tool="'+tool+'"'));
  assert.equal((app.match(/<ForgeCasting tool=/g)||[]).length,5);
});
test("casting has molten feed, tool tracing and cooling stages",()=>{
  for(const className of ["forge-casting__stream","forge-casting__heat-trace","forge-casting__metal"])
    assert.match(component,new RegExp(className));
  for(const animation of ["forge-stream-cast","forge-tool-cast","forge-tool-cool"])
    assert.match(css,new RegExp("@keyframes "+animation));
});
test("animation respects scroll, reduced motion and a static fallback",()=>{
  assert.match(css,/@supports\(animation-timeline:view\(\)\)/);
  assert.match(css,/view-timeline-name:--forge-cast-progress/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/animation:none!important/);
  assert.doesNotMatch(component,/requestAnimationFrame|addEventListener/);
});
