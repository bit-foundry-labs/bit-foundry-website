"use strict";

/**
 * One source of truth for the course shell.
 * Keep this file limited to structural metadata used by the loader and checks.
 */
(() => {
  window.BIT_FOUNDRY_NETWORKING_COURSE = Object.freeze({
    chapterFiles: Object.freeze([
      "./content/chapter-01.html",
      "./content/chapter-02.html",
      "./content/chapter-03.html",
      "./content/chapter-04.html",
      "./content/chapter-05.html",
      "./content/chapter-06.html",
      "./content/chapter-07.html",
      "./content/chapter-08.html",
      "./content/chapter-09.html"
    ]),
    lessonCount: 41,
    labCount: 9
  });
})();
