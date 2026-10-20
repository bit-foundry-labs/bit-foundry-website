(() => {
  const canvas = document.querySelector(".matrix-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: false });
  const screen = canvas.closest(".matrix-screen");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const glyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/<=>?[]{}|";
  let columns = [];
  let width = 0;
  let height = 0;
  let fontSize = 12;
  let frame = 0;
  let animationId = 0;
  let pixelRatio = 1;

  function randomGlyph() {
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  function resize() {
    const bounds = screen.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    fontSize = width < 300 ? 9 : 12;
    context.font = `500 ${fontSize}px "DM Mono", monospace`;

    const count = Math.ceil(width / (fontSize * 1.15));
    columns = Array.from({ length: count }, () => {
      const length = 5 + Math.floor(Math.random() * 15);
      return {
        y: Math.random() * (height / fontSize),
        speed: 0.16 + Math.random() * 0.32,
        length,
        chars: Array.from({ length }, randomGlyph),
        changeEvery: 3 + Math.floor(Math.random() * 9),
      };
    });
    context.fillStyle = "#020503";
    context.fillRect(0, 0, width, height);
    if (reducedMotion.matches) drawStill();
  }

  function drawStill() {
    columns.forEach((column, i) => {
      const x = i * fontSize * 1.15;
      column.chars.forEach((char, trail) => {
        const y = (column.y - trail) * fontSize;
        if (y < 0 || y > height) return;
        context.globalAlpha = Math.max(0.08, 1 - trail / column.length);
        context.fillStyle = trail === 0 ? "#e4ffc7" : "#73ff4e";
        context.fillText(char, x, y);
      });
    });
    context.globalAlpha = 1;
  }

  function draw() {
    animationId = 0;
    if (document.hidden || reducedMotion.matches) return;
    context.fillStyle = "rgba(2, 5, 3, 0.16)";
    context.fillRect(0, 0, width, height);
    context.font = `500 ${fontSize}px "DM Mono", monospace`;

    columns.forEach((column, i) => {
      const x = i * fontSize * 1.15;
      for (let trail = column.length - 1; trail >= 0; trail--) {
        const y = (column.y - trail) * fontSize;
        if (y < 0 || y > height) continue;
        context.globalAlpha = Math.max(0.1, 1 - trail / column.length);
        context.fillStyle = trail === 0 ? "#efffd5" : "rgb(104, 255, 72)";
        if (trail === 0) {
          context.shadowBlur = 9;
          context.shadowColor = "#a8ff66";
        } else {
          context.shadowBlur = 0;
        }
        context.fillText(column.chars[trail], x, y);
      }
      context.shadowBlur = 0;
      context.globalAlpha = 1;

      if (frame % column.changeEvery === 0 && Math.random() > 0.38) {
        const index = Math.floor(Math.random() * column.length);
        column.chars[index] = randomGlyph();
      }
      column.y += column.speed;
      if ((column.y - column.length) * fontSize > height && Math.random() > 0.025) {
        column.y = -Math.random() * 12;
        column.length = 5 + Math.floor(Math.random() * 15);
        column.chars = Array.from({ length: column.length }, randomGlyph);
        column.speed = 0.16 + Math.random() * 0.32;
      }
    });

    frame++;
    animationId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (!animationId && !document.hidden && !reducedMotion.matches) {
      animationId = window.requestAnimationFrame(draw);
    }
  }

  function motionChanged() {
    window.cancelAnimationFrame(animationId);
    animationId = 0;
    context.fillStyle = "#020503";
    context.fillRect(0, 0, width, height);
    if (reducedMotion.matches) drawStill();
    else start();
  }

  new ResizeObserver(resize).observe(screen);
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", motionChanged);
  resize();
  start();
})();
