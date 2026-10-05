import { cache } from "react";
import { queryOne } from "./db";
import { siteConfig, normalizeWhatsApp } from "./config";

export interface SiteContact {
  whatsapp: string;
  phone: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  address: { street: string; city: string; state: string };
}

export const defaultContact: SiteContact = {
  whatsapp: siteConfig.whatsapp,
  phone: siteConfig.phone,
  email: siteConfig.email,
  instagram: siteConfig.instagram,
  instagramUrl: siteConfig.instagramUrl,
  address: {
    street: siteConfig.address.street,
    city: siteConfig.address.city,
    state: siteConfig.address.state,
  },
};

type SettingsRow = {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
};

/** Dados de contato cadastrados em Admin → Configurações (com fallback para config.ts). */
export const getSiteContact = cache(async (): Promise<SiteContact> => {
  try {
    const row = await queryOne<SettingsRow>(
      "SELECT phone,whatsapp,email,instagram,address,city,state FROM site_settings ORDER BY id ASC LIMIT 1"
    );
    if (!row) return defaultContact;

    const instagram = row.instagram?.trim() || defaultContact.instagram;
    const handle = instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

    return {
      whatsapp: normalizeWhatsApp(row.whatsapp) || defaultContact.whatsapp,
      phone: row.phone?.trim() || defaultContact.phone,
      email: row.email?.trim() || defaultContact.email,
      instagram: instagram.startsWith("http") ? `@${handle}` : instagram,
      instagramUrl: `https://instagram.com/${handle}`,
      address: {
        street: row.address?.trim() || defaultContact.address.street,
        city: row.city?.trim() || defaultContact.address.city,
        state: row.state?.trim() || defaultContact.address.state,
      },
    };
  } catch {
    return defaultContact;
  }
});
