"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { services, type Service } from "../content/services";
import { CodeIcon, EaseIcon, PenIcon } from "./icons";
import { useHoverBar } from "./useHoverBar";

const ICONS = { pen: PenIcon, code: CodeIcon, ease: EaseIcon };

const BOOKING = "https://cal.com/ulas-onder-q7mhmp/15min";

/**
 * Liste des services : même barre de survol que les projets.
 * Au clic, un panneau s'ouvre avec le détail du service (depuis la droite sur ordinateur,
 * depuis le bas sur mobile).
 */
export default function ServiceList() {
  const { bar, moveTo, listProps } = useHoverBar<HTMLLIElement>();
  const dialog = useRef<HTMLDialogElement>(null);
  // Le dernier service ouvert reste affiché pendant l'animation de fermeture.
  const [active, setActive] = useState<Service | null>(null);
  const closing = useRef(false);

  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const open = (service: Service) => {
    const d = dialog.current;
    if (!d) return;
    setActive(service);
    // Le contenu est rendu au prochain rendu React : on anime juste après.
    requestAnimationFrame(() => {
      d.showModal();
      d.querySelector<HTMLElement>("[data-sheet-scroll]")?.scrollTo(0, 0);
      document.documentElement.style.overflow = "hidden";
      if (reduce()) return;

      const panel = d.querySelector("[data-sheet-panel]");
      const items = d.querySelectorAll("[data-sheet-item]");
      const from = isDesktop() ? { xPercent: 100 } : { yPercent: 100 };
      // transition: none pendant l'entrée : la transition CSS du bouton ferait un flash.
      gsap.set(items, { transition: "none" });
      gsap
        .timeline({ onComplete: () => gsap.set(items, { clearProps: "transition" }) })
        .fromTo(d.querySelector("[data-sheet-overlay]"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0)
        .fromTo(panel, from, { xPercent: 0, yPercent: 0, duration: 0.8, ease: "expo.out" }, 0)
        // Contenu : même entrée que la page (légère montée), dans l'ordre de lecture.
        .fromTo(items, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.05 }, 0.15)
        .fromTo(items, { y: 16 }, { y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05 }, 0.15);
    });
  };

  const close = () => {
    const d = dialog.current;
    if (!d || !d.open || closing.current) return;
    const done = () => d.close(); // la remise à zéro se fait dans onClose
    if (reduce()) return done();

    closing.current = true;
    const to = isDesktop() ? { xPercent: 100 } : { yPercent: 100 };
    gsap
      .timeline({ onComplete: done })
      .to(d.querySelector("[data-sheet-panel]"), { ...to, duration: 0.45, ease: "power3.in" }, 0)
      .to(d.querySelector("[data-sheet-overlay]"), { opacity: 0, duration: 0.3, ease: "power1.out" }, 0.15);
  };

  return (
    <>
      <ul className="relative isolate -mx-[10px] flex flex-col md:-mr-1" {...listProps}>
        <li ref={bar} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 rounded-[16px] bg-surface opacity-0" />
        {services.map((s) => (
          <li key={s.title}>
            {/* Même structure que les projets : vignette + titre + résumé (même hauteur, même barre). */}
            <button
              type="button"
              onClick={() => open(s)}
              onPointerEnter={(e) => moveTo(e.currentTarget)}
              onFocus={(e) => moveTo(e.currentTarget)}
              aria-haspopup="dialog"
              className="flex w-full cursor-pointer items-center gap-4 rounded-[16px] p-[10px] text-left outline-none"
            >
              <ServiceIcon icon={s.icon} />
              <span className="flex flex-col gap-[2px]">
                <span className="text-foreground">{s.title}</span>
                <span className="text-muted">{s.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={active?.title}
        // Échap : on remplace la fermeture immédiate par la fermeture animée.
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        // Toute fermeture (animée, ou immédiate quand le navigateur refuse d'attendre l'animation) :
        // on débloque le scroll et on remet le panneau à zéro pour la prochaine ouverture.
        onClose={(e) => {
          const d = e.currentTarget;
          closing.current = false;
          document.documentElement.style.overflow = "";
          const parts = d.querySelectorAll("[data-sheet-panel], [data-sheet-overlay], [data-sheet-item]");
          gsap.killTweensOf(parts);
          gsap.set(parts, { clearProps: "all" });
        }}
        className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
      >
        {/* Voile clair (couleur du fond à 85 %) : la page s'efface au second plan, l'attention reste sur le panneau. */}
        <div data-sheet-overlay className="absolute inset-0 bg-background/85" onClick={close} />

        <div
          data-sheet-panel
          className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[16px] border-t-[0.5px] border-muted/15 bg-background shadow-[0_-8px_32px_rgba(41,41,41,0.08)] md:border-t-0 md:border-l-[0.5px] md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[min(560px,100%)] md:rounded-none md:shadow-[-8px_0_32px_rgba(41,41,41,0.08)]"
        >
          <div className="flex justify-end px-6 pt-5 md:px-10 md:pt-8">
            <button
              type="button"
              onClick={close}
              className="cursor-pointer text-muted transition-colors duration-300 ease-[var(--ease-power2-out)] hover:text-foreground"
            >
              Fermer
            </button>
          </div>

          {active && (
            <div data-sheet-scroll className="overflow-y-auto overscroll-contain px-6 pb-10 pt-4 md:px-10 md:pt-6">
              <h2 data-sheet-item className="font-medium text-foreground">
                {active.title}
              </h2>
              <p data-sheet-item className="mt-4 text-muted">
                {active.intro}
              </p>

              <h3 data-sheet-item className="mt-10 font-medium text-foreground">
                Pour qui
              </h3>
              <p data-sheet-item className="mt-2 text-muted">
                {active.forWho}
              </p>

              <h3 data-sheet-item className="mt-10 font-medium text-foreground">
                Ce que tu reçois
              </h3>
              <ul data-sheet-item className="mt-3 flex flex-col gap-2">
                {active.deliverables.map((d) => (
                  <li key={d} className="flex items-baseline gap-3 text-muted">
                    {/* Puce : le petit carré bleu, signature du site. */}
                    <span aria-hidden className="size-[5px] shrink-0 -translate-y-[3px] bg-accent" />
                    {d}
                  </li>
                ))}
              </ul>

              <h3 data-sheet-item className="mt-10 font-medium text-foreground">
                Comment ça se passe
              </h3>
              <ol data-sheet-item className="mt-3 flex flex-col gap-4">
                {active.steps.map((step) => (
                  <li key={step.title} className="flex items-baseline gap-3">
                    {/* Même puce que « Ce que tu reçois » : le petit carré bleu. */}
                    <span aria-hidden className="size-[5px] shrink-0 -translate-y-[3px] bg-accent" />
                    <span className="flex flex-col gap-[2px]">
                      <span className="text-foreground">{step.title}</span>
                      <span className="text-muted">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <a
                data-sheet-item
                href={BOOKING}
                target="_blank"
                rel="noreferrer"
                className="mt-10 inline-flex h-[42px] items-center justify-center rounded-[4px] bg-accent px-4 font-medium text-white transition-opacity duration-300 ease-[var(--ease-power2-out)] hover:opacity-85"
              >
                On en parle ↗
              </a>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

/** Vignette blanche avec le pictogramme du service, identique à celle des projets clients. */
function ServiceIcon({ icon }: { icon: Service["icon"] }) {
  const Icon = ICONS[icon];
  return (
    <span
      aria-hidden
      className="grid size-12 shrink-0 place-items-center rounded-[6px] bg-white text-muted shadow-[0_0_0_0.5px_rgba(110,111,111,0.25),0_1px_2px_rgba(41,41,41,0.06)]"
    >
      <Icon />
    </span>
  );
}
