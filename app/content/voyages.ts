/*
 * Section « Je prends place » : mes voyages en photos.
 * Une seule liste, commune aux deux modes : l'ordre de la liste est l'index de la photo
 * (ordre du défilement), et `gallery` donne sa place sur la toile du mode galerie.
 * Contenu de test : lieux et légendes à compléter.
 */

/** Bande-son : un seul morceau qui tourne pendant toute la visite. */
export const soundtrack = "/audio/voyages/father-ocean.m4a";

export type Voyage = {
  /** Lieu, en noir (ex. « Mexique »). */
  place: string;
  year: number;
  /** Précision, en gris (ex. « dans l’avion »). */
  detail: string;
  /** Légende affichée à droite en mode défilement. */
  caption: [string, string];
  /** Photo recadrée au format de la maquette : width/height donnent ses proportions. */
  image: { src: string; width: number; height: number; alt: string };
  /** Place sur la toile du mode galerie (maquette Figma « MacBook Pro 16" - 3 »), en px. */
  gallery: { x: number; y: number };
  /** Musique propre à la photo, jouée au clic en galerie (à venir). */
  track?: string;
};

/** Taille de la toile du mode galerie dans la maquette. */
export const GALLERY_SIZE = { width: 3023, height: 2182 };

const LOREM: [string, string] = [
  "lorem ipsum dolor amet lorem",
  "ipsum dolor amet lorem ipsum dolor",
];

const photo = (name: string, width: number, height: number, alt: string) => ({
  src: `/images/voyages/galerie/${name}.webp`,
  width,
  height,
  alt,
});

export const voyages: Voyage[] = [
  {
    place: "Mexique", year: 2025, detail: "dans l’avion", caption: LOREM,
    image: photo("img-5027", 442, 590, "Vue d’avion sur la côte mexicaine"),
    gallery: { x: 1800, y: 836 },
  },
  {
    place: "Thaïlande", year: 2026, detail: "Koh Tao", caption: LOREM,
    image: photo("img-6718", 373, 497, "Colline et plage à Koh Tao, en Thaïlande"),
    gallery: { x: 40, y: 111 },
  },
  {
    place: "Mexique", year: 2025, detail: "Holbox", caption: LOREM,
    image: photo("img-6976", 595, 644, "Piscine sous les palmiers à Holbox, au Mexique"),
    gallery: { x: 186, y: 1538 },
  },
  {
    place: "Vietnam", year: 2026, detail: "voyage seul", caption: LOREM,
    image: photo("img-6998", 413, 535, "Coucher de soleil sur une plage au Vietnam"),
    gallery: { x: 781, y: 656 },
  },
  {
    place: "Lieu", year: 2026, detail: "à compléter", caption: LOREM,
    image: photo("img-6841", 411, 547, "Vue de nuit sur des pins et la ville"),
    gallery: { x: 901, y: -46 },
  },
  {
    place: "Lieu", year: 2025, detail: "à compléter", caption: LOREM,
    image: photo("img-7744", 449, 577, "Allée bordée d’arbres"),
    gallery: { x: 1768, y: 51 },
  },
  {
    place: "Lieu", year: 2025, detail: "à compléter", caption: LOREM,
    image: photo("img-5360", 418, 557, "Rue embouteillée entre les arbres"),
    gallery: { x: 2565, y: 81 },
  },
  {
    place: "Lieu", year: 2026, detail: "à compléter", caption: LOREM,
    image: photo("img-7604", 403, 473, "Cube lumineux bleu de nuit"),
    gallery: { x: 111, y: 857 },
  },
  {
    place: "Lieu", year: 2026, detail: "à compléter", caption: LOREM,
    image: photo("img-6216", 473, 355, "Photo de groupe entre amis"),
    gallery: { x: 1275, y: 896 },
  },
  {
    place: "Lieu", year: 2025, detail: "à compléter", caption: LOREM,
    image: photo("img-6407", 507, 637, "Devant une mosquée blanche de nuit"),
    gallery: { x: 2476, y: 789 },
  },
  {
    place: "Lieu", year: 2025, detail: "à compléter", caption: LOREM,
    image: photo("dsc-9747", 385, 411, "Portrait avec un chapeau conique"),
    gallery: { x: 914, y: 1368 },
  },
  {
    place: "Lieu", year: 2026, detail: "à compléter", caption: LOREM,
    image: photo("img-7255", 430, 573, "Coucher de soleil rose sur la mer"),
    gallery: { x: 1512, y: 1538 },
  },
  {
    place: "Mexique", year: 2025, detail: "Holbox, fresque", caption: LOREM,
    image: photo("img-5265", 380, 388, "Devant une fresque à Holbox"),
    gallery: { x: 2015, y: 1779 },
  },
  {
    place: "New York", year: 2025, detail: "Times Square", caption: LOREM,
    image: photo("img-5f36", 453, 603, "Times Square de nuit"),
    gallery: { x: 2570, y: 1615 },
  },
];
