import { useState } from "react";

export const PHASES = [
  {
    id: "pour",
    label: "Pour",
    title: "Liquid possibility",
    description: "Molten metal enters a branching mold; the future traces exist, but cannot carry a signal yet.",
  },
  {
    id: "temper",
    label: "Cool",
    title: "Structure takes shape",
    description: "The metal cools into stable paths. Its geometry now determines which connections are possible.",
  },
  {
    id: "conduct",
    label: "Conduct",
    title: "A request finds its path",
    description: "Signals move through an illustrative sequence: DNS, TCP, TLS, and HTTP. This is a conceptual network analogy, not physical circuitry for those protocols.",
  },
] as const;

export type CircuitPhase = typeof PHASES[number]["id"];

const paths = [
  "M82 146 H176 V90 H290",
  "M176 146 H300 V174 H414",
  "M176 146 H236 V264 H290",
  "M236 264 H414 V322 H514",
];

const chips = [
  { name: "DNS", x: 290, y: 68, index: "01" },
  { name: "TCP", x: 414, y: 151, index: "02" },
  { name: "TLS", x: 290, y: 241, index: "03" },
  { name: "HTTP", x: 514, y: 299, index: "04" },
];

/** Native SVG + stateful forge demonstration; never intercepts scrolling. */
export function MoltenCircuit() {
  const [phase, setPhase] = useState<CircuitPhase>("pour");
  const current = PHASES.find((item) => item.id === phase)!;

  return (
    <div className={"molten-circuit molten-circuit--" + phase}
      aria-label="Interactive molten circuitry demonstration">
      <div className="molten-circuit__drawing">
        <svg viewBox="0 0 600 382" role="img"
          aria-label={"A stream of molten metal that cools into a branching circuit, then carries signal pulses. Stage: " + current.title}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="molten-engrave-grid" width="23" height="23" patternUnits="userSpaceOnUse">
              <path d="M23 0H0V23" stroke="#73503b" strokeWidth=".7" opacity=".27" fill="none"/>
            </pattern>
            <linearGradient id="molten-metal-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a6562b"/>
              <stop offset=".48" stopColor="#ffcb78"/>
              <stop offset="1" stopColor="#ee7b37"/>
            </linearGradient>
            <filter id="molten-core-halo" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6"/>
            </filter>
          </defs>
          <rect width="600" height="382" fill="#0f1110"/>
          <rect width="600" height="382" fill="url(#molten-engrave-grid)"/>
          <rect x="22" y="18" width="556" height="344" rx="2" fill="none"
            stroke="#79513c" strokeWidth="1.2"/>
          <g stroke="#342a23" strokeWidth="21" fill="none"
            strokeLinecap="round" strokeLinejoin="round">
            {paths.map((path) => <path key={path} d={path}/>)}
          </g>
          <g stroke="#76513a" strokeWidth="12" fill="none"
            strokeLinecap="round" strokeLinejoin="round">
            {paths.map((path) => <path key={path} d={path}/>)}
          </g>
          <g className="molten-circuit__liquid" stroke="url(#molten-metal-line)"
            strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {paths.map((path) => <path key={path} d={path}/>)}
          </g>
          <g className="molten-circuit__metal" fill="none"
            strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round">
            {paths.map((path) => <path key={path} d={path} pathLength="1"/>)}
          </g>
          <g className="molten-circuit__signal" fill="none"
            stroke="#fff1c8" strokeWidth="3" strokeLinecap="round">
            {paths.map((path) => <path key={path} d={path}/>)}
          </g>
          <g className="molten-circuit__source">
            <rect x="44" y="116" width="55" height="60" rx="3" fill="#352116"
              stroke="#d28649" strokeWidth="2"/>
            <path d="M55 130 H89 L82 159 H62 Z" fill="#ffa849" opacity=".84"/>
            <path d="M69 116 V100 H76 V116" stroke="#c59267" strokeWidth="3" fill="none"/>
            <circle className="molten-circuit__droplet" cx="83" cy="146" r="6" fill="#ffca68"/>
          </g>
          <g className="molten-circuit__chips">
            {chips.map((chip) => (
              <g key={chip.name}>
                <rect x={chip.x-33} y={chip.y-19} width="66" height="38" rx="2"
                  fill="#221b17" stroke="#bf8b63" strokeWidth="1.5"/>
                <text x={chip.x} y={chip.y+4} textAnchor="middle"
                  fontFamily="monospace" fontWeight="bold" fontSize="15" fill="#f3d3af">
                  {chip.name}
                </text>
              </g>
            ))}
          </g>
          <g fill="none" stroke="#eab37d" opacity=".52">
            <path d="M39 349 H167 M441 349 H562" strokeDasharray="2 8"/>
            <path d="M36 60 V86 M564 60 V86 M36 302 V329 M564 302 V329"/>
          </g>
        </svg>
      </div>
      <div className="molten-circuit__controls" role="group" aria-label="Forging stages">
        {PHASES.map((item) => (
          <button key={item.id} type="button"
            className="molten-circuit__phase"
            aria-pressed={phase === item.id}
            onClick={() => setPhase(item.id)}>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
      <div className="molten-circuit__readout" aria-live="polite" aria-atomic="true">
        <strong>{current.title}</strong>
        <p>{current.description}</p>
      </div>
    </div>
  );
}
