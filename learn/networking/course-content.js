"use strict";

(() => {
  const host = document.querySelector("[data-course-module-source]");
  const chapters = Array.from({ length: 9 }, (_, index) =>
    "./content/chapter-" + String(index + 1).padStart(2, "0") + ".html"
  );

  window.networkingContentReady = host
    ? Promise.all(chapters.map((path) => fetch(path).then((response) => {
        if (!response.ok) throw new Error("Could not load " + path);
        return response.text();
      })))
        .then((content) => {
          host.innerHTML = content.join("\n");
          host.removeAttribute("aria-busy");
        })
        .catch((error) => {
          host.innerHTML = "<p class='course-content-error'>Course modules could not load. Refresh the page and try again.</p>";
          host.removeAttribute("aria-busy");
          throw error;
        })
    : Promise.resolve();
})();
