/* eslint-disable @next/next/no-img-element -- SVG décoratifs (lignes guides, séparateurs) */
import Image from "next/image";
import Link from "next/link";
import { CarIcon, NailPolishIcon } from "./components/icons";
import Logo from "./components/Logo";
import PageReveal from "./components/PageReveal";
import PixelHover from "./components/PixelHover";
import ProjectList, { type ProjectItem } from "./components/ProjectList";
import ServiceList from "./components/ServiceList";
import type { ReactNode } from "react";

const EMAIL = "ulas.onder07@gmail.com";
// Prise de rendez-vous (15 min) : destination de tous les CTA.
const BOOKING = "https://cal.com/ulas-onder-q7mhmp/15min";
const INSTAGRAM = "https://www.instagram.com/onderstudio";

/** Mot mis en avant dans un paragraphe en texte secondaire. */
function Hl({ children }: { children: ReactNode }) {
  return <span className="text-foreground">{children}</span>;
}

const linkClass =
  "text-accent underline decoration-from-font [text-underline-position:from-font] transition-opacity duration-300 ease-[var(--ease-power2-out)] hover:opacity-70";

// Projets : titre + mini description (les captures restent dans public/images pour plus tard).
const clientProjects: ProjectItem[] = [
  { title: "Maison des Muses", description: "Institut de beauté, site vitrine et prise de rendez-vous.", mark: "MDM", icon: <NailPolishIcon /> },
  { title: "Kokolimo", description: "Chauffeur privé sur la Côte d’Azur.", mark: "KL", icon: <CarIcon /> },
];

const explorations: ProjectItem[] = [
  { title: "Sculpted for Comfort", description: "Exploration e-commerce pour du mobilier.", mark: "SFC" },
  { title: "Skincare", description: "Exploration d’une marque de soin de la peau.", mark: "SC" },
];


