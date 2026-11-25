/*
 * Lecteur audio de la section Voyages : un fichier hébergé sur le site (HTMLAudioElement).
 *
 * `level` (0 → 1) est le volume courant : on l'anime avec GSAP pour les fondus.
 */

export interface TrackPlayer {
  level: number;
  play(): void;
  pause(): void;
  /** Applique `level` au lecteur (à appeler à chaque étape d'un fondu). */
  applyLevel(): void;
  destroy(): void;
}

/** Gestes qui autorisent le navigateur à lancer du son. */
const GESTURES = ["pointerdown", "keydown", "touchend"] as const;

/** Fichier audio hébergé dans public/. */
export class FilePlayer implements TrackPlayer {
  level = 0;
  private audio: HTMLAudioElement;
  /** Vrai tant qu'on veut que la musique joue (même si le navigateur l'a bloquée). */
  private wanted = false;

  constructor(src: string) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.preload = "none"; // chargé en streaming au premier play()
    this.audio.volume = 0;
  }

  play() {
    this.wanted = true;
    // Sans interaction préalable (page ouverte directement, rechargée…), le navigateur
    // refuse la lecture : on réessaie au premier clic ou à la première touche.
    this.audio.play().catch(() => this.retryOnGesture());
  }
  pause() {
    this.wanted = false;
    this.stopRetry();
    this.audio.pause();
  }
  applyLevel() {
    this.audio.volume = this.level;
  }
  destroy() {
    this.pause();
  }

  private retry = () => {
    this.stopRetry();
    if (this.wanted) this.audio.play().catch(() => this.retryOnGesture());
  };
  private retryOnGesture() {
    GESTURES.forEach((g) =>
      window.addEventListener(g, this.retry, { once: true }),
    );
  }
  private stopRetry() {
    GESTURES.forEach((g) => window.removeEventListener(g, this.retry));
  }
}
