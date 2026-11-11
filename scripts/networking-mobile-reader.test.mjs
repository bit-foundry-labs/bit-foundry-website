import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const styles = ["course.css", "course-reader.css", "course-models.css", "course-reader-mobile.css"];
const css = styles.map(name => readFileSync("learn/networking/" + name, "utf8")).join("\n");
const reader=readFileSync("learn/networking/course-reader.js","utf8");
const page=readFileSync("learn/networking/index.html","utf8");

test("reader content stays in normal vertical flow, even without an interactive model",()=>{
  assert.doesNotMatch(css,/\.reader-page\{display:flex;align-items:center;justify-content:center/);
  assert.match(css,/\.reader-page\{display:block;min-width:0;min-height:0;max-width:100%/);
  assert.match(css,/\.module-reader \.reader-page\s*\{[^}]*display:block/s);
  assert.match(css,/\.module-reader \.reader-page > \.network-lab\s*\{[^}]*margin-inline:auto/s);
  assert.match(page,/<main class="reader-page" id="reader-page">/);
});
test("iPhone layout is scrollable, with full-width content and large close control",()=>{
  assert.match(css,/\.module-reader \.reader-page\s*\{[^}]*overflow-y:auto/s);
  assert.match(css,/\.module-reader \.reader-page\s*\{[^}]*overflow-x:hidden/s);
  assert.match(css,/-webkit-overflow-scrolling:touch/);
  assert.match(css,/\.module-reader \.reader-close\s*\{[^}]*min-height:44px/s);
});
test("the first networking lesson gets an actionable iPhone exercise",()=>{
  assert.match(reader,/label\.textContent=liveModel\?"INTERACTIVE MODEL":"GUIDED EXERCISE"/);
  assert.match(reader,/if\(liveModel\)page\.replaceChildren\(liveModel\)/);
  assert.match(reader,/active\.id==="module-1-1"/);
  assert.match(reader,/Show desktop network-inspection steps/);
  assert.match(reader,/https:\/\/example\.invalid/);
  assert.match(css,/\.reader-phone-guide/);
});

test("split stylesheets preserve cascade order and isolate mobile overrides",()=>{
  const order=styles.map(name=>page.indexOf(name));
  assert.ok(order.every(pos=>pos>=0));
  assert.ok(order.every((pos,i)=>i===0||pos>order[i-1]));
  assert.doesNotMatch(readFileSync("learn/networking/course.css","utf8"),/\.reader-phone-guide/);
  assert.match(readFileSync("learn/networking/course-reader-mobile.css","utf8"),/\.reader-phone-guide/);
});
