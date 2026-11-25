"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { voyages } from "../content/voyages";

/** Largeur de l'image au centre ; les autres sont réduites à 602px (échelle de la maquette). */
const ACTIVE_WIDTH = 808;
/** Tailles de la photo pour le navigateur (partagé avec le zoom galerie → défilement). */
export const SCROLL_IMAGE_SIZES = "(min-width: 840px) 808px, 100vw";
/** Cadre de la photo active dans la maquette (808 × 730) : toutes les photos y sont recadrées. */
const FRAME_RATIO = 808 / 730;
const INACTIVE_SCALE = 602 / 808;
/** La photo qu'on quitte se referme (ease in), puis la nouvelle s'ouvre (expo.out). */
const CLOSE = { duration: 0.6, ease: "power3.in" };
const OPEN = { duration: 1.3, ease: "expo.out", delay: 0.3 };
/** Défilement guidé : un geste = une photo, quelle que soit la vitesse du scroll. */
const SLIDE = { duration: 0.9, ease: "power3.inOut" };
/** Pause (ms) entre deux événements de molette au-delà de laquelle c'est un nouveau geste. */
const QUIET = 160;

/**
 * Mode défilement : les photos défilent verticalement, une par geste ; celle au centre de
 * l'écran est mise en avant (pleine taille), son lieu s'allume dans la liste à gauche et sa
 * légende s'affiche à droite.
 */
