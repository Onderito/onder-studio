"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { STUDIO_STROKES } from "./studio-path";
import { triggerReveal } from "./reveal";

gsap.registerPlugin(DrawSVGPlugin);

/*
 * Toutes les cotes viennent de la maquette Figma (Loader, 1728 × 1117),
 * exprimées en em sur une base de 150px (taille de « Önder ») pour que
 * l'ensemble se réduise proportionnellement sur petit écran.
 */
const BASE = 150;
const em = (px: number) => `${px / BASE}em`;

const SEEN_KEY = "onder-loader-seen";

function hasSeenLoader() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markLoaderSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Stockage indisponible (navigation privée stricte) : le loader rejouera, sans gravité.
  }
}

/**
 * Script inline à placer dans <head> : s'exécute avant le premier affichage et
 * marque <html data-loader-seen> si le loader a déjà été vu dans la session,
 * pour éviter un flash du panneau bleu rendu côté serveur.
 */
export const LOADER_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}")==="1")document.documentElement.setAttribute("data-loader-seen","")}catch(e){}`;

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    // Une seule fois par session (onglet) : si déjà vu, LOADER_SEEN_SCRIPT a masqué
    // le loader en CSS avant le premier affichage, il n'y a rien à animer.
    if (hasSeenLoader()) {
      triggerReveal();
      return;
    }

    const html = document.documentElement;
    html.style.overflow = "hidden";
    // Le loader révèle toujours le haut de la page, même après un rechargement.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // Marqué vu à la fin (et non au début) : en dev, le Strict Mode lance l'effet deux fois.
    const finish = () => {
      triggerReveal(); // sécurité : déjà déclenché pendant la sortie en temps normal
      markLoaderSeen();
      html.style.overflow = "";
      setDone(true);
    };

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", el);
      const pens = gsap.utils.toArray<SVGPathElement>("[data-pen]", el);

      // Écriture : chaque geste à vitesse constante (durée proportionnelle à sa longueur),
      // avec une micro-pause quand le stylo se lève entre deux gestes.
      const write = gsap.timeline({ paused: true });
      pens.forEach((pen, i) => {
        const length = pen.getTotalLength();
        write
          .set(pen, { visibility: "visible", immediateRender: false }, i === 0 ? 0 : "+=0.03")
          .fromTo(pen, { drawSVG: "0%" }, { drawSVG: "100%", duration: Math.max(length, 6) / 100, ease: "none" });
      });

      const tl = gsap.timeline({ onComplete: finish });

      // 1. « Önder » sort de son masque lettre par lettre.
      //    - Opacité sur le mot entier (courte et douce) : elle ne crée pas de décalage parasite.
      //    - Déplacement par lettre (long et marqué), sur la seule hauteur du masque :
      //      une course courte garde des écarts réguliers entre les lettres avec expo.out.
      const onderMask = el.querySelector<HTMLElement>("[data-onder]");
      const travel = () => onderMask?.offsetHeight ?? 0;
      tl.fromTo(onderMask, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.2)
        .fromTo(letters, { y: travel, yPercent: 0 }, { y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05 }, 0.2)

        // 2. « Studio. » s'écrit au stylo (vitesse quasi régulière, comme une main).
        //    L'ensemble est piloté par un power1.inOut : le stylo démarre et finit en douceur.
        .to(write, { progress: 1, duration: 1.3, ease: "power1.inOut" }, 0.75)

        // On remet la page en haut avant la sortie (le navigateur restaure le scroll après coup).
        .call(() => window.scrollTo(0, 0), undefined, "+=0.6");

      // 3. Sortie : le fond bleu devient les deux lignes guides de la colonne.
      //    Les textes ne bougent pas, ils s'effacent sur place.
      const content = el.querySelector("[data-content]");
      const guides = Array.from(document.querySelectorAll<HTMLElement>("[data-guide]"));
      const column = document.querySelector("main")?.getBoundingClientRect();
      const guidesVisible = column && guides.some((g) => getComputedStyle(g).display !== "none");

      if (column && guidesVisible) {
        const vw = window.innerWidth;
        const mid = (column.left + column.right) / 2;
        // Le fond est découpé par un polygone : un rectangle extérieur (l → r) percé
        // d'un trou intérieur (hl → hr). En fin de course, il ne reste que deux bandes
        // de 1px pile sur les lignes pointillées de la page.
        const clip = { l: 0, r: vw, hl: mid, hr: mid };
        const applyClip = () => {
          el.style.clipPath =
            `polygon(evenodd, ${clip.l}px 0, ${clip.r}px 0, ${clip.r}px 100%, ${clip.l}px 100%, ${clip.l}px 0, ` +
            `${clip.hl}px 0, ${clip.hl}px 100%, ${clip.hr}px 100%, ${clip.hr}px 0, ${clip.hl}px 0)`;
        };

        tl
          // a. Le bleu se resserre sur la largeur de la colonne (808px).
          .to(clip, { l: column.left, r: column.right, duration: 0.8, ease: "power3.inOut", onUpdate: applyClip })
          // b. Les textes s'effacent sur place pendant la fin du resserrement…
          .to(content, { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.35")
          // …puis le bleu s'ouvre au centre (après le fondu, pour ne pas couper les textes).
          .to(clip, { hl: column.left + 1, hr: column.right - 1, duration: 0.9, ease: "power3.inOut", onUpdate: applyClip })
          // Le contenu de la page entre quand le bleu est déjà presque réduit à ses lignes
          // (0.6s sur 0.9s d'ouverture, soit environ 85 % du trajet en power3.inOut).
          .call(triggerReveal, undefined, "<0.6")
          // c. Les deux bandes pleines laissent place aux lignes pointillées de la page.
          .to(el, { opacity: 0, duration: 0.4, ease: "power1.out" });
      } else {
        // Mobile (pas de lignes guides) : simple fondu, textes immobiles.
        tl.to(el, { opacity: 0, duration: 0.5, ease: "power2.in" }).call(triggerReveal, undefined, "<0.3");
      }
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      finish();
    });

    return () => {
      mm.revert();
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      data-loader
      aria-hidden
      className="fixed inset-0 z-50 flex items-center justify-center bg-accent text-background"
    >
      <div
        data-content
        className="relative"
        style={{ fontSize: `min(${BASE}px, 22vw)`, width: em(509), height: em(203.4) }}
      >
        {/*
          « Önder » : Geist Bold, dans un masque overflow: hidden ajusté aux lettres.
          La ligne fait 225px (1.5em) mais les lettres n'en occupent que 137px
          (du haut du tréma à la ligne de base) : le masque fait 152px, 8px de marge
          au-dessus du tréma, et le texte est remonté de 23.6px à l'intérieur pour
          garder exactement la même position que dans la maquette.
        */}
        <div
          data-onder
          className="absolute left-0 overflow-hidden font-bold leading-normal whitespace-nowrap"
          // Caché avant l'hydratation ; GSAP gère ensuite l'opacité.
          style={{ top: em(31.2), height: em(152), letterSpacing: em(-6), opacity: 0 }}
          aria-label="Önder"
        >
          <div style={{ marginTop: em(-23.6) }}>
            {Array.from("Önder").map((letter, i) => (
              <span key={i} data-letter className="inline-block">
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* « Studio. » : Caveat Bold, révélé par le tracé au stylo */}
        <div className="absolute" style={{ left: em(278), top: em(1.5) }}>
          <div>
            <svg
              viewBox="0 0 160 92"
              width={160}
              height={92}
              style={{ width: em(160), height: em(92), display: "block", overflow: "visible" }}
            >
              <defs>
                <mask id="studio-pen" maskUnits="userSpaceOnUse" x="-10" y="-10" width="180" height="112">
                  {STUDIO_STROKES.map((d) => (
                    <path
                      key={d}
                      data-pen
                      d={d}
                      fill="none"
                      stroke="#fff"
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      visibility="hidden"
                    />
                  ))}
                </mask>
              </defs>
              <text
                x={0}
                y={69}
                mask="url(#studio-pen)"
                fill="currentColor"
                style={{
                  fontFamily: "var(--font-caveat)",
                  fontWeight: 700,
                  fontSize: 72,
                  letterSpacing: -2.88,
                }}
              >
                Studio.
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
