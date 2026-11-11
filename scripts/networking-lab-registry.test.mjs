import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync("learn/networking/course-lab-registry.js", "utf8");
const browser = { window: {} };
runInNewContext(source, browser, { filename: "course-lab-registry.js" });
const { definitions, bindAvailable } = browser.window.BIT_FOUNDRY_NETWORKING_LAB_REGISTRY;

function fixture(selectors = []) {
  const elements = new Map(selectors.map((selector) => [selector, { selector }]));
  const calls = [];
  const initializers = Object.fromEntries(
    definitions.map(([, name]) => [name, (element) => calls.push({ name, element })]),
  );
  initializers.bindLanTrace = (root) => calls.push({ name: "bindLanTrace", element: root });
  const root = { querySelector: (selector) => elements.get(selector) ?? null };
  const bind = (lessonId = "module-1-1", pageIndex = 3) =>
    bindAvailable(root, initializers, { lessonId, pageIndex, modelPageIndex: 3 });
  return { root, calls, initializers, elements, bind };
}

test("all 41 existing model selectors are unique and have named initializers", () => {
  assert.equal(definitions.length, 41);
  assert.equal(new Set(definitions.map(([selector]) => selector)).size, 41);
  assert.equal(new Set(definitions.map(([, name]) => name)).size, 41);
  assert.ok(Object.isFrozen(definitions));
});

test("only present models are initialized once, with their actual DOM nodes", () => {
  const selectors = ["[data-queue-lab]", "[data-tcp-lab]", "[data-wifi-lab]"];
  const scene = fixture(selectors);
  scene.bind();
  assert.deepEqual(scene.calls.map((entry) => entry.name), [
    "bindQueueLab", "bindTcpLab", "bindWifiLab",
  ]);
  for (const entry of scene.calls) {
    assert.strictEqual(entry.element, scene.elements.get(entry.element.selector));
  }
});

test("lessons without models do not invoke unrelated binders", () => {
  const scene = fixture();
  scene.bind();
  assert.equal(scene.calls.length, 0);
});

test("LAN trace initializes on its original lesson and page only", () => {
  const scene = fixture();
  scene.bind("module-6-4", 2);
  scene.bind("module-6-3", 3);
  assert.equal(scene.calls.length, 0);
  scene.bind("module-6-4", 3);
  assert.deepEqual(scene.calls.map(({ name }) => name), ["bindLanTrace"]);
  assert.strictEqual(scene.calls[0].element, scene.root);
});

test("missing initializers fail instead of silently leaving models inert", () => {
  const scene = fixture(["[data-queue-lab]"]);
  delete scene.initializers.bindQueueLab;
  assert.throws(() => scene.bind(), /Missing networking model initializer: bindQueueLab/);
  assert.throws(() => bindAvailable(null, scene.initializers, {}), /lesson root/);
});

test("reader delegates to the registry and loads scripts in dependency order", () => {
  const reader = readFileSync("learn/networking/course-reader.js", "utf8");
  const html = readFileSync("learn/networking/index.html", "utf8");
  assert.match(reader, /labRegistry\.bindAvailable\(page,labs,\{lessonId:active\.id,pageIndex:index,modelPageIndex\}\)/);
  assert.doesNotMatch(reader, /if\(false\s*&&/);
  assert.ok(html.indexOf("course-labs.js") < html.indexOf("course-lab-registry.js"));
  assert.ok(html.indexOf("course-lab-registry.js") < html.indexOf("course-reader.js"));
});
