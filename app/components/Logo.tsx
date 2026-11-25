"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { STUDIO_STROKES } from "./studio-path";

gsap.registerPlugin(DrawSVGPlugin);

/*
 * « Studio. » est dessiné dans le même repère que le loader (Caveat 72px, viewBox 160 × 92),
 * réduit à 16px : échelle 16/72. Le texte et les tracés du stylo restent alignés.
 */
const SCALE = 16 / 72;

/**
 * Logo « Önder Studio. » de la navigation.
 * « Studio. » est superposé au-dessus de « Önder », comme dans le loader.
 * Au survol, seul « Studio. » s'anime : il s'efface puis se réécrit au stylo. « Önder » ne bouge pas.
 */
export default function Logo() {
  const root = useRef<HTMLAnchorElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const replay = () => {
    const el = root.current;
    if (!el || tl.current?.isActive()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pens = gsap.utils.toArray<SVGPathElement>("[data-logo-pen]", el);
    const studio = el.querySelector("[data-logo-studio]");

    // Même écriture que le loader : chaque geste à vitesse constante, micro-pause entre deux.
    const write = gsap.timeline({ paused: true });
    pens.forEach((pen, i) => {
      write
        .set(pen, { visibility: "visible" }, i === 0 ? 0 : "+=0.03")
        .fromTo(pen, { drawSVG: "0%" }, { drawSVG: "100%", duration: Math.max(pen.getTotalLength(), 6) / 100, ease: "none", immediateRender: false });
    });

    tl.current = gsap
      .timeline()
      // « Studio. » s'efface…
      .to(studio, { opacity: 0, duration: 0.25, ease: "power1.out" })
      .set(pens, { visibility: "hidden" })
      .set(studio, { opacity: 1 })
      // …puis le stylo le réécrit (power1.inOut : démarrage et fin en douceur).
      .to(write, { progress: 1, duration: 1, ease: "power1.inOut" });
  };

  return (
    <Link
      ref={root}
      href="/"
      onPointerEnter={replay}
      className="inline-grid font-medium"
      aria-label="Önder Studio, accueil"
    >
      <span aria-hidden className="col-start-1 row-start-1 mt-[3px] text-[20px] tracking-[-0.8px] text-foreground">
        Önder
      </span>

      {/* « Studio. » posé au-dessus de « der » : ligne de base 14px au-dessus de celle de « Önder », et départ à 66 % de sa largeur, comme dans le loader. */}
      <span data-reveal-hand className="col-start-1 row-start-1 ml-[35px] -mt-[6.3px] self-start text-accent">
        <svg
          data-logo-studio
          aria-hidden
          viewBox="0 0 160 92"
          width={160 * SCALE}
          height={92 * SCALE}
          className="block overflow-visible"
        >
          <defs>
            <mask id="logo-studio-pen" maskUnits="userSpaceOnUse" x="-10" y="-10" width="180" height="112">
              {STUDIO_STROKES.map((d) => (
                <path
                  key={d}
                  data-logo-pen
                  d={d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </mask>
          </defs>
          <text
            x={0}
            y={69}
            mask="url(#logo-studio-pen)"
            fill="currentColor"
            style={{ fontFamily: "var(--font-caveat)", fontWeight: 400, fontSize: 72, letterSpacing: -2.88 }}
          >
            Studio.
          </text>
        </svg>
      </span>
    </Link>
  );
}
