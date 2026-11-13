import { useEffect, useRef, useState } from "react";
import { DecodeText, LetterRoll } from "./components/KineticText";
import { ForgeCasting } from "./components/ForgeCasting";
import { ComputerXRay } from "./components/ComputerXRay";
import { MoltenCircuit } from "./components/MoltenCircuit";
import { getForgeMotion } from "./lib/forge-motion.mjs";

const images = {
  network:
    "https://images.unsplash.com/photo-1783683783819-e6cb806bba69?auto=format&fit=crop&w=2200&q=90",
  fortran:
    "https://images.unsplash.com/photo-1578307898411-f6930dadea39?auto=format&fit=crop&w=2200&q=90",
  closing:
    "https://images.unsplash.com/photo-1754791664122-82e36cfe69a5?auto=format&fit=crop&w=2200&q=90",
};

const archiveItems = [
  {
    year: "1990",
    title: "The Internet",
    type: "Field disk",
    href: "/disks/internet/",
    preview: images.network,
  },
  {
    year: "1958",
    title: "Gaming History",
    type: "Field disk",
    href: "/disks/gaming-history/",
    preview: images.closing,
  },
  {
    year: "1971",
    title: "Oregon Trail",
    type: "Field disk",
    href: "/disks/oregon-trail/",
    preview: "/assets/retro-computer-front.webp",
  },
  {
    year: "2025",
    title: "Visual OS Notes",
    type: "Field guide",
    href: "https://brittneyleighb.gumroad.com/l/smbpyt",
    preview: images.fortran,
  },
];

function Arrow() {
  return (
    <span className="arrow" aria-hidden="true">
      ↗
    </span>
  );
}

