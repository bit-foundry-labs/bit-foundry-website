import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { INSPECTABLE_PARTS, DEFAULT_INSPECTION, closestInspectablePart, clampInspectionPoint }
  from "../src/lib/xray-model.mjs";

test("conceptual machine map has five unique, explanatory components", () => {
  assert.equal(INSPECTABLE_PARTS.length, 5);
  assert.equal(new Set(INSPECTABLE_PARTS.map(part=>part.id)).size,5);
  for(const part of INSPECTABLE_PARTS) {
    assert.ok(part.description.length>35);
    assert.equal(closestInspectablePart(part.x,part.y).id,part.id);
  }
});
test("pointer mapping clamps to image bounds and handles malformed numbers", () => {
  assert.deepEqual(clampInspectionPoint(-100,2000),{x:270,y:900});
  assert.deepEqual(clampInspectionPoint(NaN,Infinity),DEFAULT_INSPECTION);
  assert.equal(closestInspectablePart(NaN,NaN).id,"cpu");
});
test("computer inspection keeps its original silhouette and photograph", () => {
  const source=readFileSync("src/components/ComputerXRay.tsx","utf8");
  const app=readFileSync("src/App.tsx","utf8");
  const css=readFileSync("src/forge-design.css","utf8");
  assert.match(source,/retro-computer-front\.webp/);
  assert.match(source,/clipPath="url\(#xray-computer-outline\)"/);
  assert.match(source,/clipPath="url\(#xray-inspection-lens\)"/);
  assert.match(source,/aria-pressed=\{pinned\}/);
  assert.match(source,/onPointerDown=\{touchLens\}/);
  assert.match(source,/onPointerMove=\{moveLens\}/);
  assert.match(source,/CONCEPTUAL SYSTEM MAP \/ NOT A HARDWARE TEARDOWN/);
  assert.match(app,/<ComputerXRay>/);
  assert.match(css,/@keyframes xray-signal-flow/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});
