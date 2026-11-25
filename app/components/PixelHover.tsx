"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const COLOR = "#3155e7"; // accent

/** Ordre aléatoire : rang[i] = position de la case i dans le tirage. */
function randomRanks(n: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const ranks = new Array<number>(n);
  order.forEach((cell, rank) => (ranks[cell] = rank));
  return ranks;
}

/**
 * Survol d'une image (la photo de profil) : elle se remplit de petits carrés bleus posés au hasard,
 * jusqu'à être entièrement couverte, puis les carrés disparaissent dans un autre ordre
 * et l'image revient.
 *
 * Se place dans le conteneur (position: relative) de l'image, et écoute son survol.
 * Dessiné sur un <canvas> : quelques centaines de carrés sans créer d'éléments DOM.
 */
export default function PixelHover({ cell: CELL = 16 }: { /** Côté d'un carré, en px CSS. */ cell?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const host = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !host || !ctx) return;

    let tl: gsap.core.Timeline | null = null;

    const play = () => {
      if (tl?.isActive()) return;
      // Uniquement avec une vraie souris, et pas si l'utilisateur limite les animations.
      if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;

      // clientWidth/Height : taille réelle, sans les transforms de l'entrée.
      const w = host.clientWidth;
      const h = host.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const n = cols * rows;
      const fillRank = randomRanks(n);
      const clearRank = randomRanks(n);
      const p = { fill: 0, clear: 0 };

      const draw = () => {
        const filled = p.fill * n;
        const cleared = p.clear * n;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = COLOR;
        for (let i = 0; i < n; i++) {
          if (fillRank[i] < filled && clearRank[i] >= cleared) {
            // Légèrement plus grand (+0.5px) pour éviter les liserés entre deux carrés.
            ctx.fillRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL + 0.5, CELL + 0.5);
          }
        }
      };

      tl = gsap
        .timeline({ onUpdate: draw, onComplete: () => ctx.clearRect(0, 0, w, h) })
        // Plus lent et en inOut : les carrés arrivent et repartent en douceur, sans à-coup au milieu.
        .to(p, { fill: 1, duration: 0.9, ease: "power2.inOut" })
        .to(p, { clear: 1, duration: 1.1, ease: "power2.inOut" }, "+=0.1");
    };

    host.addEventListener("pointerenter", play);
    return () => {
      host.removeEventListener("pointerenter", play);
      tl?.kill();
    };
  }, [CELL]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
