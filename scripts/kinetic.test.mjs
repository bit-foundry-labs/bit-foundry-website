import assert from "node:assert/strict";
import { test } from "node:test";
import { scrambleFrame } from "../src/lib/kinetic.mjs";

test("decode resolves to original text at 100 percent and above", () => {
  assert.equal(scrambleFrame("Field archive", 1, 10), "Field archive");
  assert.equal(scrambleFrame("ForgeLoop", 2, 99), "ForgeLoop");
});

test("decode progress reveals resolved non-space glyphs from left to right", () => {
  const value = scrambleFrame("A B C D", 0.5, 0);
  assert.equal(value.slice(0, 3), "A B");
  assert.equal(value[3], " ");
  assert.equal(value[5], " ");
  assert.equal(value.length, 7);
});

test("decode is deterministic for any frame and preserves whitespace", () => {
  const one = scrambleFrame("Computer\nNetworking", 0.2, 7);
  assert.equal(one, scrambleFrame("Computer\nNetworking", 0.2, 7));
  assert.equal(one.includes("\n"), true);
  assert.equal(scrambleFrame("", 0.5, 4), "");
});

test("invalid scroll progress is clamped; no decoded text is corrupted", () => {
  assert.equal(scrambleFrame("System", Number.NaN, 0).length, 6);
  assert.equal(scrambleFrame("System", Number.POSITIVE_INFINITY, 0).length, 6);
  assert.equal(scrambleFrame("System", -20, 0).length, 6);
  assert.equal(scrambleFrame("System", 1, 0), "System");
});
