export interface HeroMotion {
  earthX: number; earthY: number; earthScale: number; earthRotation: number;
  earthMobileY: number; earthMobileScale: number; distantStarsY: number;
  nearStarsY: number; haloY: number; orbitOuterY: number; orbitInnerY: number;
  copyY: number; copyOpacity: number;
}
export function getHeroMotion(progress: number): HeroMotion;
