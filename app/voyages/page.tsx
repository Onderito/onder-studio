import type { Metadata } from "next";
import PageReveal from "../components/PageReveal";
import Voyages from "../components/Voyages";

export const metadata: Metadata = {
  title: "Voyages · Onder Studio",
  description: "Mes voyages, racontés en images et en musique.",
};

export default function VoyagesPage() {
  return (
    <>
      {/* Fait apparaître le « Studio. » du logo (caché en CSS avant son entrée). */}
      <PageReveal />
      <Voyages />
    </>
  );
}