export default function Home() {
  return (
    <main className="relative mx-auto w-full max-w-[808px] px-4 pb-[34px] pt-6 md:pl-[18px] md:pr-3">
      <PageReveal />
      {/* Lignes guides pointillées sur les bords de la colonne */}
      <img
        data-guide
        src="/svg/guide-line.svg"
        alt=""
        aria-hidden
        width={1}
        height={1836}
        className="pointer-events-none absolute inset-y-0 left-0 hidden h-full md:block"
      />
      <img
        data-guide
        src="/svg/guide-line.svg"
        alt=""
        aria-hidden
        width={1}
        height={1836}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full md:block"
      />

      <div className="flex w-full max-w-[778px] flex-col">
        {/* Logo : « Önder » en 20px, seule exception à la règle des 14px */}
        <header data-reveal>
          <Logo />
        </header>

        {/* Présentation */}
        <section data-reveal className="mt-[120px] flex max-w-[660px] flex-col">
          <div className="flex items-center gap-3">
            <div className="relative h-[50px] w-[50.867px] shrink-0">
              <div className="absolute inset-0 overflow-hidden rounded-[8px] border-[0.2px] border-[rgba(110,111,111,0.2)]">
                <Image
                  src="/images/avatar.webp"
                  alt="Önder Ulas"
                  width={816}
                  height={1456}
                  priority
                  className="absolute left-0 top-[-55.21%] h-[181.53%] w-full max-w-none"
                />
                <PixelHover cell={5} />
              </div>
              <span className="absolute left-[12.65px] top-[20.3px] h-[1.65px] w-[1.75px] bg-accent" aria-hidden />
              <span className="absolute left-[30.77px] top-[25.81px] h-[1.65px] w-[1.75px] bg-accent" aria-hidden />
            </div>
            <div className="flex flex-col gap-[2px] font-medium">
              <h1 className="text-foreground">Önder Ulas</h1>
              <p className="text-muted">Design Engineer</p>
            </div>
          </div>

          <p className="mt-8 text-muted">
            <Hl>Design engineer</Hl> indépendant. Je conçois et développe <Hl>des sites de A à Z</Hl>, de la{" "}
            <Hl>direction artistique</Hl> à la <Hl>mise en ligne</Hl>. Je travaille autant <Hl>l’identité visuelle</Hl>{" "}
            que la façon dont le site réagit et se parcourt.
          </p>
          <p className="mt-4 text-muted">
            J’accorde beaucoup d’importance aux <Hl>détails</Hl> et à la <Hl>qualité</Hl> d’exécution. Une
            typographie, une image, une interaction : chaque choix contribue à <Hl>l’ensemble</Hl>. Je veux créer des
            sites qui ont du <Hl>caractère</Hl>, et qu’on a envie d’<Hl>explorer.</Hl>
          </p>
          <p className="relative mt-4">
            {/* Annotation dans la marge (grands écrans) : suit ce paragraphe, quelle que soit la taille du texte. */}
            <span
              data-reveal-hand
              className="font-hand absolute right-[calc(100%+37px)] top-[23px] hidden w-[188px] text-right text-muted min-[1240px]:block"
            >
              Tu peux me suivre sur Instagram{" "}
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="mt-[2px] block underline [text-underline-position:from-font]">
                @Onderstudio
              </a>
            </span>
            <span className="text-muted">Tu as un projet en tête ?</span>{" "}
            <a href={BOOKING} target="_blank" rel="noreferrer" className={`font-medium ${linkClass}`}>
              Parlons de ton site ↗
            </a>
          </p>
        </section>

        {/* Projets sélectionnés */}
        <section data-reveal className="mt-24 flex flex-col">
          <h2 className="font-medium text-foreground">Projets sélectionnés</h2>
          <p className="mt-4 max-w-[652px] text-muted">
            Des <Hl>sites</Hl> que j’ai conçus et développés pour mes <Hl>clients</Hl>, avec une attention portée à
            leur <Hl>identité</Hl>, à leurs <Hl>besoins</Hl> et à l’expérience de leurs <Hl>visiteurs</Hl>.
          </p>
          <div className="mt-[14px]">
            <ProjectList items={clientProjects} />
          </div>
        </section>

        {/* Explorations personnelles */}
        <section data-reveal className="mt-24 flex flex-col">
          <div className="relative">
            <h2 className="font-medium text-foreground">Explorations personnelles</h2>
            {/* Annotation dans la marge droite (grands écrans) : suit ce titre, quelle que soit la taille du texte. */}
            <p
              data-reveal-hand
              className="font-hand absolute left-[calc(100%+30px)] top-[23px] hidden w-[323px] text-muted min-[1240px]:block"
            >
              pour me contacter
              <br />
              <a href={`mailto:${EMAIL}`} className="underline [text-underline-position:from-font]">
                {EMAIL}
              </a>
            </p>
          </div>
          <p className="mt-4 max-w-[660px] text-muted">
            Un <Hl>espace</Hl> pour tester mes idées : des <Hl>interfaces</Hl>, des <Hl>univers visuels</Hl> et des{" "}
            <Hl>interactions</Hl> que je crée librement, pour le plaisir <Hl>d’explorer</Hl>.
          </p>
          <div className="mt-[14px]">
            <ProjectList items={explorations} variant="exploration" />
          </div>
        </section>

        {/* Services */}
        <section data-reveal className="mt-24 flex flex-col">
          <h2 className="font-medium text-foreground">Ce qu’on peut créer ensemble</h2>
          <p className="mt-4 max-w-[660px] text-muted">
            Tu as une idée, un site à <Hl>refaire</Hl> ou un <Hl>projet</Hl> à lancer ? Je peux{" "}
            <Hl>t’accompagner</Hl> sur le <Hl>design</Hl>, le <Hl>développement</Hl> ou les <Hl>deux</Hl>. On pose une{" "}
            <Hl>direction</Hl> et je m’occupe de lui donner <Hl>vie</Hl>, jusqu’aux <Hl>dernières interactions</Hl>.{" "}
            <a href={BOOKING} target="_blank" rel="noreferrer" className={linkClass}>
              On en parle ? ↗
            </a>
          </p>

          <div className="relative mt-[30px]">
            {/* Annotation (grands écrans) : indique que les services s'ouvrent au clic. */}
            <p
              data-reveal-hand
              className="font-hand absolute right-[calc(100%+60px)] top-[24px] hidden w-[170px] text-right text-muted min-[1240px]:block"
            >
              clique sur un service,
              <br />
              je t’explique tout
              <svg
                aria-hidden
                width="30"
                height="14"
                viewBox="0 0 30 14"
                fill="none"
                // Flèche entre le texte et la ligne guide : elle s'arrête 8px avant la ligne, sans la franchir.
                className="absolute -right-[34px] top-[14px] text-muted"
              >
                {/* Petite flèche dessinée à la main, vers la liste */}
                <path
                  d="M1.5 4.5c5.5 4 13 5.2 23 2.8M20.6 2.8l3.9 4.3-5 2.6"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
            <ServiceList />
          </div>
        </section>

        {/* Fin de page */}
        <section data-reveal className="mt-24 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-[374px] flex-col gap-4">
            <h2 className="font-medium text-foreground">Un peu plus de moi, avant qu’on se quitte</h2>
            <p className="max-w-[315px] text-muted">
              Mes <Hl>voyages</Hl>, ma <Hl>personne,</Hl> racontés en <Hl>images</Hl> et en <Hl>musique</Hl>.
            </p>
          </div>
          <Link
            href="/voyages"
            className="flex h-[42px] min-w-[150px] shrink-0 whitespace-nowrap items-center justify-center rounded-[4px] bg-accent p-[10px] text-white transition-opacity duration-300 ease-[var(--ease-power2-out)] hover:opacity-85"
          >
            Je prends place →
          </Link>
        </section>
      </div>
    </main>
  );
}
