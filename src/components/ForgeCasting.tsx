/** Decorative editorial artifact, not a button or an instructional diagram.
 * Every silhouette is hand-authored SVG; the native scroll timeline animates
 * a molten feed, then traces and cools the forged object. No scroll pinning.
 */
const tools = {
  hammer: {
    name: "Strike", concept: "Ideas take form",
    path: "M67 208 L79 208 L79 151 L101 151 L103 126 L45 126 L43 151 L67 151 Z M41 132 L33 132 L33 143 L43 143 M103 132 L111 132 L111 143 L103 143 M71 165 L75 165",
  },
  calipers: {
    name: "Measure", concept: "Precision by design",
    path: "M66 111 L66 205 M81 111 L81 205 M44 111 L103 111 M44 111 L44 144 L54 150 M103 111 L103 144 L93 150 M44 133 L64 133 M83 133 L103 133 M54 165 L93 165 M54 156 L54 175 L93 175 L93 156 M67 192 L81 192",
  },
  key: {
    name: "Unlock", concept: "Learn by doing",
    path: "M74 121 A20 20 0 1 0 74 161 A20 20 0 1 0 74 121 M74 135 A6 6 0 1 0 74 147 A6 6 0 1 0 74 135 M74 161 L74 211 L94 211 L94 198 L83 198 L83 187 L93 187 L93 176 L74 176",
  },
  compass: {
    name: "Navigate", concept: "Follow the traces",
    path: "M74 116 A43 43 0 1 0 74 202 A43 43 0 1 0 74 116 M74 109 L74 120 M74 198 L74 209 M24 159 L37 159 M111 159 L124 159 M74 128 L91 172 L74 166 L57 172 Z M74 190 L57 145 L74 152 L91 145 Z",
  },
  blade: {
    name: "Temper", concept: "Release the work",
    path: "M74 102 L84 119 L80 189 L74 213 L68 189 L64 119 Z M74 112 L74 192 M50 127 L98 127 M50 127 Q42 128 42 117 M98 127 Q106 128 106 117 M71 128 L71 104 L77 104 L77 128 M68 198 L80 198",
  },
} as const;

export type ForgeTool = keyof typeof tools;

export function ForgeCasting({ tool }: { tool: ForgeTool }) {
  const shape = tools[tool];
  const gradientId = "forge-metal-" + tool;
  const channel = "M74 -8 C74 24 55 39 69 66 C89 92 74 100 74 111";
  return (
    <aside className={`forge-casting forge-casting--${tool}`} aria-hidden="true">
      <svg viewBox="0 0 148 244" className="forge-casting__graphic" fill="none"
           strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2=".5" y2="1">
            <stop stopColor="#fff5c9"/>
            <stop offset=".35" stopColor="#ffb343"/>
            <stop offset=".8" stopColor="#ff5d19"/>
            <stop offset="1" stopColor="#6d2b12"/>
          </linearGradient>
        </defs>
        <path className="forge-casting__channel" d={channel}/>
        <path className="forge-casting__stream" d={channel} stroke={`url(#${gradientId})`}/>
        <path className="forge-casting__mold" d={shape.path}/>
        <path className="forge-casting__heat-trace" d={shape.path} stroke={`url(#${gradientId})`}/>
        <path className="forge-casting__metal" d={shape.path}/>
        <circle className="forge-casting__drop" cx="74" cy="110" r="3" fill="#ffbf64"/>
      </svg>
    </aside>
  );
}
