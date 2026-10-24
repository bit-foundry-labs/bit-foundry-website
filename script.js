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
  let audio;
  const tone = (frequency, duration, type = "square", volume = 0.035, delay = 0) => {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const at = audio.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(volume, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(at); oscillator.stop(at + duration);
    } catch (_) {}
  };
  const pickupSound = () => { tone(780, .045, "square", .025); tone(1120, .035, "triangle", .018, .035); };
  const insertSound = () => { tone(180, .08, "triangle", .045); tone(520, .12, "square", .025, .075); };
  const near = (a, b, radius = 105) => {
    const acx = a.left + a.width / 2, acy = a.top + a.height / 2;
    const bcx = b.left + b.width / 2, bcy = b.top + b.height / 2;
    return Math.hypot(acx - bcx, acy - bcy) < radius;
  };
  const insert = (disk, fromRect) => {
    if (!artwork || !drive || disk.classList.contains("is-inserting")) return;
    const target = drive.getBoundingClientRect();
    const dx = target.left + target.width / 2 - (fromRect.left + fromRect.width / 2);
    const dy = target.top + target.height / 2 - (fromRect.top + fromRect.height / 2);
    disk.classList.remove("is-held", "is-dragging");
    disk.style.left = fromRect.left + "px";
    disk.style.top = fromRect.top + "px";
    disk.style.width = fromRect.width + "px";
    disk.style.height = fromRect.height + "px";
    disk.style.setProperty("--fly-x", dx + "px");
    disk.style.setProperty("--fly-y", dy + "px");
    disk.classList.add("is-inserting");
    artwork.classList.add("is-loading");
    insertSound();
    if (status) status.textContent = "Inserting " + disk.dataset.diskLabel + " disk.";
    let done = false;
    const open = () => { if (!done) { done = true; window.location.assign(disk.href); } };
    disk.addEventListener("transitionend", (e) => { if (e.propertyName === "transform") open(); }, {once:true});
    window.setTimeout(open, 850);
  };
  document.querySelectorAll("[data-disk-insert]").forEach((disk) => {
    disk.setAttribute("draggable", "false");
    disk.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !artwork || !drive) return;
      event.preventDefault();
      const rect = disk.getBoundingClientRect();
      disk.dataset.startX = event.clientX;
      disk.dataset.startY = event.clientY;
      disk.dataset.dragged = "false";
      disk.dataset.originLeft = rect.left;
      disk.dataset.originTop = rect.top;
      disk.dataset.originWidth = rect.width;
      disk.dataset.originHeight = rect.height;
      disk.classList.add("is-held");
      disk.style.left = rect.left + "px";
      disk.style.top = rect.top + "px";
      disk.style.width = rect.width + "px";
      disk.style.height = rect.height + "px";
      disk.setPointerCapture(event.pointerId);
      pickupSound();
      if (status) status.textContent = "Picked up " + disk.dataset.diskLabel + " disk. Drag it to the computer drive.";
    });
    disk.addEventListener("pointermove", (event) => {
      if (!disk.classList.contains("is-held")) return;
      const dx = event.clientX - Number(disk.dataset.startX);
      const dy = event.clientY - Number(disk.dataset.startY);
      if (Math.hypot(dx, dy) > 5) {
        disk.dataset.dragged = "true";
        disk.classList.add("is-dragging");
      }
      disk.style.left = (Number(disk.dataset.originLeft) + dx) + "px";
      disk.style.top = (Number(disk.dataset.originTop) + dy) + "px";
      const d = drive.getBoundingClientRect();
      const r = disk.getBoundingClientRect();
      artwork.classList.toggle("is-drive-ready", near(r, d));
    });
    disk.addEventListener("pointerup", (event) => {
      if (!disk.classList.contains("is-held")) return;
      const rect = disk.getBoundingClientRect();
      const d = drive.getBoundingClientRect();
      const dragged = disk.dataset.dragged === "true";
      disk.releasePointerCapture(event.pointerId);
      artwork.classList.remove("is-drive-ready");
      if (dragged && near(rect, d)) { insert(disk, rect); return; }
      if (dragged) {
        disk.classList.remove("is-held", "is-dragging");
        disk.style.left = disk.dataset.originLeft + "px";
        disk.style.top = disk.dataset.originTop + "px";
        disk.style.width = disk.dataset.originWidth + "px";
        disk.style.height = disk.dataset.originHeight + "px";
        disk.classList.add("is-returning");
        window.setTimeout(() => disk.classList.remove("is-returning"), 360);
        return;
      }
      disk.classList.remove("is-held", "is-dragging");
      insert(disk, rect);
    });
    disk.addEventListener("pointercancel", () => {
      if (!disk.classList.contains("is-held")) return;
      disk.classList.remove("is-held", "is-dragging");
      artwork?.classList.remove("is-drive-ready");
      disk.style.left = disk.dataset.originLeft + "px";
      disk.style.top = disk.dataset.originTop + "px";
      disk.style.width = disk.dataset.originWidth + "px";
      disk.style.height = disk.dataset.originHeight + "px";
    });
  });
})();