import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const file=readFileSync("src/components/MoltenCircuit.tsx","utf8");
const css=readFileSync("src/forge-design.css","utf8");
const app=readFileSync("src/App.tsx","utf8");

test("Three intentional, explanatory states, not a decorative GIF",()=>{
  for(const phase of ["pour","temper","conduct"])assert.match(file,new RegExp('id: "'+phase+'"'));
  assert.match(file,/onClick=\{\(\) => setPhase\(item\.id\)\}/);
  assert.match(file,/aria-pressed=\{phase === item\.id\}/);
  assert.match(file,/aria-live="polite"/);
  assert.match(file,/DNS, TCP, TLS, and HTTP/);
});
test("copper paths cast, cool, and carry signals without new libraries",()=>{
  assert.match(app,/<MoltenCircuit\s*\/>/);
  assert.match(css,/@keyframes molten-liquid-feed/);
  assert.match(css,/@keyframes molten-trace-cool/);
  assert.match(css,/@keyframes molten-signal-flow/);
  assert.match(css,/\.molten-circuit--conduct \.molten-circuit__signal path/);
  assert.match(css,/\.molten-circuit__drawing svg \{ width: 100%; height: 100%/);
});
