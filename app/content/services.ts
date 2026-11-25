/*
 * Services proposés, et le détail affiché dans le panneau qui s'ouvre au clic.
 * Premier jet de textes : à relire et ajuster.
 */

export type Service = {
  /** Pictogramme de la vignette (voir components/icons.tsx). */
  icon: "pen" | "code" | "ease";
  title: string;
  /** Résumé affiché dans la liste. */
  text: string;
  /** Détail affiché dans le panneau. */
  intro: string;
  forWho: string;
  deliverables: string[];
  steps: { title: string; text: string }[];
};

export const services: Service[] = [
  {
    icon: "pen",
    title: "Design & direction artistique",
    text: "Définir ton univers, concevoir ton interface.",
    intro:
      "On commence par comprendre qui tu es et à qui tu t’adresses. À partir de là, je définis une direction visuelle (typographies, couleurs, images, ton) puis je conçois les pages de ton site, écran par écran, dans Figma.",
    forWho:
      "Pour toi si tu lances ton activité, si ton image ne te ressemble plus, ou si tu as déjà un développeur et qu’il te manque un design solide.",
    deliverables: [
      "Une direction artistique claire, avec ses règles",
      "Les maquettes de ton site, sur ordinateur et mobile",
      "Les principaux états et interactions, pensés dès le design",
      "Des fichiers organisés, prêts à être développés",
    ],
    steps: [
      { title: "Échange", text: "On parle de ton projet, de tes envies et de tes contraintes." },
      { title: "Direction", text: "Je te propose une direction visuelle, on l’ajuste ensemble." },
      { title: "Maquettes", text: "Je conçois les pages, tu commentes, j’affine." },
      { title: "Livraison", text: "Tu reçois des maquettes finalisées, prêtes pour le développement." },
    ],
  },
  {
    icon: "code",
    title: "Développement web",
    text: "Donner vie à ta landing page ou ta boutique.",
    intro:
      "Je transforme les maquettes (les miennes ou celles de ton designer) en un site rapide, soigné et facile à faire évoluer. Chaque détail du design est respecté, jusqu’aux espacements et aux états au survol.",
    forWho:
      "Pour toi si tu as un design prêt à être mis en ligne, ou si tu veux une landing page ou une boutique fiable, rapide et agréable à parcourir.",
    deliverables: [
      "Un site responsive, fidèle au design au pixel près",
      "De bonnes performances et un référencement de base soigné",
      "Une mise en ligne sur ton nom de domaine",
      "Un site que tu peux faire évoluer facilement",
    ],
    steps: [
      { title: "Cadrage", text: "On fait le point sur les pages, les fonctionnalités et les délais." },
      { title: "Développement", text: "Je construis le site et je te le partage au fur et à mesure." },
      { title: "Recette", text: "Tu testes, on corrige les derniers détails ensemble." },
      { title: "Mise en ligne", text: "Le site est publié, et je reste disponible après le lancement." },
    ],
  },
  {
    icon: "ease",
    title: "Animations & interactions",
    text: "Apporter du mouvement, soigner chaque interaction.",
    intro:
      "Le mouvement donne du caractère à un site et le rend plus agréable à parcourir. J’ajoute des animations qui servent ton contenu : des entrées de page, des transitions, des effets au survol, toujours fluides et jamais gratuits.",
    forWho:
      "Pour toi si ton site existe déjà mais manque de vie, ou si tu veux une expérience qui marque et donne envie d’explorer.",
    deliverables: [
      "Des animations pensées pour ton contenu et ton image",
      "Des micro-interactions soignées (survols, clics, transitions)",
      "Des mouvements fluides, y compris sur mobile",
      "Le respect des préférences d’accessibilité (mouvements réduits)",
    ],
    steps: [
      { title: "Repérage", text: "On identifie les moments où le mouvement apporte vraiment quelque chose." },
      { title: "Prototype", text: "Je te montre les premières animations pour valider le ressenti." },
      { title: "Intégration", text: "Je les intègre dans ton site et j’ajuste chaque détail." },
      { title: "Finitions", text: "On peaufine les timings jusqu’à ce que tout soit naturel." },
    ],
  },
];
