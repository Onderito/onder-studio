/*
 * Pictogrammes des vignettes projets : trait léger de 1.25px, 24 × 24, couleur du texte (currentColor).
 * Formes volontairement simples pour rester lisibles à petite taille, et toutes dans le même style.
 */

type IconProps = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Flacon de vernis (Maison des Muses). */
export function NailPolishIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      {/* Bouchon */}
      <rect x="10" y="2.75" width="4" height="7" rx="1" />
      {/* Col */}
      <path d="M9 9.75h6v2.25H9z" />
      {/* Flacon */}
      <rect x="6.25" y="12" width="11.5" height="9.25" rx="2.25" />
      {/* Reflet */}
      <path d="M9.25 15v3.25" />
    </svg>
  );
}

/** Voiture de profil (Kokolimo). */
export function CarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      {/* Carrosserie */}
      <path d="M5.2 16.25H3.75a.75.75 0 0 1-.75-.75v-2.1a1 1 0 0 1 .72-.96L6.1 11.7l1.95-3.05a1.5 1.5 0 0 1 1.26-.7h5.62a1.5 1.5 0 0 1 1.1.48l2.77 3.27 1.53.36a1 1 0 0 1 .77.97v2.47a.75.75 0 0 1-.75.75H18.8" />
      <path d="M8.8 16.25h6.4" />
      {/* Vitres */}
      <path d="M6.1 11.7h12.5M12.25 7.95v3.75" />
      {/* Roues */}
      <circle cx="7" cy="16.25" r="1.8" />
      <circle cx="17" cy="16.25" r="1.8" />
    </svg>
  );
}

/** Plume / crayon (Design & direction artistique). */
export function PenIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      {/* Corps du crayon, en diagonale */}
      <path d="M15.5 4.5l4 4L9 19l-4.75.75L5 15 15.5 4.5z" />
      {/* Bague */}
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

/** Chevrons de code (Développement web). */
export function CodeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" />
      <path d="M13.25 5.5l-2.5 13" />
    </svg>
  );
}

/** Courbe d'animation, une ease (Animations & interactions). */
export function EaseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      {/* Axes */}
      <path d="M4.5 4.5v15h15" />
      {/* Courbe expo.out : départ rapide, arrivée en douceur */}
      <path d="M4.5 19.5C7 9 10.5 6.5 19.5 6.25" />
      {/* Point de fin */}
      <circle cx="19.5" cy="6.25" r="1" />
    </svg>
  );
}
