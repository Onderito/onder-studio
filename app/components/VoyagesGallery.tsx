"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import gsap from "gsap";
import { GALLERY_SIZE, voyages } from "../content/voyages";

/** Échelle de la toile par rapport à la maquette (les textes, eux, gardent leur taille). */
const SCALE = 0.7;
/** Surface maximale d'une photo (en px² de maquette) : les plus grandes sont réduites,
 *  autour de leur centre, pour que la toile reste équilibrée. */
const MAX_AREA = 200_000;
/** Marge autour de la toile : on peut la faire glisser un peu au-delà des photos. */
const MARGIN = 96;
/** Lissage du déplacement (0 → 1) : plus c'est bas, plus la toile glisse longtemps. */
const SMOOTH = 0.1;
/** Élan au relâchement d'un glissé : la vitesse du geste prolonge le mouvement. */
const THROW = 14;
/** Entrée : la toile part zoomée et les photos resserrées vers le centre, puis tout se place. */
const ENTER = { zoom: 1.8, gather: 0.45, duration: 1.6, ease: "expo.out" };

/** Place de chaque photo sur la toile, à l'échelle, les plus grandes réduites. */
const layout = voyages.map((v) => {
  const { width: w, height: h } = v.image;
  const k = Math.min(1, Math.sqrt(MAX_AREA / (w * h)));
  const cx = v.gallery.x + w / 2;
  const cy = v.gallery.y + h / 2;
  return {
    x: (cx - (w * k) / 2) * SCALE,
    y: (cy - (h * k) / 2) * SCALE,
    w: Math.round(w * k * SCALE),
    h: Math.round(h * k * SCALE),
  };
});
const WIDTH = GALLERY_SIZE.width * SCALE;
const HEIGHT = GALLERY_SIZE.height * SCALE;

export type GalleryApi = {
  /** La photo la plus proche du centre de l'écran : son index et sa position à l'écran. */
  focus(): { index: number; rect: DOMRect; src: string } | null;
};

/**
 * Mode galerie : toutes les photos posées sur une grande toile qu'on explore librement,
 * en la faisant glisser (souris, doigt) ou au trackpad / à la molette. Le déplacement est
 * lissé : la toile suit le geste avec un léger retard et s'arrête en douceur.
 * Au survol, le lieu de la photo apparaît au-dessus.
 */
