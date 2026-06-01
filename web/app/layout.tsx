import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Odporúčací systém v Prologu — interaktívne demo",
  description:
    "Vysvetliteľný odporúčací systém pre filmy, knihy, hry a seriály, poháňaný reálnym SWI-Prolog enginom. Tímový projekt LPI, TUKE.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
