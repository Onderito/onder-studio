"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Logo from "./Logo";
import VoyagesGallery, { type GalleryApi } from "./VoyagesGallery";
import VoyagesScroll from "./VoyagesScroll";
import Image from "next/image";
import { soundtrack, voyages } from "../content/voyages";
import { SCROLL_IMAGE_SIZES } from "./VoyagesScroll";
import { FilePlayer, type TrackPlayer } from "./audio-players";

const VOLUME = 0.8;
const FADE = 1.5; // fondu d'entrée et de sortie de la musique, en secondes

type Mode = "defilement" | "galerie";
const MODES: { id: Mode; label: string }[] = [
  { id: "defilement", label: "Défilement" },
  { id: "galerie", label: "Galerie" },
];

/**
 * Section « Je prends place » : mes voyages, en deux modes.
 * - Défilement : les photos une par une, guidées au scroll.
 * - Galerie : toutes les photos sur une toile qu'on explore en la faisant glisser.
 * L'en-tête (logo, son, fermer) et le sélecteur de mode restent fixes au-dessus des deux,
 * et la bande-son continue d'un mode à l'autre.
 */
export default function Voyages() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("defilement");
  const [soundOn, setSoundOn] = useState(true);
  const player = useRef<TrackPlayer | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const switching = useRef(false);
  /** Photo regardée en ce moment : chaque mode s'ouvre sur elle. */
  const current = useRef(0);
  const [startIndex, setStartIndex] = useState(0);
  const gallery = useRef<GalleryApi | null>(null);
  /** Galerie → défilement : copie de la photo choisie, qui grandit jusqu'à sa place. */
  const [morph, setMorph] = useState<{ index: number; rect: DOMRect; src: string } | null>(null);
  const morphEl = useRef<HTMLDivElement>(null);

  // --- Bande-son : un seul morceau en boucle. Il monte en fondu à l'arrivée, et descend
  //     puis se met en pause quand on coupe le son.
  useEffect(() => {
    const p = new FilePlayer(soundtrack);
    player.current = p;
    return () => {
      gsap.killTweensOf(p);
      p.destroy();
    };
  }, []);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    gsap.killTweensOf(p);
    const fade = {
      duration: FADE,
      ease: "power1.inOut",
      onUpdate: () => p.applyLevel(),
    };
    if (soundOn) {
      p.play();
      gsap.to(p, { ...fade, level: VOLUME });
    } else {
      gsap.to(p, { ...fade, level: 0, onComplete: () => p.pause() });
    }
  }, [soundOn]);

  // --- Échap : retour à l'accueil.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // --- Changement de mode.
  //     Défilement → galerie : le défilement s'efface, puis la galerie fait son entrée
  //     (dézoom), centrée sur la photo qu'on regardait.
  //     Galerie → défilement : la photo la plus proche du centre reste, les autres
  //     s'effacent, puis elle grandit jusqu'à sa place dans le défilement, qui reprend sur elle.
  const switchTo = (next: Mode) => {
    if (next === mode || switching.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const focus = next === "defilement" && !reduce ? gallery.current?.focus() : null;
    switching.current = true;
    if (focus) setMorph(focus);
    gsap.to(stage.current, {
      opacity: 0,
      duration: reduce ? 0 : 0.25,
      ease: "power2.in",
      onComplete: () => {
        if (focus) current.current = focus.index;
        window.scrollTo(0, 0);
        setStartIndex(current.current);
        setMode(next);
      },
    });
  };
  useEffect(() => {
    // Le défilement révèle lui-même la page quand la photo a fini de grandir (voir onReady).
    if (!switching.current || morph) return;
    switching.current = false;
    gsap.to(stage.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const onActiveChange = useCallback((i: number) => {
    current.current = i;
  }, []);
  const onScrollReady = useCallback((box: HTMLElement) => {
    const el = morphEl.current;
    const from = el?.getBoundingClientRect();
    if (!el || !from) return;
    const rect = box.getBoundingClientRect();
    const image = box.querySelector("img");
    // La vraie photo reste cachée pendant le zoom : sinon on la voit déjà à sa place, derrière
    // la copie qui grandit, et la copie semble repasser par-dessus la même image.
    gsap.set(box, { autoAlpha: 0 });
    // La copie grandit de sa place en galerie jusqu'au cadre du défilement, en se recadrant
    // au passage (l'image reste en « cover » dans un cadre qui change de proportions).
    gsap
      .timeline({
        onComplete: () => {
          // On ne retire la copie qu'une fois la vraie photo chargée et décodée : sinon on
          // verrait un instant le cadre vide (le flash). Les deux sont identiques, pixel près.
          const done = () => {
            gsap.set(box, { autoAlpha: 1 });
            switching.current = false;
            setMorph(null);
          };
          if (image && !image.complete) image.addEventListener("load", done, { once: true });
          else if (image) image.decode().then(done, done);
          else done();
        },
      })
      .fromTo(
        el,
        { left: from.left, top: from.top, width: from.width, height: from.height },
        // Départ franc puis longue arrivée en douceur : la photo « s'ouvre » vers nous.
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          duration: 0.8,
          ease: "power4.out",
        },
      )
      // Le défilement (photos voisines, lieux, légende) apparaît pendant le zoom, pas après.
      .to(stage.current, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.15);
  }, []);

  return (
    <div className="relative min-h-dvh">
      {/* En-tête : logo à gauche, son et fermeture à droite. En galerie, un fondu du fond
          passe derrière pour que le logo et les boutons restent lisibles sur les photos. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-background via-background/70 to-transparent transition-opacity duration-500 ${
          mode === "galerie" ? "opacity-100" : "opacity-0"
        }`}
      />
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[13px] md:px-10">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOn((s) => !s)}
            aria-pressed={soundOn}
            className="flex h-9 cursor-pointer items-center justify-center rounded-[4px] px-[10px] text-muted transition-colors duration-300 ease-[var(--ease-power2-out)] hover:text-foreground"
          >
            {soundOn ? "Son activé" : "Son coupé"}
          </button>
          <Link
            href="/"
            className="flex h-9 w-20 items-center justify-center rounded-[4px] border-[0.3px] border-[#d9d9d9] bg-muted/5 text-foreground transition-colors duration-300 ease-[var(--ease-power2-out)] hover:bg-muted/10"
          >
            Fermer
          </Link>
        </div>
      </header>

      <div ref={stage}>
        {mode === "defilement" ? (
          <VoyagesScroll
            initialIndex={startIndex}
            onActiveChange={onActiveChange}
            onReady={onScrollReady}
          />
        ) : (
          <VoyagesGallery focusIndex={startIndex} apiRef={gallery} />
        )}
      </div>

      {/* Galerie → défilement : la photo choisie, au-dessus de tout, pendant qu'elle grandit */}
      {morph && (
        <div
          ref={morphEl}
          aria-hidden
          className="pointer-events-none fixed z-[15] overflow-hidden rounded-[4px] shadow-[0_0_0_0.5px_rgba(110,111,111,0.25),0_1px_2px_rgba(41,41,41,0.06),0_12px_32px_-12px_rgba(41,41,41,0.12)]"
          style={{
            left: morph.rect.left,
            top: morph.rect.top,
            width: morph.rect.width,
            height: morph.rect.height,
          }}
        >
          {/* L'image déjà chargée par la galerie : elle s'affiche tout de suite, sans attente… */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={morph.src} alt="" className="absolute inset-0 size-full object-cover" />
          {/* …puis la version nette du défilement (même fichier, même taille : déjà en cache
              quand le défilement l'affiche) apparaît par-dessus dès qu'elle est chargée. */}
          <Image
            src={voyages[morph.index].image.src}
            alt=""
            fill
            sizes={SCROLL_IMAGE_SIZES}
            priority
            className="object-cover opacity-0 transition-opacity duration-200"
            onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
          />
        </div>
      )}

      {/* Sélecteur de mode, centré en bas : même style que « Fermer », la pastille blanche
          glisse sous le mode actif. */}
      <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center md:bottom-10">
        <div
          role="radiogroup"
          aria-label="Affichage"
          className="relative isolate grid grid-cols-2 rounded-[6px] border-[0.3px] border-[#d9d9d9] bg-background/80 p-[3px] backdrop-blur-md"
        >
          <span
            aria-hidden
            className={`absolute inset-y-[3px] left-[3px] -z-10 w-[calc(50%-3px)] rounded-[4px] bg-white shadow-[0_0_0_0.5px_rgba(110,111,111,0.25),0_1px_2px_rgba(41,41,41,0.06)] transition-transform duration-500 ease-[var(--ease-expo-out)] ${
              mode === "galerie" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => switchTo(m.id)}
              className={`h-[30px] cursor-pointer px-4 transition-colors duration-300 ease-[var(--ease-power2-out)] ${
                mode === m.id ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
