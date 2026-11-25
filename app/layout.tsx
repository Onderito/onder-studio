import type { Metadata } from "next";
import { Geist, Caveat } from "next/font/google";
import Loader, { LOADER_SEEN_SCRIPT } from "./components/Loader";
import "./globals.css";

// Geist : Regular (400) et Medium (500) sur le site, Bold (700) réservé au loader.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Caveat : annotations et « Studio. » du logo. Bold (700) réservé au loader.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Onder Studio",
  description: "Portfolio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${caveat.variable} h-full antialiased`}
      // data-loader-seen est ajouté par le script ci-dessous avant l'hydratation.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOADER_SEEN_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Loader />
        {children}
      </body>
    </html>
  );
}
