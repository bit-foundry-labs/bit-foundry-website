import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { preserveLegacySite } from "./preserve-static.mjs";

test("copies every original route, keeps its code, and adds its theme bridge", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "bf-preserve-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const name of ["assets", "disks", "labs", "learn", "styles"]) mkdirSync(join(dir, name), { recursive: true });
  for (const name of ["styles.css", "learn.js", "script.js"]) writeFileSync(join(dir, name), "// original");
  const pages = ["disks/internet/index.html", "disks/gaming-history/index.html", "disks/oregon-trail/index.html", "labs/index.html", "labs/lan/index.html", "learn/networking/index.html", "learn/fortran/index.html"];
  for (const name of pages) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), '<html><head><title>Original</title></head><body><script src="game.js"></script></body></html>');
  }
  const copied = preserveLegacySite(dir, join(dir, "dist"));
  assert.deepEqual(copied, pages);
  for (const name of pages) {
    const content = readFileSync(join(dir, "dist", name), "utf8");
    assert.match(content, /<script src="game.js"><\/script>/);
    assert.match(content, /legacy-theme\.css/);
    assert.equal(content.match(/legacy-theme\.css/g)?.length, 1);
  }
  assert.equal(readFileSync(join(dir, "dist", "styles.css"), "utf8"), "// original");
});