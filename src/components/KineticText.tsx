import { useEffect, useRef, useState } from "react";
import { scrambleFrame } from "../lib/kinetic.mjs";

/** Decodes only when visible. A fixed text measure prevents glyph substitution from shifting layout. */
export function DecodeText({ text }: { text: string }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => scrambleFrame(text, 0, 0));

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setDisplay(text);
      return;
    }

    let animationFrame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || started) return;
        started = true;
        observer.disconnect();
        const start = performance.now();
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(1, elapsed / 880);
          setDisplay(scrambleFrame(text, progress, Math.floor(elapsed / 44)));
          if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
        };
        animationFrame = window.requestAnimationFrame(animate);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [text]);

  return (
    <span ref={elementRef} className="decode-text">
      <span className="sr-only">{text}</span>
      <span className="decode-text__measure" aria-hidden="true">{text}</span>
      <span className="decode-text__visual" aria-hidden="true">{display}</span>
    </span>
  );
}

/** Two copies of a glyph form a vertical roll, with hover and keyboard-focus equivalents. */
export function LetterRoll({ text }: { text: string }) {
  return (
    <span className="letter-roll">
      <span className="sr-only">{text}</span>
      <span className="letter-roll__letters" aria-hidden="true">
        {text.split(/(\s+)/u).map((part, wordIndex) =>
          /^\s+$/u.test(part) ? (
            <span className="letter-roll__space" key={wordIndex}>{part.replace(/ /gu, "\u00a0")}</span>
          ) : (
            <span className="letter-roll__word" key={wordIndex}>
              {Array.from(part).map((letter, letterIndex) => (
                <span className="letter-roll__cell" key={letterIndex}>
                  <span
                    className="letter-roll__stack"
                    style={{ "--letter-index": letterIndex } as React.CSSProperties}
                  >
                    <span>{letter}</span>
                    <span>{letter}</span>
                  </span>
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