export default function VoyagesScroll({
  initialIndex,
  onActiveChange,
  onReady,
}: {
  /** Photo sur laquelle arriver (celle qu'on regardait en galerie). */
  initialIndex: number;
  /** Prévient le parent de la photo active (pour centrer la galerie sur elle). */
  onActiveChange: (index: number) => void;
  /** Appelé une fois en place, avec le cadre de la photo d'arrivée. */
  onReady: (box: HTMLElement) => void;
}) {
  const [active, setActive] = useState(initialIndex);
  const [scrolled, setScrolled] = useState(false);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const caption = useRef<HTMLParagraphElement>(null);
  const activeRef = useRef(initialIndex);
  /** Vrai pendant un défilement guidé : on ignore les autres gestes et le calcul au scroll. */
  const sliding = useRef(false);

  // --- Image active : celle dont le centre est le plus proche du centre de l'écran.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (sliding.current) return;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      frames.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      activeRef.current = best;
      setActive(best);
      if (window.scrollY > 40) setScrolled(true);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // On arrive sur la photo demandée, centrée (la première reste en haut de page).
    const first = frames.current[initialIndex];
    window.scrollTo(
      0,
      first && initialIndex > 0
        ? Math.max(0, first.offsetTop + first.offsetHeight / 2 - window.innerHeight / 2)
        : 0,
    );
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
    // Une seule fois, à l'arrivée (initialIndex ne sert qu'au placement de départ).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Fermeture / ouverture : la photo qu'on quitte se referme d'abord, en accélérant,
  //     puis la nouvelle s'ouvre, ses bords s'agrandissent et ralentissent en douceur.
  const shown = useRef<number | null>(null);
  useEffect(() => {
    const els = frames.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Premier affichage : on place les photos sans animation.
    if (shown.current === null || reduce) {
      els.forEach((el, i) => {
        if (el) gsap.set(el, { scale: i === active ? 1 : INACTIVE_SCALE });
      });
      shown.current = active;
      return;
    }
    els.forEach((el, i) => {
      if (!el) return;
      if (i === active) {
        gsap.to(el, { ...OPEN, scale: 1, overwrite: true });
      } else if (gsap.getProperty(el, "scale") !== INACTIVE_SCALE) {
        gsap.to(el, { ...CLOSE, scale: INACTIVE_SCALE, overwrite: true });
      }
    });
    shown.current = active;
  }, [active]);

  // --- Parent : photo active, et position de la photo d'arrivée une fois en place.
  useEffect(() => {
    onActiveChange(active);
  }, [active, onActiveChange]);
  useEffect(() => {
    const el = frames.current[initialIndex];
    // Le cadre de la photo (sans la légende mobile en dessous).
    const box = el?.firstElementChild;
    if (box instanceof HTMLElement) onReady(box);
    // Une seule fois, à l'arrivée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Légende : la nouvelle apparaît en fondu avec une légère montée (même entrée que la page).
  useEffect(() => {
    if (
      !caption.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    gsap.fromTo(
      caption.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true },
    );
  }, [active]);

  // --- Défilement guidé : chaque geste (molette, trackpad, glissé au doigt, flèches) amène
  //     la photo suivante ou précédente au centre, avec une animation qu'on maîtrise.
  const goTo = useCallback((target: number) => {
    const i = gsap.utils.clamp(0, voyages.length - 1, target);
    const el = frames.current[i];
    if (!el) return;
    sliding.current = true;
    activeRef.current = i;
    setActive(i);
    setScrolled(true);
    // offsetTop/offsetHeight ignorent l'échelle en cours : on vise le centre réel de la photo.
    const y = Math.max(0, el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(window, {
      ...SLIDE,
      duration: reduce ? 0 : SLIDE.duration,
      scrollTo: { y, autoKill: false },
      overwrite: true,
      // Le verrou tombe dès que la photo est arrivée (ou si l'animation est interrompue) :
      // l'inertie du trackpad, elle, est filtrée à la source (voir onWheel).
      onComplete: () => {
        sliding.current = false;
      },
      onInterrupt: () => {
        sliding.current = false;
      },
    });
  }, []);

  useEffect(() => {
    gsap.registerPlugin(Observer, ScrollToPlugin);
    const step = (dir: 1 | -1) => {
      if (!sliding.current) goTo(activeRef.current + dir);
    };

    // Molette et trackpad : un geste = une photo. Après un geste, le trackpad continue
    // d'envoyer des événements de plus en plus faibles (l'inertie) : on les ignore. Un nouveau
    // geste se reconnaît à une pause, ou à une amplitude qui repart à la hausse.
    let lastT = 0;
    let lastAbs = 0;
    let lastDir = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // zoom au pincement : on laisse faire le navigateur
      e.preventDefault();
      const now = performance.now();
      const abs = Math.abs(e.deltaY);
      const dir = Math.sign(e.deltaY);
      const fresh =
        now - lastT > QUIET || abs > lastAbs * 1.5 + 4 || (dir !== 0 && dir !== lastDir);
      lastT = now;
      lastAbs = abs;
      if (dir) lastDir = dir;
      if (fresh && abs >= 4) step(dir > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    // Écrans tactiles : glisser le doigt vers le haut ou le bas.
    const observer = Observer.create({
      target: window,
      type: "touch",
      tolerance: 10,
      preventDefault: true,
      onUp: () => step(1),
      onDown: () => step(-1),
    });
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        step(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        step(-1);
      }
    };
    // Redimensionnement : la photo active reste centrée.
    const onResize = () => {
      const el = frames.current[activeRef.current];
      if (!el || sliding.current) return;
      const y = Math.max(0, el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2);
      window.scrollTo(0, y);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      observer.kill();
      window.removeEventListener("wheel", onWheel);
      gsap.killTweensOf(window);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [goTo]);

  const current = voyages[active];

  return (
    <div className="relative min-h-dvh" data-voyages-mode>
      {/* Liste des lieux (grands écrans) : le lieu de l'image active est allumé */}
      <nav
        aria-label="Lieux"
        className="fixed left-10 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
      >
        <ul className="flex flex-col gap-2">
          {voyages.map((v, i) => (
            <li key={v.image.src}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === active ? "true" : undefined}
                className={`cursor-pointer text-left transition-opacity duration-500 ease-[var(--ease-power2-out)] hover:opacity-100 ${
                  i === active ? "opacity-100" : "opacity-20"
                }`}
              >
                <span className="text-foreground">{v.place},</span>{" "}
                <span className="text-muted">{v.detail}</span>
                <span className="text-foreground">.</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Légende de l'image active (grands écrans) */}
      <p
        ref={caption}
        className="fixed left-[calc(83.33%-10px)] top-1/2 z-10 hidden w-[220px] -translate-y-1/2 text-pretty lg:block"
      >
        <span className="text-foreground">{current.caption[0]}</span>
        <br />
        <span className="text-muted">{current.caption[1]}</span>
      </p>

      {/* Invitation à scroller, disparaît au premier défilement */}
      <p
        className={`font-hand fixed bottom-10 right-10 z-10 hidden text-foreground transition-opacity duration-500 lg:block ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      >
        Tu peux scroll ;)
      </p>

      {/* Photos : centrées, l'active en pleine taille, les autres réduites */}
      {/* Haut : une marge fixe sous l'en-tête, la première image ne peut pas monter plus haut.
          Bas : une demi-hauteur d'écran, pour que la dernière image puisse arriver au centre. */}
      <main className="flex flex-col items-center px-4 pb-[50dvh] pt-[max(15dvh,88px)]">
        {voyages.map((v, i) => (
          <div
            key={v.image.src}
            ref={(el) => {
              frames.current[i] = el;
            }}
            className="w-full origin-center"
            style={{
              // 808px de large comme dans la maquette, mais jamais plus de 70 % de la hauteur
              // d'écran : les photos du dessus et du dessous restent toujours visibles.
              maxWidth: `min(${ACTIVE_WIDTH}px, calc(70dvh * ${FRAME_RATIO}))`,
              // Rapproche les images pour compenser l'espace laissé par la réduction (~56px entre deux).
              marginBlock: "-1.5dvh",
              // État de départ rendu côté serveur (évite un flash avant GSAP) ; ensuite GSAP gère l'échelle.
              transform: i === initialIndex ? undefined : `scale(${INACTIVE_SCALE})`,
            }}
          >
            {/* Cadre 808 × 730 de la maquette, la photo recadrée dedans (la galerie la montre en entier).
                Même bordure 0.5px que les vignettes projets, et une ombre douce à peine visible. */}
            <div
              className="relative w-full overflow-hidden rounded-[4px] shadow-[0_0_0_0.5px_rgba(110,111,111,0.25),0_1px_2px_rgba(41,41,41,0.06),0_12px_32px_-12px_rgba(41,41,41,0.12)]"
              style={{ aspectRatio: FRAME_RATIO }}
            >
              <Image
                src={v.image.src}
                alt={v.image.alt}
                fill
                sizes={SCROLL_IMAGE_SIZES}
                priority={i === initialIndex}
                className="object-cover"
              />
            </div>
            {/* Lieu sous l'image (petits écrans, où la liste et la légende sont masquées) */}
            <p className="mt-2 lg:hidden">
              <span className="text-foreground">{v.place},</span>{" "}
              <span className="text-muted">{v.detail}.</span>
            </p>
          </div>
        ))}
      </main>
    </div>
  );
}
