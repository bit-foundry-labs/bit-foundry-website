/** Bounded, deterministic Earth parallax; no scrolling library or external runtime. */
export function getHeroMotion(progress) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  return {
    earthX: 105 - 235 * p,
    earthY: 180 - 360 * p,
    earthScale: 1.63 - 0.57 * p,
    earthRotation: 1.6 - 3.2 * p,
    earthMobileY: 112 - 235 * p,
    earthMobileScale: 1.36 - 0.19 * p,
    distantStarsY: 35 - 100 * p,
    nearStarsY: 145 - 325 * p,
    haloY: 165 - 390 * p,
    orbitOuterY: 95 - 250 * p,
    orbitInnerY: -100 + 285 * p,
    copyY: -150 * p,
    copyOpacity: Math.max(0, 1 - 1.12 * p),
  };
}
