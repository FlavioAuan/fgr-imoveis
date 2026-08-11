import type { Metadata } from "next";
import type React from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { siteConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Imóveis de Alto Padrão`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "imóveis",
    "FGR Imóveis",
    "comprar imóvel",
    "alugar imóvel",
    "casa",
    "apartamento",
    "São Paulo",
    "alto padrão",
    "imobiliária",
  ],
  authors: [{ name: "FGR Imóveis" }],
  creator: "FGR Imóveis",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
