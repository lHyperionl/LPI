import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Odporúčací systém v Prologu",
    description:
        "Systém na odporúčanie filmov, kníh, hier a seriálov prepojený jednou znalostnou bázou",
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
