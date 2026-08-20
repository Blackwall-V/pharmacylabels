import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        Plain block flow, not `flex flex-col`: each page manages its own root div's
        layout independently, and a flex `body` turned every page root into a flex
        item with a default `min-width: auto` -- which refused to shrink below its
        content's intrinsic width and caused real horizontal overflow on mobile
        (confirmed via Playwright at a 375px viewport).
      */}
      <body className="min-h-full">{children}</body>
    </html>
  );
}
