"use client";

import { createContext, useCallback, useContext } from "react";
import { getWhatsAppUrl } from "@/lib/config";
import type { SiteContact } from "@/lib/siteSettings";

const SiteContactContext = createContext<SiteContact | null>(null);

export function SiteContactProvider({
  contact,
  children,
}: {
  contact: SiteContact;
  children: React.ReactNode;
}) {
  return <SiteContactContext.Provider value={contact}>{children}</SiteContactContext.Provider>;
}

export function useSiteContact(): SiteContact {
  const ctx = useContext(SiteContactContext);
  if (!ctx) throw new Error("useSiteContact must be used inside SiteContactProvider");
  return ctx;
}

/** Monta o link do WhatsApp com o número cadastrado em Configurações. */
export function useWhatsAppUrl() {
  const { whatsapp } = useSiteContact();
  return useCallback((message?: string) => getWhatsAppUrl(message, whatsapp), [whatsapp]);
}
