import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");

test("Homepage has no decorative forge-tool motifs", () => {
  assert.doesNotMatch(app, /ForgeCasting/);
  assert.doesNotMatch(app, /forge-casting/);
});
