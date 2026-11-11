import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const css = readFileSync("src/index.css", "utf8");

test("intro remains legible longer, but never stalls indefinitely on a failed hero image", () => {
  assert.match(app, /introStartedAt\.current === null/);
  assert.match(app, /heroReady \? 1750 : 2400/);
  assert.match(app, /Math\.max\(0, revealAfter - elapsed\)/);
  assert.match(css, /animation: introProgress 1\.75s/);
});

test("shorter scene tracks are applied on desktop and mobile", () => {
  assert.match(css, /height: 140vh;/);
  assert.match(css, /\.hero-scroll \{ height: 160vh; \}/);
  assert.match(css, /\.hero-scroll \{ height: 135vh; \}/);
  assert.match(css, /\.artifact-scroll, \.project-scroll, \.closing-scroll \{ height: 125vh; \}/);
  assert.match(css, /height: 100svh;/);
  assert.match(css, /min-height: 0;/);
});

test("reduced-motion users can proceed without a pinned scroll narrative", () => {
  assert.match(css, /\.hero-scroll, \.artifact-scroll, \.project-scroll, \.closing-scroll \{ height: 100svh; \}/);
  assert.match(css, /\.intro-layer \{ transition: none; \}/);
});
