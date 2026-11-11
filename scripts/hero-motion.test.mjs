import assert from "node:assert/strict";
import { test } from "node:test";
import { getHeroMotion } from "../src/lib/hero-motion.mjs";

test("Earth moves more than distant stars (actual depth separation)", () => {
  const start = getHeroMotion(0);
  const end = getHeroMotion(1);
  assert.ok(Math.abs(end.earthY - start.earthY) > 400);
  assert.ok(Math.abs(end.distantStarsY - start.distantStarsY) < 125);
  assert.ok(Math.abs(end.nearStarsY - start.nearStarsY) > Math.abs(end.distantStarsY - start.distantStarsY));
  assert.ok(start.earthScale > end.earthScale);
});

test("scroll progress stays bounded and produces finite transforms", () => {
  for (const value of [-12, 0, .5, 1, 5, NaN, Infinity]) {
    const result = getHeroMotion(value);
    for (const key of Object.keys(result)) assert.ok(Number.isFinite(result[key]), key);
    assert.ok(result.copyOpacity >= 0 && result.copyOpacity <= 1);
    assert.ok(result.earthScale >= 1 && result.earthScale <= 2);
  }
  assert.deepEqual(getHeroMotion(-10), getHeroMotion(0));
  assert.deepEqual(getHeroMotion(11), getHeroMotion(1));
  assert.equal(getHeroMotion(1).copyOpacity, 0);
});
