# Guide des eases (GSAP et CSS)

Aide-mémoire personnel pour choisir et briefer les eases dans mes projets. Objectif : arrêter de deviner, avoir 3 ou 4 réflexes solides, et pouvoir donner des consignes précises à l'IA.

---

## 1. Ce qu'est un ease

Un ease ne change ni la durée ni la distance d'une animation. Il change **comment la vitesse évolue** pendant le mouvement.

La courbe se lit ainsi :

- Axe horizontal : le temps (0 à 100 % de la durée)
- Axe vertical : la progression (0 à 1)
- Courbe raide = ça va vite à ce moment
- Courbe plate = ça ralentit

### Les trois directions

| Direction | Sensation | Courbe |
|---|---|---|
| `in` | Démarre doucement, finit vite | Plate au début, raide à la fin |
| `out` | Démarre vite, freine à l'arrivée | Raide au début, plate à la fin |
| `inOut` | Doux au départ et à l'arrivée | En S |

### Les familles

| Ease | Caractère | Usage typique |
|---|---|---|
| `none` | Vitesse constante, mécanique | Scroll scrub, barres de progression, rotations continues |
| `power1` | Très subtil | Fondus, opacité |
| `power2` | Le bon défaut UI | Hovers, micro-interactions, la plupart des cas |
| `power3` | Plus marqué | Entrées de contenu, transitions |
| `power4` | Très marqué, proche de expo | Grandes entrées |
| `sine` | Très doux, presque neutre | Boucles, flottements (`sine.inOut`) |
| `expo` | Départ ou arrivée très tranchés, effet premium | Reveals, entrées de section |
| `circ` | Comme expo mais plus arrondi | Alternative plus douce à expo |
| `back` | Dépasse la cible puis revient | Pops, badges, boutons ludiques |
| `elastic` | Rebondit comme un ressort | Effets ponctuels, très rare |
| `bounce` | Rebondit comme une balle | Effets ponctuels, très rare |

`power1` à `power4` sont la même famille avec une intensité croissante (quad, cubic, quart, quint). Si `power2.out` est trop timide, monter à `power3.out` plutôt que de changer de famille.

---

## 2. La règle du pouce

| Situation | Ease à prendre |
|---|---|
| Un élément **apparaît** ou entre à l'écran | `out` (`power2.out`, `power3.out`, `expo.out`) |
| Un élément **sort** | `in` (`power2.in`), plus court que l'entrée |
| Un élément **se déplace** d'un point à un autre | `inOut` (`power2.inOut`, `power3.inOut`) |
| Animation liée au **scroll** (`scrub`) | `none` |
| Hover, micro-interactions | `power2.out`, 0.2 à 0.4 s |
| Boucle ou flottement | `sine.inOut` avec `yoyo: true` |
| Effet ludique ponctuel | `back.out`, `elastic.out`, `bounce.out`, avec parcimonie |

Pourquoi `out` domine l'UI : l'oeil perçoit la réactivité dans les premières millisecondes. L'élément réagit tout de suite, puis se pose.

---

## 3. Mes eases de référence (à fixer par projet)

Choisir 3 ou 4 eases et s'y tenir sur tout un projet donne une cohérence de mouvement immédiate.

| Rôle | Ease | Durée |
|---|---|---|
| Micro-interaction (hover, focus, toggle) | `power2.out` | 0.2 à 0.4 s |
| Entrée de contenu (texte, cartes, images) | `expo.out` | 0.8 à 1.2 s |
| Transition de page ou déplacement | `power3.inOut` | 0.7 à 1 s |
| Scroll scrub | `none` | lié au scroll |
| Sortie | `power2.in` | 0.3 à 0.5 s |

À définir une fois en début de projet :

```js
gsap.defaults({ ease: "power2.out", duration: 0.8 });

const EASE = {
  micro: "power2.out",
  enter: "expo.out",
  move: "power3.inOut",
  exit: "power2.in",
  scroll: "none",
};
```

Sans réglage, GSAP utilise `power1.out` et `0.5 s`. C'est correct mais fade, d'où l'impression d'animations "sans caractère".

---

## 4. Les durées

- La durée compte autant que l'ease. Un `expo.out` à 0.4 s paraît sec, à 1.2 s il devient élégant. Quand une animation semble "off", changer la durée avant de changer l'ease.
- La durée dépend de la distance : environ 0.2 à 0.4 s pour un petit mouvement, 0.6 à 1 s pour un déplacement moyen, jamais plus de 1.2 à 1.5 s pour une grande entrée.
- Entrée et sortie ne sont pas symétriques : une sortie dure environ 60 à 70 % de l'entrée, et se fait en `in`. L'utilisateur a déjà vu l'élément, inutile de le faire attendre.

