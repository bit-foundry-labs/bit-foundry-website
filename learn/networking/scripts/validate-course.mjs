#!/usr/bin/env node
/**
 * Validate the parts of the networking course that must stay in sync.
 * Run from the repository root:
 *   node learn/networking/scripts/validate-course.mjs
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const courseRoot = resolve(here, "..");
const repoRoot = resolve(courseRoot, "..", "..");
const read = (path) => readFile(path, "utf8");
const fail = (message) => {
  console.error("✗ " + message);
  process.exitCode = 1;
};
const pass = (message) => console.log("✓ " + message);

const [manifest, index, reader] = await Promise.all([
  read(resolve(courseRoot, "course-manifest.js")),
  read(resolve(courseRoot, "index.html")),
  read(resolve(courseRoot, "course-reader.js"))
]);

const chapterFiles = [...manifest.matchAll(/"(.\/content\/chapter-\d{2}\.html)"/g)].map(
  ([, file]) => file
);

if (chapterFiles.length !== 9) {
  fail(`Expected 9 chapter files in the manifest; found ${chapterFiles.length}.`);
} else {
  pass("manifest lists 9 chapter files");
}

const chapters = await Promise.all(
  chapterFiles.map((file) => read(resolve(courseRoot, file)))
);
const chapterMarkup = chapters.join("\n");
const moduleIds = [
  ...chapterMarkup.matchAll(/<article\b[^>]*\bid="(module-\\d+-\\d+)"/g)
].map(([, id]) => id);
const uniqueModuleIds = new Set(moduleIds);
const expectedLessons = Number(
  manifest.match(/lessonCount:\s*(\d+)/)?.[1] ?? 0
);

if (moduleIds.length !== expectedLessons || uniqueModuleIds.size !== expectedLessons) {
  fail(
    `Expected ${expectedLessons} unique module cards; found ${moduleIds.length} cards and ${uniqueModuleIds.size} unique IDs.`
  );
} else {
  pass(`${expectedLessons} unique module cards are present`);
}

const readerIds = new Set(
  [...reader.matchAll(/"?(module-\d+-\d+)"?\s*:/g)].map(([, id]) => id)
);
const staleReaderIds = [...readerIds].filter((id) => !uniqueModuleIds.has(id));
const missingReaderIds = [...uniqueModuleIds].filter((id) => !readerIds.has(id));

if (staleReaderIds.length || missingReaderIds.length) {
  if (staleReaderIds.length) fail(`Reader has stale module data: ${staleReaderIds.join(", ")}.`);
  if (missingReaderIds.length) fail(`Reader lacks module data: ${missingReaderIds.join(", ")}.`);
} else {
  pass("reader lesson data matches every module card");
}

const launchTargets = [
  ...index.matchAll(/data-module-open="(module-\d+-\d+)"/g),
  ...chapterMarkup.matchAll(/data-module-open="(module-\d+-\d+)"/g)
].map(([, id]) => id);
const invalidLaunchTargets = [...new Set(launchTargets)].filter(
  (id) => !uniqueModuleIds.has(id)
);

if (invalidLaunchTargets.length) {
  fail(`Broken module launch target(s): ${invalidLaunchTargets.join(", ")}.`);
} else {
  pass("all module launch targets resolve");
}

if (!/course-manifest\.js/.test(index) || !/course-content\.js/.test(index)) {
  fail("index.html must load the course manifest before the content loader.");
} else if (index.indexOf("course-manifest.js") > index.indexOf("course-content.js")) {
  fail("course manifest is loaded after the content loader.");
} else {
  pass("manifest loads before the content loader");
}

if (!/window\.networkingContentReady\.then/.test(reader)) {
  fail("reader initialization must wait for the module content loader.");
} else {
  pass("reader waits for module content");
}

if (process.exitCode) {
  console.error("\nNetworking course validation failed.");
} else {
  console.log("\nNetworking course validation passed.");
}
