"use strict";

document.querySelectorAll("#year, [data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

 
// Animate Matrix rain on the CRT and let each disk fly into the drive before opening.
(() => {
  const canvas = document.getElementById("hero-matrix-rain");
  const screen = canvas && canvas.parentElement;
  if (canvas && screen) {
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, fontSize = 10, drops = [], speeds = [], last = 0;
    const glyphs = "0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";
    const resize = () => {
      const rect = screen.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      if (!width || !height) return;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = Math.max(7, Math.floor(width / 28));
      const columns = Math.ceil(width / fontSize);
      drops = Array.from({length:columns}, () => Math.random() * (height / fontSize));
      speeds = Array.from({length:columns}, () => .45 + Math.random() * 1.35);
      ctx.clearRect(0, 0, width, height);
    };
    const frame = (time) => {
      if (time - last > 54) {
        last = time;
        ctx.fillStyle = "rgba(0, 7, 1, 0.20)";
        ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + "px Cascadia Code, monospace";
        ctx.shadowBlur = 7; ctx.shadowColor = "#39ff55";
        drops.forEach((drop, i) => {
          const char = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillStyle = Math.random() > .97 ? "#e6ffe8" : (Math.random() > .72 ? "#81ff91" : "#39dc52");
          ctx.fillText(char, i * fontSize, drop * fontSize);
          drops[i] += speeds[i];
          if (drop * fontSize > height && Math.random() > .976) { drops[i] = 0; speeds[i] = .45 + Math.random() * 1.35; }
        });
        ctx.shadowBlur = 0;
      }
      if (!reducedMotion) requestAnimationFrame(frame);
    };
    resize();
    requestAnimationFrame(frame);
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(screen);
    else window.addEventListener("resize", resize);
  }
  const status = document.getElementById("hero-disk-status");
  const artwork = document.querySelector(".hero-artwork");
  const drive = document.querySelector(".hero-drive-target");
  document.querySelectorAll("[data-disk-insert]").forEach((disk) => {
    disk.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !artwork || !drive) return;
      event.preventDefault();
      if (disk.classList.contains("is-inserting")) return;
      const from = disk.getBoundingClientRect(), to = drive.getBoundingClientRect();
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      disk.style.setProperty("--fly-x", dx + "px");
      disk.style.setProperty("--fly-y", dy + "px");
      disk.classList.add("is-inserting");
      artwork.classList.add("is-loading");
      if (status) status.textContent = "Inserting " + disk.dataset.diskLabel + " disk.";
      let navigated = false;
      const open = () => { if (!navigated) { navigated = true; window.location.assign(disk.href); } };
      disk.addEventListener("transitionend", (e) => { if (e.propertyName === "transform") open(); }, {once:true});
      window.setTimeout(open, 900);
    });
  });
})();