---

## 5. Séparer opacité et déplacement

Technique clé pour les textes et les cartes : deux tweens distincts sur les mêmes éléments.

- **Opacité** : courte (0.5 à 0.7 s), ease doux (`power1.out`). Le contenu devient lisible tout de suite.
- **Déplacement** : plus long (environ 1.2 s), ease marqué (`expo.out`). Le contenu continue de se poser doucement.

L'écart entre les deux durées crée la sensation "ça apparaît puis ça se pose". Avec un seul ease partout, tout s'arrête en même temps et le rendu est plus plat.

```js
gsap.set(".line", { opacity: 0, y: 40 });

gsap.to(".line", { opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.12 });
gsap.to(".line", { y: 0, duration: 1.2, ease: "expo.out", stagger: 0.12 });
```

### Variante premium : reveal avec masque

Chaque ligne est dans un conteneur `overflow: hidden`, on anime `yPercent` sans opacité.

```html
<span class="mask"><span class="line">Mon titre</span></span>
```

```css
.mask { display: block; overflow: hidden; }
```

```js
gsap.from(".line", {
  yPercent: 110,
  duration: 1.2,
  ease: "expo.out",
  stagger: 0.1,
});
```

### Ajuster le masque à la hauteur réelle des lettres (mon style préféré)

**Le piège :** par défaut, le masque `overflow: hidden` prend la hauteur de la **ligne**, pas celle des **lettres**. La ligne inclut l'interligne et la place réservée aux jambages (p, g, j), même s'il n'y en a pas dans le mot. Résultat : `yPercent: 110` fait parcourir aux lettres bien plus de pixels que leur propre hauteur.

Exemple réel, « Önder » en Geist Bold 150px :

| | Hauteur | Course avec `yPercent: 110` |
|---|---|---|
| Ligne (`line-height: normal`) | 225px | 248px |
| Lettres réelles (haut du tréma → ligne de base) | 137px | — |

**Conséquence sur un stagger en `expo.out` :** presque tout le mouvement se fait dans les premiers instants. Plus la course est longue, plus le petit décalage du stagger se transforme en gros écart de position. À mi-animation, le Ö était à 44px de sa place et le r encore à 175px, avec des écarts qui grandissaient d'une lettre à l'autre (18, 26, 37, 50px). Visuellement, les lettres ont l'air **désynchronisées**.

**La solution : un masque à la taille des lettres.**

1. Mesurer la hauteur réelle des lettres (dans la console, avec `measureText` sur un canvas) :
   ```js
   const ctx = document.createElement("canvas").getContext("2d");
   ctx.font = "700 150px Geist";
   const m = ctx.measureText("Önder");
   // m.actualBoundingBoxAscent  → haut des lettres au-dessus de la ligne de base (134px)
   // m.actualBoundingBoxDescent → bas des lettres sous la ligne de base (2px)
   // m.fontBoundingBoxAscent / Descent → hauteur réservée par la police (151 + 44px)
   ```
2. Donner au masque **la hauteur des lettres + une petite marge** (≈ 8px) pour ne pas couper les accents. Ici : 137 + 2 × 8 ≈ 152px.
3. Remonter le texte **à l'intérieur** du masque (`margin-top` négatif) pour qu'il garde exactement sa position. Vérifier avec `getBoundingClientRect()` avant/après : la position finale doit être identique.
4. Animer en `y` sur **la hauteur du masque**, pas en `yPercent` de la lettre (qui reprendrait la hauteur de ligne).
5. Mettre l'**opacité sur le mot entier**, et le **stagger uniquement sur le déplacement**. Un fondu décalé lettre par lettre brouille la cascade.

```html
<div class="mask" style="height: 152px; overflow: hidden">
  <div style="margin-top: -23.6px">
    <span class="letter">Ö</span><span class="letter">n</span>…
  </div>
</div>
```

```js
const mask = document.querySelector(".mask");

gsap.fromTo(mask, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" });
gsap.fromTo(
  ".letter",
  { y: () => mask.offsetHeight },
  { y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05 }
);
```

Résultat : la course passe de 248 à 152px, l'écart entre la première et la dernière lettre est divisé par deux, et la cascade devient régulière.

> Les lettres en `display: inline-block` perdent le crénage entre elles. Sur une très grande typo, vérifier que l'espacement reste bon.

