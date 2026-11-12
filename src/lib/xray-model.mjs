/** Educational system-map coordinates in the original 1536×1024 artifact viewBox. */
export const INSPECTABLE_PARTS = Object.freeze([
  Object.freeze({
    id: "cpu", label: "Processor (CPU)", x: 656, y: 287,
    description: "Interprets instructions and coordinates the work of the machine.",
  }),
  Object.freeze({
    id: "memory", label: "Working memory", x: 853, y: 258,
    description: "Holds data and instructions while programs are running.",
  }),
  Object.freeze({
    id: "bus", label: "System bus", x: 741, y: 398,
    description: "Carries addresses, data and control signals between components.",
  }),
  Object.freeze({
    id: "io", label: "Input and output", x: 906, y: 435,
    description: "Connects computation to devices and the outside world.",
  }),
  Object.freeze({
    id: "input", label: "User input", x: 735, y: 790,
    description: "Turns keystrokes into signals a program can process.",
  }),
]);

export const DEFAULT_INSPECTION = Object.freeze({ x: 686, y: 319 });

export function closestInspectablePart(x, y) {
  const px = Number.isFinite(x) ? x : DEFAULT_INSPECTION.x;
  const py = Number.isFinite(y) ? y : DEFAULT_INSPECTION.y;
  return INSPECTABLE_PARTS.reduce((nearest, candidate) => {
    const distance = (part) => (part.x - px) ** 2 + (part.y - py) ** 2;
    return distance(candidate) < distance(nearest) ? candidate : nearest;
  });
}

export function clampInspectionPoint(x, y) {
  return {
    x: Math.max(270, Math.min(1190, Number.isFinite(x) ? x : DEFAULT_INSPECTION.x)),
    y: Math.max(115, Math.min(900, Number.isFinite(y) ? y : DEFAULT_INSPECTION.y)),
  };
}
