"use client";

import type { ReactNode } from "react";
import { useHoverBar } from "./useHoverBar";

export type ProjectItem = {
  title: string;
  description: string;
  /** Monogramme affiché dans la vignette (ex. « SFC ») quand il n'y a pas de pictogramme. */
  mark: string;
  /** Pictogramme monochrome (prioritaire sur le monogramme). */
  icon?: ReactNode;
  href?: string;
};

/*
 * Liste de projets : vignette neutre + titre + mini description.
 * Au survol, une seule barre grise par liste glisse d'un projet à l'autre (voir useHoverBar).
 *
 * Radius concentriques : barre 16px = vignette 6px + marge 10px.
 */
const PAD = 10;

/**
 * variant « client » : vignette blanche pleine (projet livré, réel).
 * variant « exploration » : vignette en pointillés bleus, comme les lignes guides (recherche, brouillon).
 */
export default function ProjectList({
  items,
  variant = "client",
}: {
  items: ProjectItem[];
  variant?: "client" | "exploration";
}) {
  const { bar, moveTo, listProps } = useHoverBar<HTMLLIElement>();

  return (
    // Marges négatives : les vignettes restent alignées sur la colonne de texte, la barre déborde autour.
    // À droite, la colonne n'a que 12px de marge (18px à gauche) : la barre déborde de 4px seulement,
    // pour garder le même écart de 8px avec les lignes guides des deux côtés.
    <ul className="relative isolate -mx-[10px] flex flex-col md:-mr-1" {...listProps}>
      <li ref={bar} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 rounded-[16px] bg-surface opacity-0" />
      {items.map((p) => (
        <li key={p.title}>
          <a
            href={p.href ?? "#"}
            onPointerEnter={(e) => moveTo(e.currentTarget)}
            onFocus={(e) => moveTo(e.currentTarget)}
            className="flex items-center gap-4 rounded-[16px] outline-none"
            style={{ padding: PAD }}
          >
            {/* Vignette neutre : pictogramme ou monogramme du projet, en gris. */}
            <span
              aria-hidden
              className={`relative grid size-12 shrink-0 place-items-center rounded-[6px] font-medium tracking-[-0.04em] text-muted ${
                variant === "client"
                  ? "bg-white shadow-[0_0_0_0.5px_rgba(110,111,111,0.25),0_1px_2px_rgba(41,41,41,0.06)]"
                  : ""
              }`}
            >
              {variant === "exploration" && (
                // Contour pointillé en SVG (un border dashed CSS ne permet pas de régler les tirets).
                <svg className="absolute inset-0" width={48} height={48} viewBox="0 0 48 48" aria-hidden>
                  <rect
                    x="0.5"
                    y="0.5"
                    width="47"
                    height="47"
                    rx="5.5"
                    fill="none"
                    stroke="var(--accent)"
                    strokeDasharray="4 3"
                  />
                </svg>
              )}
              {p.icon ?? p.mark}
            </span>
            <span className="flex flex-col gap-[2px]">
              <span className="text-foreground">{p.title}</span>
              <span className="text-muted">{p.description}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
