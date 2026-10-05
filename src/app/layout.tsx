import type { Metadata } from "next";
import type React from "react";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { siteConfig } from "@/lib/config";
import { connection } from "next/server";
import { getSiteContact } from "@/lib/siteSettings";
import { SiteContactProvider } from "@/components/providers/SiteContactProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
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
    "São João da Boa Vista",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Lê as configurações a cada requisição, para refletir alterações feitas no admin
  await connection();
  const contact = await getSiteContact();

  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${plusJakarta.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <SiteContactProvider contact={contact}>
          <PublicShell>{children}</PublicShell>
        </SiteContactProvider>
      </body>
    </html>
  );
}
