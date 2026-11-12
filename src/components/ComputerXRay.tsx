import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  clampInspectionPoint,
  closestInspectablePart,
  DEFAULT_INSPECTION,
} from "../lib/xray-model.mjs";

type ComputerXRayProps = { children: ReactNode };

const CRT_OUTLINE = "M489 108 L483 118 L482 527 L492 537 L522 539 L527 549 L465 552 L404 588 L401 722 L340 730 L262 860 L263 882 L278 892 L276 898 L290 902 L323 904 L626 902 L695 908 L785 906 L807 910 L1162 906 L1175 900 L1196 878 L1198 856 L1157 726 L1129 719 L1128 591 L1071 552 L1005 549 L1010 539 L1037 538 L1049 529 L1048 111 L1037 104 Z";

/**
 * A low-cost inspection lens layered over the original vintage-computer artwork.
 * The diagrams describe general computer architecture, not an exact hardware teardown.
 */
export function ComputerXRay({ children }: ComputerXRayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [lens, setLens] = useState(DEFAULT_INSPECTION);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const active = pinned || hovered;
  const selected = closestInspectablePart(lens.x, lens.y);

  function positionLens(event: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const mapped = point.matrixTransform(matrix.inverse());
    setLens(clampInspectionPoint(mapped.x, mapped.y));
  }

  function moveLens(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.pointerType === "touch") return;
    positionLens(event);
    setHovered(true);
  }

  function touchLens(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.pointerType !== "touch") return;
    positionLens(event);
    setPinned(true);
  }

  return (
    <>
      <div className={"artifact-image artifact-image--cutout xray-stage" + (active ? " is-active" : "")}
        data-inspecting={active ? "true" : "false"}>
        <svg
          ref={svgRef}
          className="artifact-computer xray-computer"
          viewBox="0 0 1536 1024"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Vintage desktop computer with an interactive, illustrative map of processor, memory, bus and input-output"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse" || event.pointerType === "pen") setHovered(true);
          }}
          onPointerMove={moveLens}
          onPointerDown={touchLens}
          onPointerLeave={() => setHovered(false)}
        >
          <defs>
            <clipPath id="xray-computer-outline">
              <path d={CRT_OUTLINE} />
            </clipPath>
            <clipPath id="xray-inspection-lens">
              <circle cx={lens.x} cy={lens.y} r={active ? 226 : 0} />
            </clipPath>
            <pattern id="xray-circuit-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" stroke="#bc8056" strokeWidth="1" opacity=".18" fill="none" />
            </pattern>
            <linearGradient id="xray-machine-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1c2733" />
              <stop offset=".57" stopColor="#202b36" />
              <stop offset="1" stopColor="#151d25" />
            </linearGradient>
          </defs>
          <image href="/assets/retro-computer-front.webp" width="1536" height="1024"
            clipPath="url(#xray-computer-outline)" />

          <g className="xray-internals" aria-hidden="true"
            clipPath="url(#xray-computer-outline)" pointerEvents="none">
            <g clipPath="url(#xray-inspection-lens)">
              <rect x="250" y="98" width="952" height="815" fill="#101922" />
              <rect x="250" y="98" width="952" height="815" fill="url(#xray-circuit-grid)" />
              <rect x="492" y="115" width="548" height="424" rx="13"
                fill="url(#xray-machine-metal)" stroke="#ff8140" strokeWidth="5" />
              <rect x="524" y="150" width="480" height="345" rx="4"
                fill="#101820" stroke="#7d5136" strokeWidth="2" />
              <g className="xray-circuit-traces" stroke="#dc955d" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".82">
                <path d="M636 225 V186 H766 V244 H790" />
                <path d="M750 289 H795 V330 H905 V360" />
                <path d="M611 340 V387 H793 V436" />
                <path d="M560 425 H652 V382 H760 V412 H846" />
                <path d="M900 278 V349 H972 V411" />
                <path d="M678 416 V548 H738 V704" />
                <path d="M930 443 V562 H1045 V688" />
                <path d="M735 703 V750 H1050 V790" />
              </g>
              <g className="xray-signal-traces" stroke="#ffce87" strokeWidth="6" fill="none"
                strokeLinecap="round" opacity=".95">
                <path d="M610 340 V387 H793 V436" />
                <path d="M750 289 H795 V330 H905 V360" />
              </g>
              <rect x="564" y="220" width="182" height="120" rx="7" fill="#26313d"
                stroke="#ff9a58" strokeWidth="5" />
              <rect x="581" y="237" width="149" height="86" fill="#17222d"
                stroke="#8b9ba7" strokeWidth="2" />
              <g fill="#f0f3f6" fontFamily="monospace" fontSize="22">
                <text x="601" y="272">CPU / 01</text>
                <text x="600" y="300" fontSize="15" fill="#b9c5d3">EXECUTE</text>
              </g>
              <g fill="#323f4d" stroke="#f0b881" strokeWidth="3">
                <rect x="784" y="191" width="197" height="81" rx="4" />
                <path d="M805 199V261M827 199V261M849 199V261M871 199V261M893 199V261M915 199V261M937 199V261M959 199V261" />
              </g>
              <text x="808" y="307" fontFamily="monospace" fill="#ffc088" fontSize="21">WORKING MEMORY</text>
              <path d="M554 365H985" stroke="#ff9853" strokeWidth="8" strokeDasharray="15 13" />
              <text x="551" y="402" fontFamily="monospace" fill="#ffcc94" fontSize="20">ADDRESS / DATA / CONTROL</text>
              <rect x="790" y="415" width="202" height="70" rx="5" fill="#283440"
                stroke="#ff9e56" strokeWidth="3" />
              <text x="817" y="456" fontSize="24" fontFamily="monospace" fill="#fff1dc">I/O PORTS</text>
              <g stroke="#e4a267" fill="none" strokeWidth="4">
                <path d="M303 852 H1156 L1121 742 H402 Z" />
                <path d="M339 854 L415 777 H1083 L1124 854" />
                <path d="M384 829 H1100 M414 802 H1077 M455 777 V853 M526 777 V853 M597 777 V853 M668 777 V853 M739 777 V853 M810 777 V853 M881 777 V853 M952 777 V853 M1023 777 V853" />
              </g>
              <g fill="#f5a762">
                <circle cx="611" cy="340" r="8" />
                <circle cx="793" cy="436" r="8" />
                <circle cx="905" cy="360" r="8" />
                <circle cx="735" cy="750" r="9" />
              </g>
            </g>
          </g>
          {active && (
            <g className="xray-lens-bezel" aria-hidden="true" pointerEvents="none"
              clipPath="url(#xray-computer-outline)">
              <circle cx={lens.x} cy={lens.y} r="228" fill="none" stroke="#eeb679"
                strokeWidth="5" opacity=".9" />
              <circle cx={lens.x} cy={lens.y} r="237" fill="none" stroke="#f7c28e"
                strokeWidth="1.5" strokeDasharray="6 13" opacity=".8" />
              <path d={"M" + (lens.x - 18) + " " + lens.y + "h36 M" + lens.x + " " +
                (lens.y - 18) + "v36"} stroke="#ffe4b2" strokeWidth="2" opacity=".85" />
            </g>
          )}
        </svg>
      </div>
      <div className="artifact-copy">
        {children}
        <div className="xray-panel" id="xray-inspection-details">
          <div className="xray-panel-readout" aria-live={pinned ? "polite" : "off"}>
            <strong>{active ? selected.label : "Beyond the casing"}</strong>
            <p>{active ? selected.description :
              "Reveal a conceptual map of processing, memory, signal paths and input."}</p>
          </div>
          <button type="button" className="xray-toggle"
            aria-pressed={pinned} aria-controls="xray-inspection-details"
            onClick={() => {
              setPinned((value) => !value);
              if (!pinned) setLens(DEFAULT_INSPECTION);
            }}>
            <span>{pinned ? "Close inspection" : "Inspect internals"}</span>
            <span aria-hidden="true">{pinned ? "×" : "↗"}</span>
          </button>
          <p className="xray-instructions">
            {pinned ? "Tap or move across the machine to examine another system" :
              "Move over the machine, or tap to open the inspection lens"}
          </p>
        </div>
      </div>
    </>
  );
}
