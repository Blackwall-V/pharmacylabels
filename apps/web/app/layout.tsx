import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Farmacompara",
    template: "%s · Farmacompara",
  },
  description: "Compara precios de medicamentos entre farmacias chilenas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      {/*
        Plain block flow, not `flex flex-col`: each page manages its own root div's
        layout independently, and a flex `body` turned every page root into a flex
        item with a default `min-width: auto` -- which refused to shrink below its
        content's intrinsic width and caused real horizontal overflow on mobile
        (confirmed via Playwright at a 375px viewport).
      */}
      <body className="min-h-full bg-paper text-ink">
        <Header />
        {children}
      </body>
    </html>
  );
}
