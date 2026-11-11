import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { getForgeMotion } from "../src/lib/forge-motion.mjs";

test("forge moves less than drifting embers", () => {
  const start=getForgeMotion(0),end=getForgeMotion(1);
  assert.ok(Math.abs(end.forgeY-start.forgeY)<45);
  assert.ok(Math.abs(end.embersFarY-start.embersFarY)>Math.abs(end.forgeY-start.forgeY));
  assert.ok(Math.abs(end.embersNearY-start.embersNearY)>Math.abs(end.embersFarY-start.embersFarY));
  assert.ok(end.forgeScale<start.forgeScale);
});
test("motion is finite and clamped",()=>{
  for(const input of [-9,0,.5,1,9,NaN,Infinity]){
    const result=getForgeMotion(input);
    for(const value of Object.values(result))assert.ok(Number.isFinite(value));
    assert.ok(result.copyOpacity>=0&&result.copyOpacity<=1);
  }
  assert.deepEqual(getForgeMotion(-3),getForgeMotion(0));
  assert.deepEqual(getForgeMotion(7),getForgeMotion(1));
});
test("new brand copy, imagery, motion and reduced-motion rules are present",()=>{
  const app=readFileSync("src/App.tsx","utf8");
  const css=readFileSync("src/index.css","utf8");
  assert.match(app,/hero: "\/assets\/forge-hall\.avif"/);
  assert.match(app,/<SplitText>Welcome to<\/SplitText>/);
  assert.match(app,/<SplitText className="hero-accent">the Foundry\.<\/SplitText>/);
  assert.match(app,/forge-embers--near/);
  assert.match(css,/@keyframes forge-heat-breathe/);
  assert.match(css,/@keyframes forge-blade-shimmer/);
  assert.match(css, /\.hero-scroll \{ height: 160vh; \}/);
  assert.match(css, /\.hero-scroll \{ height: 135vh; \}/);
});