**Piège GSAP associé :** ne pas cacher les lettres au départ avec un `transform: translateY(110%)` en CSS. GSAP le lit comme un `y` en pixels qui reste appliqué **en plus** de l'animation `yPercent`, et les lettres finissent cachées sous le masque. Cacher plutôt le conteneur avec `opacity: 0`, ou définir explicitement `y` dans le `fromTo`.

---

## 6. Mélanger deux eases

GSAP accepte une fonction comme `ease`. On peut donc faire une moyenne pondérée de deux courbes, par exemple entre `power1.out` et `expo.out` :

```js
const a = gsap.parseEase("power1.out");
const b = gsap.parseEase("expo.out");
const mix = (t) => a(t) * 0.5 + b(t) * 0.5;

gsap.to(".box", { x: 300, duration: 1, ease: mix });
```

Souvent, `power3.out` ou `power4.out` donnent déjà un résultat très proche et restent plus simples. Pour une courbe entièrement dessinée à la main, utiliser le plugin `CustomEase`.

---

## 7. Paramètres des eases

Certains eases acceptent des paramètres :

```js
ease: "back.out(1.7)"        // 1.7 = ampleur du dépassement (défaut)
ease: "elastic.out(1, 0.3)"  // amplitude, période
ease: "steps(8)"             // animation en paliers (sprites, effets rétro)
```

---

## 8. Cas particuliers

### Stagger avec son propre ease

```js
gsap.from(".card", {
  y: 40,
  opacity: 0,
  stagger: { each: 0.1, ease: "power2.in" },
});
```

La cascade accélère au lieu d'être régulière.

### Boucles et yoyo

```js
gsap.to(".float", { y: -12, duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true });
```

Avec un `out`, on obtient un à-coup à chaque inversion. `sine.inOut` garantit un mouvement continu.

### Scroll

```js
gsap.to(".hero-img", {
  y: -120,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 1,
  },
});
```

`ease: "none"` sur l'animation, et le lissage passe par `scrub: 1` (le chiffre est un retard en secondes). Un vrai ease en plus rend le scroll élastique.

### Hover interruptible

```js
card.addEventListener("mouseenter", () =>
  gsap.to(card, { y: -6, duration: 0.3, ease: "power2.out", overwrite: "auto" })
);
card.addEventListener("mouseleave", () =>
  gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" })
);
```

Utiliser `to` des deux côtés : si la souris sort avant la fin, l'animation repart de la position actuelle sans saccade. Un `fromTo` ou un `set` provoquerait un saut.

---

## 9. Accessibilité : `prefers-reduced-motion`

```js
const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".line", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.1 });
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  gsap.set(".line", { opacity: 1, yPercent: 0 });
});
```

Argument de vente auprès des clients : cela montre un travail propre.

---

## 10. Équivalents CSS

Les mots-clés `ease-in` et `ease-out` du CSS sont assez faibles. Mieux vaut définir ses propres courbes :

```css
:root {
  --ease-power2-out:   cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-power3-out:   cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-expo-out:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-power2-in:    cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --ease-power3-inout: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-sine-inout:   cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.card {
  transition: transform 0.3s var(--ease-power2-out);
}
```

Ce sont des approximations des eases GSAP équivalents. La fonction CSS `linear()` permet en plus de reproduire des rebonds et des ressorts.

---

## 11. Briefer l'IA

Nommer l'ease et la durée plutôt que d'écrire "smooth" ou "fluide". Le résultat devient prévisible.

Modèle de consigne :

```
Anime les lignes du titre à l'entrée de la section :
- opacité 0 vers 1, 0.6 s, ease "power1.out"
- déplacement y 40 vers 0, 1.2 s, ease "expo.out"
- stagger 0.12 s entre les lignes
- déclenchement au scroll (ScrollTrigger, start "top 80%")
- respecter prefers-reduced-motion via gsap.matchMedia()
```

À toujours préciser : la propriété animée, l'ease, la durée, le stagger, le déclencheur.

---

## 12. Checklist avant de valider une animation

- [ ] L'ease correspond au rôle (entrée = `out`, sortie = `in`, déplacement = `inOut`, scroll = `none`)
- [ ] La durée est adaptée à la distance parcourue
- [ ] Opacité et déplacement sont séparés quand c'est un texte ou une carte
- [ ] Le masque d'un reveal fait la hauteur réelle des lettres (pas de la ligne), pour une course courte et un stagger régulier
- [ ] Les eases utilisés font partie de mon set de référence (pas de nouvel ease par hasard)
- [ ] Le hover est interruptible (`to` des deux côtés)
- [ ] Les boucles utilisent `sine.inOut`
- [ ] `prefers-reduced-motion` est géré
- [ ] Rien ne dépasse 1.5 s pour une entrée de contenu