function SplitText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`split-text ${className}`} aria-label={children}>
      {children.split("").map((character, index) => (
        <span
          className="split-character"
          style={{ "--character": index } as React.CSSProperties}
          aria-hidden="true"
          key={`${character}-${index}`}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [heroReady] = useState(true);
  const introStartedAt = useRef<number | null>(null);
  const [archivePreview, setArchivePreview] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewFrame = useRef<number | null>(null);
  const previewPosition = useRef({ x: 0, y: 0 });

  const movePreview = (event: React.PointerEvent<HTMLAnchorElement>) => {
    previewPosition.current = { x: event.clientX, y: event.clientY };
    if (previewFrame.current !== null) return;
    previewFrame.current = window.requestAnimationFrame(() => {
      const position = previewPosition.current;
      previewRef.current?.style.setProperty(
        "transform",
        `translate3d(${position.x}px, ${position.y}px, 0)`,
      );
      previewFrame.current = null;
    });
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = performance.now();
    // Hold for a consistent minimum from mount; never extend the wait on image load.
    if (introStartedAt.current === null) introStartedAt.current = now;
    const elapsed = now - introStartedAt.current;
    const revealAfter = reducedMotion ? 0 : heroReady ? 1750 : 2400;
    const remaining = Math.max(0, revealAfter - elapsed);
    const timer = window.setTimeout(() => setIntroComplete(true), remaining);
    return () => window.clearTimeout(timer);
  }, [heroReady]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const documentTravel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const documentProgress = Math.min(1, Math.max(0, window.scrollY / documentTravel));
      document.documentElement.style.setProperty("--page-progress", documentProgress.toFixed(4));
      document.querySelectorAll<HTMLElement>("[data-scroll-scene]").forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        // Normal document flow: progress describes the scene leaving the viewport,
        // not a long sticky track that holds the visitor on the same section.
        const travel = Math.max(1, rect.height);
        const progress = Math.min(1, Math.max(0, -rect.top / travel));
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.style.setProperty(
          "--scene-inset",
          `${Math.max(0, (1 - progress) * 28).toFixed(2)}px`,
        );
        scene.style.setProperty(
          "--scene-radius",
          `${Math.max(0, (1 - progress) * 16).toFixed(2)}px`,
        );
        if (scene.classList.contains("hero-scroll")) {
          const motion = getForgeMotion(progress);
          const units: Record<keyof typeof motion, string> = {
            forgeX: "px", forgeY: "px", forgeScale: "",
            embersFarY: "px", embersNearY: "px", smokeY: "px",
            glintOpacity: "", copyY: "px", copyOpacity: "",
          };
          for (const key of Object.keys(motion) as Array<keyof typeof motion>) {
            scene.style.setProperty(
              `--${key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase())}`,
              `${motion[key].toFixed(3)}${units[key]}`,
            );
          }
        }
      });
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;
      document.documentElement.style.setProperty("--pointer-shift-x", `${x.toFixed(2)}px`);
      document.documentElement.style.setProperty("--pointer-shift-y", `${y.toFixed(2)}px`);
      document.documentElement.style.setProperty(
        "--pointer-shift-x-soft",
        `${(-x * 0.45).toFixed(2)}px`,
      );
      document.documentElement.style.setProperty(
        "--pointer-shift-y-soft",
        `${(-y * 0.45).toFixed(2)}px`,
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => () => {
    if (previewFrame.current !== null) window.cancelAnimationFrame(previewFrame.current);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!introComplete) return;
    const elements = document.querySelectorAll<HTMLElement>(".split-text");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [introComplete]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.querySelector<HTMLElement>(".site");
    const elements = document.querySelectorAll<HTMLElement>(".chapter-reveal");
    if (!root || elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    root.classList.add("motion-ready");

    return () => {
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return (
    <div className="site">
      <div className={`intro-layer ${introComplete ? "is-complete" : ""}`} aria-hidden="true">
        <div className="intro-brand">
          {"BIT FOUNDRY".split("").map((letter, index) => (
            <span style={{ "--letter": index } as React.CSSProperties} key={`${letter}-${index}`}>
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </div>
        <div className="intro-progress">
          <span />
        </div>
      </div>

      <header className="nav-shell">
        <button
          className="menu-toggle"
          type="button"
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className="menu-toggle__icon" aria-hidden="true"><i /><i /></span>
        </button>
      </header>

      <div id="primary-navigation" className={`menu-layer ${menuOpen ? "is-open" : ""}`} inert={!menuOpen}>
        <nav aria-label="Main navigation">
          {[
            ["Home", "#top"],
            ["About", "#about"],
            ["Labs", "/labs/"],
            ["Networking", "/learn/networking/"],
            ["Fortran", "/learn/fortran/"],
            ["Projects", "#products"],
            ["Archive", "#archive"],
          ].map(([label, href]) => (
            <a href={href} key={label} aria-label={label} onClick={() => setMenuOpen(false)}>
              <span className="menu-link-label"><LetterRoll text={label} /></span>
              <Arrow />
            </a>
          ))}
        </nav>
        <div className="menu-social">
          <a href="mailto:hello@bitfoundrylabs.io">Contact</a>
          <a href="https://github.com/bit-foundry-labs" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
        </div>
      </div>

      <main>
        <section className="hero-scroll" id="top" data-scroll-scene>
          <div className="hero-sticky forge-scene">
            <div className="forge-art" aria-hidden="true">
              <img className="forge-art__image" src="/assets/molten-foundry-hero.webp" alt="" fetchPriority="high" />
              <div className="forge-art__heat" />
              <div className="forge-art__reflection" />
            </div>
            <div className="hero-tint" aria-hidden="true" />
            <div className="hero-grain" aria-hidden="true" />
            <div className="hero-copy">
              <h1>
                <SplitText>Welcome to</SplitText>
                <SplitText className="hero-accent">the Foundry.</SplitText>
              </h1>
              <p>
                Look beneath the surface.
                <span> Beautiful tools and interactive lessons about the machinery inside computing.</span>
              </p>
            </div>
            <a className="scroll-cue" href="#about" aria-label="Scroll to discover Bit Foundry">
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section className="about-section" id="about">
          <ForgeCasting tool="hammer" />
          <div className="about-intro">
            <p>
              Bit Foundry is one idea, and the studio built around it:
              <em> complex systems should feel understandable.</em>
            </p>
          </div>
          <div className="about-columns">
            <p className="chapter-reveal">
              We build systems software, developer tools, and educational experiences for people who
              want to know what is really happening beneath the screen.
            </p>
            <p className="chapter-reveal" style={{ "--reveal-index": 1 } as React.CSSProperties}>
              Every project begins with the same act: opening the black box. We preserve the depth,
              remove the intimidation, and turn invisible behavior into something you can touch.
            </p>
          </div>
          <a className="soft-button" href="/labs/">
            <span>Explore interactive labs</span>
            <Arrow />
          </a>
        </section>

        <section className="artifact-scroll" data-scroll-scene>
          <div className="artifact-sticky artifact-sticky--xray">
            <ComputerXRay>
              <h2>
                <SplitText>The machine</SplitText>
                <br />
                <SplitText className="artifact-accent">is the story.</SplitText>
              </h2>
              <p>
                Hardware, software, protocols, and people: each layer leaves a trace.
                Explore the architecture underneath.
              </p>
            </ComputerXRay>
          </div>
        </section>

        <section className="project-scroll project-network" id="labs" data-scroll-scene>
          <div className="project-sticky">
            <img
              className="cinematic-image"
              src={images.network}
              alt="Ethernet cables connected to network hardware"
            />
            <div className="project-wash" />
            <div className="project-copy">
              <h2>Computer Networking</h2>
              <p>
                Follow one page load through DNS, TCP, TLS, and HTTP. Every request leaves a visible
                trail.
              </p>
              <a
                className="glass-button"
                href="/learn/networking/"
              >
                <span>Open lesson</span>
                <Arrow />
              </a>
            </div>
            <MoltenCircuit />
          </div>
        </section>

        <section className="project-scroll project-fortran" data-scroll-scene>
          <div className="project-sticky">
            <img
              className="cinematic-image"
              src={images.fortran}
              alt="Historical computer operator working at an early computer"
            />
            <div className="project-wash" />
            <div className="project-copy">
              <h2>Fortran</h2>
              <p>
                Meet the compiler, edit the source, and run a Fibonacci loop in a language that
                helped shape scientific computing.
              </p>
              <a
                className="glass-button"
                href="/learn/fortran/"
              >
                <span>Open lesson</span>
                <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="archive-section" id="archive">
          <ForgeCasting tool="compass" />
          <div className="archive-heading">
            <h2><DecodeText text="Field archive" /></h2>
            <p>Fragments from the systems that brought us here.</p>
          </div>
          <div className="archive-list">
            {archiveItems.map((item, index) => (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                key={item.title}
                className="chapter-reveal"
                style={{ "--reveal-index": index } as React.CSSProperties}
                onPointerEnter={() => setArchivePreview(index)}
                onPointerLeave={() => setArchivePreview(null)}
                onPointerMove={movePreview}
              >
                <span>{item.year}</span>
                <strong>{item.title}</strong>
                <Arrow />
              </a>
            ))}
          </div>
          <div
            ref={previewRef}
            className={`archive-preview ${archivePreview !== null ? "is-visible" : ""}`}
            aria-hidden="true"
          >
            {archivePreview !== null && <img src={archiveItems[archivePreview].preview} alt="" />}
          </div>
        </section>

        <section className="forge-section" id="products">
          <ForgeCasting tool="blade" />
          <div className="forge-heading">
            <h2><DecodeText text="ForgeLoop" /></h2>
          </div>
          <div className="forge-detail chapter-reveal">
            <p>
              A local-first engineering workspace for moving approved objectives forward without
              repeated prompting, while keeping budgets, review, and shipping decisions in your hands.
            </p>
            <a href="/forgeloop/">
              <span>Explore ForgeLoop</span>
              <Arrow />
            </a>
          </div>
        </section>

        <section className="closing-scroll" data-scroll-scene>
          <div className="closing-sticky">
            <div className="closing-wash" />
            <div className="closing-copy">
              <p>Different systems, the same human desire to understand.</p>
              <h2>
                You bring the curiosity.
                <br />
                <em>We’ll open the box.</em>
              </h2>
              <a href="mailto:hello@bitfoundrylabs.io">
                Start a conversation <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-mark">Bit Foundry</div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="/labs/">Labs</a>
          <a href="#archive">Archive</a>
          <a href="https://github.com/bit-foundry-labs" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bit Foundry Labs LLC</span>
          <a href="#top">Back to the Foundry ↑</a>
        </div>
      </footer>
    </div>
  );
}
