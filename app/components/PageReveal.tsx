"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { onReveal } from "./reveal";

/** Écart entre deux éléments du contenu : une cascade légère, pas un effet appuyé. */
const STAGGER = 0.06;

/**
 * Entrée du contenu, en une timeline :
 *
 * 1. Contenu de la colonne : chaque bloc (logo, ligne de profil, paragraphe, titre,
 *    grille d'images, liste, bouton…) apparaît dans l'ordre de lecture, avec un léger
 *    décalage. Même animation pour tous : légère montée depuis le bas.
 *    - Opacité : courte et douce (power1.out, 0.6s), le contenu est lisible tout de suite.
 *    - Déplacement : subtil (16px) mais long et marqué (expo.out, 1.2s), il continue de se poser.
 *
 * 2. Éléments en Caveat [data-reveal-hand] (annotations, « Studio. » du logo) : un peu
 *    après, la même montée en plus doux (power3.out), l'une après l'autre.
 *
 * Les blocs sont les enfants directs des éléments [data-reveal] (header, sections).
 * Tout est caché en CSS avant l'hydratation (voir globals.css).
 */
export default function PageReveal() {
  useLayoutEffect(() => {
    const groups = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const items = groups.flatMap((g) => Array.from(g.children) as HTMLElement[]);
    const hand = gsap.utils.toArray<HTMLElement>("[data-reveal-hand]");
    if (!items.length && !hand.length) return;

    const mm = gsap.matchMedia();
    let unsubscribe = () => {};

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Les conteneurs deviennent visibles, ce sont leurs enfants qui s'animent.
      gsap.set(groups, { opacity: 1 });
      // transition: none pendant l'entrée : une transition CSS (ex. survol du bouton)
      // ferait un flash et lisserait les valeurs de GSAP. Rétablie à la fin.
      gsap.set(items, { opacity: 0, y: 16, transition: "none" });
      gsap.set(hand, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => gsap.set(items, { clearProps: "transition" }),
      });
      tl.to(items, { opacity: 1, duration: 0.6, ease: "power1.out", stagger: STAGGER }, 0)
        .to(items, { y: 0, duration: 1.2, ease: "expo.out", stagger: STAGGER }, 0)
        // Caveat : 0.5s après le début, l'une après l'autre.
        .to(hand, { opacity: 1, duration: 0.4, ease: "power1.out", stagger: 0.12 }, 0.5)
        .to(hand, { y: 0, duration: 1, ease: "power3.out", stagger: 0.12 }, 0.5);

      unsubscribe = onReveal(() => tl.play());
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([...groups, ...hand], { opacity: 1 });
    });

    return () => {
      unsubscribe();
      mm.revert();
    };
  }, []);

  return null;
}
