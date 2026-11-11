/** Bounded forge-scene motion, separate from ambient CSS animations. */
export function getForgeMotion(progress) {
  const p = Number.isFinite(progress) ? Math.max(0,Math.min(1,progress)) : 0;
  return {
    forgeX: -12-18*p, forgeY: -2-37*p, forgeScale: 1.08-.045*p,
    embersFarY: 35-85*p, embersNearY: 105-177*p, smokeY: 30-98*p,
    glintOpacity: .7-.22*p, copyY: -64*p,
    copyOpacity: Math.max(.15,1-.85*p),
  };
}
