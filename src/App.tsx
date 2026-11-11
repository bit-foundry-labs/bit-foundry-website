import { useEffect, useRef, useState } from "react";
import { DecodeText, LetterRoll } from "./components/KineticText";
import { ForgeCasting } from "./components/ForgeCasting";
import { ComputerXRay } from "./components/ComputerXRay";
import { getForgeMotion } from "./lib/forge-motion.mjs";

const images = {
  hero: "/assets/forge-hall-desktop.webp",
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

const products = [
  {
    number: "001",
    label: "Origin",
    title: "Observe the system",
    text: "We start at the layer most software hides: packets, memory, compilers, processes, and protocols.",
  },
  {
    number: "002",
    label: "Translation",
    title: "Make it tangible",
    text: "Dense technical behavior becomes motion, space, cause and effect—without losing its truth.",
  },
  {
    number: "003",
    label: "Release",
    title: "Invite exploration",
    text: "The result is not a diagram to study, but a living environment that rewards curiosity.",
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
  const [heroReady, setHeroReady] = useState(false);
  const introStartedAt = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("About");
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
        const travel = Math.max(1, rect.height - window.innerHeight);
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
    const labels: Record<string, string> = {
      top: "Home",
      about: "About",
      method: "Method",
      labs: "Labs",
      archive: "Archive",
      products: "Products",
    };
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(labels[visible.target.id] ?? "Explore");
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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

  const chapterNames = ["Home", "About", "Method", "Labs", "Archive", "Products"];
  const chapterNumber = Math.max(1, chapterNames.indexOf(activeSection) + 1);

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
        <small>Connecting to system</small>
      </div>

      <aside className="chapter-progress" aria-hidden="true">
        <span className="chapter-progress__name">{activeSection}</span>
        <span className="chapter-progress__track"><span className="chapter-progress__fill" /></span>
        <span className="chapter-progress__count">{String(chapterNumber).padStart(2, "0")} / 06</span>
      </aside>

      <header className="nav-shell">
        <a className="nav-location" href="#labs">
          Labs
        </a>
        <a className="wordmark" href="#top" aria-label="Bit Foundry Labs home">
          <span>Bit Foundry</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : activeSection}</span>
          <i />
        </button>
      </header>

      <div className={`menu-layer ${menuOpen ? "is-open" : ""}`} inert={!menuOpen}>
        <nav aria-label="Main navigation">
          {[
            ["01", "About", "#about"],
            ["02", "Method", "#method"],
            ["03", "Labs", "#labs"],
            ["04", "Archive", "#archive"],
          ].map(([index, label, href]) => (
            <a href={href} key={label} onClick={() => setMenuOpen(false)}>
              <small>{index}</small>
              <span className="menu-link-label"><LetterRoll text={label} /></span>
              <Arrow />
            </a>
          ))}
        </nav>
        <a
          className="menu-social"
          href="https://github.com/bit-foundry-labs"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <Arrow />
        </a>
      </div>

      <main>
        <section className="hero-scroll" id="top" data-scroll-scene>
          <div className="hero-sticky forge-scene">
            <img
              className="cinematic-image forge-image"
              src={images.hero}
              srcSet="/assets/forge-hall-mobile.webp 1600w, /assets/forge-hall-desktop.webp 1672w"
              sizes="100vw"
              alt="Ornate ancient swords hanging over a vast foundry where molten metal runs into an anvil casting"
              fetchPriority="high"
              onLoad={() => setHeroReady(true)}
            />
            <div className="forge-smoke" aria-hidden="true" />
            <div className="forge-heat" aria-hidden="true" />
            <div className="forge-embers forge-embers--far" aria-hidden="true" />
            <div className="forge-embers forge-embers--near" aria-hidden="true" />
            <div className="forge-sword-glint" aria-hidden="true" />
            <div className="hero-tint" aria-hidden="true" />
            <div className="hero-grain" aria-hidden="true" />
            <div className="hero-coordinate hero-coordinate--left" aria-hidden="true">
              <span>01 / THE FOUNDRY</span>
              <span>FORM · FIRE · FUNCTION</span>
            </div>
            <div className="hero-coordinate hero-coordinate--right" aria-hidden="true">
              <span>CRAFT / PRECISION</span>
              <span>IDEAS INTO SYSTEMS</span>
            </div>
            <div className="hero-copy">
              <span className="hero-kicker">BIT FOUNDRY LABS / SOFTWARE & SYSTEMS STUDIO</span>
              <h1>
                <SplitText>Welcome to</SplitText>
                <SplitText className="hero-accent">the Foundry.</SplitText>
              </h1>
              <p>
                Look beneath the surface.
                <span> Beautiful tools and interactive lessons about the machinery inside computing.</span>
              </p>
            </div>
            <a className="scroll-cue" href="#about">
              <span>Enter the foundry</span>
              <i>↓</i>
            </a>
          </div>
        </section>

        <section className="about-section" id="about">
          <ForgeCasting tool="hammer" number="01" />
          <div className="section-number">
            <span>(01)</span>
            <span><DecodeText text="About the foundry" /></span>
          </div>
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
          <a className="soft-button" href="#labs">
            <span>See the labs</span>
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

        <section className="method-section" id="method">
          <ForgeCasting tool="calipers" number="02" />
          <div className="section-number light">
            <span>(02)</span>
            <span><DecodeText text="How we shape understanding" /></span>
          </div>
          <div className="method-lead">
            <p>We don’t simplify the subject.</p>
            <p>We change the way you meet it.</p>
          </div>
          <div className="method-list">
            {products.map((item, index) => (
              <article className="chapter-reveal" style={{ "--reveal-index": index } as React.CSSProperties} key={item.number}>
                <div className="method-index">
                  <span>{item.number}</span>
                  <span>— {item.label}</span>
                </div>
                <h3><LetterRoll text={item.title} /></h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lab-intro" id="labs">
          <ForgeCasting tool="key" number="03" />
          <span>(03) <DecodeText text="Interactive environments" /></span>
          <h2>
            <SplitText>Two ways</SplitText>
            <br />
            <SplitText>into the system.</SplitText>
          </h2>
        </section>

        <section className="project-scroll project-network" data-scroll-scene>
          <div className="project-sticky">
            <img
              className="cinematic-image"
              src={images.network}
              alt="Ethernet cables connected to network hardware"
            />
            <div className="project-wash" />
            <div className="project-copy">
              <span>External system / 001</span>
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
            <div className="project-code">
              <span>DNS</span>
              <i />
              <span>TCP</span>
              <i />
              <span>TLS</span>
              <i />
              <span>HTTP</span>
            </div>
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
              <span>Compiled system / 002</span>
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
            <div className="code-whisper" aria-hidden="true">
              <span>PROGRAM FIBONACCI</span>
              <span>DO I = 1, 8</span>
              <span>PRINT *, A</span>
              <span>END DO</span>
            </div>
          </div>
        </section>

        <section className="archive-section" id="archive">
          <ForgeCasting tool="compass" number="04" />
          <div className="archive-heading">
            <span className="archive-count">(04)</span>
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
                <span>{item.type}</span>
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
          <ForgeCasting tool="blade" number="05" />
          <div className="forge-heading">
            <span>Currently in development</span>
            <h2><DecodeText text="ForgeLoop" /></h2>
          </div>
          <div className="forge-detail chapter-reveal">
            <p>
              An autonomous engineering workspace with bounded agents, explicit objectives, and
              human oversight.
            </p>
            <a href="https://github.com/bit-foundry-labs" target="_blank" rel="noreferrer">
              <span>Discover our work</span>
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
          <a href="#labs">Labs</a>
          <a href="#archive">Archive</a>
          <a href="https://github.com/bit-foundry-labs" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bit Foundry Labs LLC</span>
          <span>Forge artwork · Bit Foundry Labs</span>
          <a href="#top">Back to the Foundry ↑</a>
        </div>
      </footer>
    </div>
  );
}