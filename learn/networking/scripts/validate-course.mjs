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
const read = (path) => readFile(path, "utf8");
const fail = (message) => {
  console.error("✗ " + message);
  process.exitCode = 1;
};
const pass = (message) => console.log("✓ " + message);

const [manifest, index, lessons, labs, storage, config, reader] = await Promise.all([
  read(resolve(courseRoot, "course-manifest.js")),
  read(resolve(courseRoot, "index.html")),
  read(resolve(courseRoot, "course-lessons.js")),
  read(resolve(courseRoot, "course-labs.js")),
  read(resolve(courseRoot, "course-storage.js")),
  read(resolve(courseRoot, "course-config.js")),
  read(resolve(courseRoot, "course-reader.js"))
]);

const chapterFiles = [
  ...manifest.matchAll(/"(.\/content\/chapter-[0-9]{2}\.html)"/g)
].map(([, file]) => file);

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
  ...chapterMarkup.matchAll(/<article[^>]* id="(module-[0-9]+-[0-9]+)"/g)
].map(([, id]) => id);
const uniqueModuleIds = new Set(moduleIds);
const expectedLessons = Number(
  manifest.match(/lessonCount:[ 	]*([0-9]+)/)?.[1] ?? 0
);

if (moduleIds.length !== expectedLessons || uniqueModuleIds.size !== expectedLessons) {
  fail(
    `Expected ${expectedLessons} unique module cards; found ${moduleIds.length} cards and ${uniqueModuleIds.size} unique IDs.`
  );
} else {
  pass(`${expectedLessons} unique module cards are present`);
}

const lessonIds = new Set(
  [...lessons.matchAll(/"?(module-[0-9]+-[0-9]+)"?[ 	]*:/g)].map(([, id]) => id)
);
const staleLessonIds = [...lessonIds].filter((id) => !uniqueModuleIds.has(id));
const missingLessonIds = [...uniqueModuleIds].filter((id) => !lessonIds.has(id));

if (staleLessonIds.length || missingLessonIds.length) {
  if (staleLessonIds.length) fail(`Lesson content has stale module data: ${staleLessonIds.join(", ")}.`);
  if (missingLessonIds.length) fail(`Lesson content lacks module data: ${missingLessonIds.join(", ")}.`);
} else {
  pass("lesson content matches every module card");
}

const launchTargets = [
  ...index.matchAll(/data-module-open="(module-[0-9]+-[0-9]+)"/g),
  ...chapterMarkup.matchAll(/data-module-open="(module-[0-9]+-[0-9]+)"/g)
].map(([, id]) => id);
const invalidLaunchTargets = [...new Set(launchTargets)].filter(
  (id) => !uniqueModuleIds.has(id)
);

if (invalidLaunchTargets.length) {
  fail(`Broken module launch target(s): ${invalidLaunchTargets.join(", ")}.`);
} else {
  pass("all module launch targets resolve");
}

const scriptOrder = [
  "course-manifest.js",
  "course-content.js",
  "course-lessons.js",
  "course-labs.js",
  "course-storage.js",
  "course-config.js",
  "course-reader.js"
].map((file) => index.indexOf(file));

if (scriptOrder.some((position) => position < 0)) {
  fail("index.html is missing a required networking course script.");
} else if (scriptOrder.some((position, index) => index > 0 && position < scriptOrder[index - 1])) {
  fail("networking course scripts load in the wrong order.");
} else {
  pass("course scripts load in dependency order");
}

if (
  !/BIT_FOUNDRY_NETWORKING_LESSONS/.test(lessons) ||
  !/buildLessonPages/.test(lessons) ||
  !/BIT_FOUNDRY_NETWORKING_LESSONS/.test(reader) ||
  !/buildLessonPages/.test(reader)
) {
  fail("reader and lesson content are not connected through the lesson boundary.");
} else {
  pass("reader uses the extracted lesson-content boundary");
}

if (
  !/BIT_FOUNDRY_NETWORKING_LABS/.test(labs) ||
  !/BIT_FOUNDRY_NETWORKING_LABS/.test(reader) ||
  /function bind[A-Z]/.test(reader)
) {
  fail("reader and interactive lab binders are not separated cleanly.");
} else {
  pass("reader uses the extracted interactive-lab boundary");
}

if (
  !/BIT_FOUNDRY_NETWORKING_STORAGE/.test(storage) ||
  !/BIT_FOUNDRY_NETWORKING_STORAGE/.test(reader) ||
  /localStorage/.test(reader)
) {
  fail("reader and browser storage are not separated cleanly.");
} else {
  pass("reader uses the extracted browser-storage boundary");
}

if (
  !/BIT_FOUNDRY_NETWORKING_CONFIG/.test(config) ||
  !/BIT_FOUNDRY_NETWORKING_CONFIG/.test(reader) ||
  /const researchSources=/.test(reader) ||
  /const chapterLabModules=/.test(reader)
) {
  fail("reader and curriculum configuration are not separated cleanly.");
} else {
  pass("reader uses the extracted curriculum-configuration boundary");
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
