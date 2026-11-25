"use client";

import { useRef, type FocusEvent } from "react";
import gsap from "gsap";

/**
 * Barre de survol partagée par les listes (projets, services) : un seul fond gris par liste
 * qui glisse d'une ligne à l'autre. En descendant la liste, on la voit descendre progressivement.
 *
 * Usage : la barre est un élément absolu (top: 0) dans la liste en position relative ;
 * `moveTo` reçoit la ligne survolée (son offsetParent doit être la liste).
 */
export function useHoverBar<T extends HTMLElement>() {
  const bar = useRef<T>(null);
  const visible = useRef(false);

  const moveTo = (row: HTMLElement) => {
    const el = bar.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { y: row.offsetTop, height: row.offsetHeight };

    if (!visible.current || reduce) {
      // Première ligne survolée : la barre apparaît sur place, sans glisser depuis l'ancienne position.
      gsap.set(el, target);
      gsap.to(el, { opacity: 1, duration: 0.2, ease: "power1.out", overwrite: "auto" });
    } else {
      // Ensuite : elle glisse vers la ligne survolée (rapide, posée en douceur).
      gsap.to(el, { ...target, opacity: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
    }
    visible.current = true;
  };

  const hide = () => {
    visible.current = false;
    if (bar.current) gsap.to(bar.current, { opacity: 0, duration: 0.25, ease: "power1.out", overwrite: "auto" });
  };

  /** À poser sur la liste : la barre disparaît quand la souris ou le focus clavier la quitte. */
  const listProps = {
    onPointerLeave: hide,
    onBlur: (e: FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) hide();
    },
  };

  return { bar, moveTo, hide, listProps };
}