export default function VoyagesGallery({
  focusIndex,
  apiRef,
}: {
  /** Photo sur laquelle centrer la toile à l'arrivée (celle qu'on regardait en défilement). */
  focusIndex: number;
  apiRef: RefObject<GalleryApi | null>;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [dragging, setDragging] = useState(false);
  const [explored, setExplored] = useState(false);

  useEffect(() => {
    const view = viewport.current;
    const el = canvas.current;
    if (!view || !el) return;

    // Bornes de la toile, calculées sur les photos (certaines débordent du cadre Figma).
    const minX = Math.min(...layout.map((p) => p.x)) - MARGIN;
    const minY = Math.min(...layout.map((p) => p.y)) - MARGIN - 50; // place pour la légende
    const maxX = Math.max(...layout.map((p) => p.x + p.w)) + MARGIN;
    const maxY = Math.max(...layout.map((p) => p.y + p.h)) + MARGIN;
    const clamp = (v: number, size: number, lo: number, hi: number) => {
      const min = size - hi;
      const max = -lo;
      return min > max ? (min + max) / 2 : gsap.utils.clamp(min, max, v);
    };

    // Position visée (mise à jour par les gestes) et position affichée (qui la rattrape).
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const fit = () => {
      target.x = clamp(target.x, window.innerWidth, minX, maxX);
      target.y = clamp(target.y, window.innerHeight, minY, maxY);
    };
    // Départ : la toile centrée sur la photo qu'on regardait.
    const start = layout[focusIndex] ?? layout[0];
    target.x = window.innerWidth / 2 - (start.x + start.w / 2);
    target.y = window.innerHeight / 2 - (start.y + start.h / 2);
    fit();
    pos.x = target.x;
    pos.y = target.y;

    const setX = gsap.quickSetter(el, "x", "px");
    const setY = gsap.quickSetter(el, "y", "px");
    setX(pos.x);
    setY(pos.y);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      const k = reduce ? 1 : 1 - Math.pow(1 - SMOOTH, gsap.ticker.deltaRatio());
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      setX(pos.x);
      setY(pos.y);
    };
    gsap.ticker.add(tick);

    // Glisser (souris, doigt, stylet).
    let drag: { x: number; y: number; tx: number; ty: number } | null = null;
    let vel = { x: 0, y: 0 };
    let last = { x: 0, y: 0, t: 0 };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, tx: target.x, ty: target.y };
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      vel = { x: 0, y: 0 };
      view.setPointerCapture(e.pointerId);
      setDragging(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      const dt = Math.max(1, now - last.t);
      // Vitesse lissée du geste, en px par image (~16 ms).
      vel.x = vel.x * 0.6 + ((e.clientX - last.x) / dt) * 16 * 0.4;
      vel.y = vel.y * 0.6 + ((e.clientY - last.y) / dt) * 16 * 0.4;
      last = { x: e.clientX, y: e.clientY, t: now };
      target.x = drag.tx + e.clientX - drag.x;
      target.y = drag.ty + e.clientY - drag.y;
      fit();
      setExplored(true);
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      // Élan : la toile continue dans le sens du geste, puis ralentit (via le lissage).
      if (performance.now() - last.t < 80) {
        target.x += vel.x * THROW;
        target.y += vel.y * THROW;
        fit();
      }
      setDragging(false);
    };
    // Trackpad (deux doigts) et molette : déplacement direct, lissé par le ticker.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target.x -= e.deltaX;
      target.y -= e.deltaY;
      fit();
      setExplored(true);
    };
    const onResize = () => fit();

    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);
    view.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    // La photo la plus proche du centre de l'écran (pour revenir au défilement sur elle).
    apiRef.current = {
      focus() {
        const mx = window.innerWidth / 2;
        const my = window.innerHeight / 2;
        let best: { index: number; rect: DOMRect; src: string } | null = null;
        let bestDist = Infinity;
        images.current.forEach((img, index) => {
          if (!img) return;
          const rect = img.getBoundingClientRect();
          const d = Math.hypot(rect.left + rect.width / 2 - mx, rect.top + rect.height / 2 - my);
          if (d < bestDist) {
            bestDist = d;
            best = { index, rect, src: img.currentSrc };
          }
        });
        return best;
      },
    };

    // Entrée : la toile part zoomée sur le centre de l'écran, les photos resserrées vers lui,
    // puis tout se dézoome et chaque photo glisse à sa place.
    const photos = gsap.utils.toArray<HTMLElement>("[data-gallery-photo]", el);
    if (!reduce) {
      const ox = window.innerWidth / 2 - pos.x;
      const oy = window.innerHeight / 2 - pos.y;
      gsap.set(el, { transformOrigin: `${ox}px ${oy}px` });
      gsap.fromTo(el, { scale: ENTER.zoom }, { scale: 1, duration: ENTER.duration, ease: ENTER.ease });
      photos.forEach((ph, i) => {
        const p = layout[i];
        gsap.fromTo(
          ph,
          {
            x: (ox - (p.x + p.w / 2)) * ENTER.gather,
            y: (oy - (p.y + p.h / 2)) * ENTER.gather,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: ENTER.duration,
            ease: ENTER.ease,
            // Les photos proches du centre se placent en premier.
            delay: Math.min(0.25, Math.hypot(ox - p.x, oy - p.y) / 6000),
          },
        );
      });
    }

    return () => {
      apiRef.current = null;
      gsap.ticker.remove(tick);
      gsap.killTweensOf([el, ...photos]);
      view.removeEventListener("pointerdown", onDown);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerup", onUp);
      view.removeEventListener("pointercancel", onUp);
      view.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
    };
    // focusIndex ne sert qu'au placement de départ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={viewport}
      data-voyages-mode
      className={`fixed inset-0 touch-none select-none overflow-hidden ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div
        ref={canvas}
        className="relative will-change-transform"
        style={{ width: WIDTH, height: HEIGHT }}
      >
        {voyages.map((v, i) => {
          const p = layout[i];
          return (
            <figure
              key={v.image.src}
              data-gallery-photo
              className="group absolute m-0"
              style={{ left: p.x, top: p.y, width: p.w }}
            >
              {/* Légende au survol, posée au-dessus de la photo (comme « Vietnam, 2026 » dans la maquette) */}
              <figcaption className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 translate-y-1 opacity-0 transition-[opacity,translate] duration-300 ease-[var(--ease-power2-out)] group-hover:translate-y-0 group-hover:opacity-100">
                <span className="block text-foreground">
                  {v.place}, {v.year}
                </span>
                <span className="block text-muted first-letter:uppercase">{v.detail}</span>
              </figcaption>
              <Image
                ref={(img) => {
                  images.current[i] = img;
                }}
                src={v.image.src}
                alt={v.image.alt}
                width={v.image.width * 2}
                height={v.image.height * 2}
                sizes={`${p.w}px`}
                priority={i < 6}
                draggable={false}
                // Même bordure 0.5px et même ombre que le mode défilement.
                className="block h-auto w-full rounded-[4px] shadow-[0_0_0_0.5px_rgba(110,111,111,0.25),0_1px_2px_rgba(41,41,41,0.06),0_12px_32px_-12px_rgba(41,41,41,0.12)]"
              />
            </figure>
          );
        })}
      </div>

      {/* Invitation à explorer, disparaît au premier geste */}
      <p
        className={`font-hand pointer-events-none fixed bottom-10 right-10 z-10 hidden text-foreground transition-opacity duration-500 lg:block ${
          explored ? "opacity-0" : "opacity-100"
        }`}
      >
        Glisse pour explorer ;)
      </p>
    </div>
  );
}
