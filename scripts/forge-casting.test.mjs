import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const app=readFileSync("src/App.tsx","utf8");
const component=readFileSync("src/components/ForgeCasting.tsx","utf8");
const css=readFileSync("src/index.css","utf8");

test("Three illustrative forge artifacts remain after removing filler sections",()=>{
  for(const tool of ["hammer","compass","blade"])
    assert.ok(app.includes('<ForgeCasting tool="'+tool+'"'));
  assert.equal((app.match(/<ForgeCasting tool=/g)||[]).length,3);
  assert.doesNotMatch(component,/forge-casting__caption|CAST \/ /);
});
test("Casting motifs retain heat, tracing and cooling stages",()=>{
  for(const className of ["forge-casting__stream","forge-casting__heat-trace","forge-casting__metal"])
    assert.ok(component.includes(className));
  for(const animation of ["forge-stream-cast","forge-tool-cast","forge-tool-cool"])
    assert.ok(css.includes("@keyframes "+animation));
});
test("Native scroll animation honors reduced motion without JS listeners",()=>{
  assert.match(css,/@supports\(animation-timeline:view\(\)\)/);
  assert.match(css,/view-timeline-name:--forge-cast-progress/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(component,/requestAnimationFrame|addEventListener/);
});
