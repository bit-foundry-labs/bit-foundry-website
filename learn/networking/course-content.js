"use strict";

(() => {
  const host = document.querySelector("[data-course-module-source]");
  const course = window.BIT_FOUNDRY_NETWORKING_COURSE;

  if (!host || !course) {
    window.networkingContentReady = Promise.resolve();
    return;
  }

  window.networkingContentReady = Promise.all(
    course.chapterFiles.map((path) =>
      fetch(path).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${path}`);
        }
        return response.text();
      })
    )
  )
    .then((chapters) => {
      host.innerHTML = chapters.join("\n");
      host.removeAttribute("aria-busy");
    })
    .catch((error) => {
      host.innerHTML =
        "<p class='course-content-error'>Course modules could not load. Refresh the page and try again.</p>";
      host.removeAttribute("aria-busy");
      throw error;
    });
})();
