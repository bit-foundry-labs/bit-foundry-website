"use strict";

document.querySelectorAll("#year, [data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
