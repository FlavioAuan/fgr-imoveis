export const siteConfig = {
  name: "FGR Imóveis",
  description:
    "Imóveis selecionados para quem busca qualidade, segurança e uma nova forma de viver.",
  url: "https://fgrimoveis.com.br",

  // Contato — substitua pelos dados reais
  whatsapp: "5511999999999",
  phone: "(11) 99999-9999",
  email: "contato@fgrimoveis.com.br",
  instagram: "@fgrimoveis",
  instagramUrl: "https://instagram.com/fgrimoveis",

  // Endereço — substitua pelo endereço real
  address: {
    street: "[Endereço a confirmar]",
    city: "[Cidade]",
    state: "[Estado]",
    zip: "[CEP]",
  },

  // Horário de atendimento
  businessHours: {
    weekdays: "Segunda a Sexta: 8h às 18h",
    saturday: "Sábado: 8h às 12h",
    sunday: "Fechado aos domingos",
  },

  // SEO
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FGR Imóveis",
  },

  // WhatsApp — mensagem padrão
  whatsappDefaultMessage:
    "Olá! Vim através do site da FGR Imóveis e gostaria de mais informações.",
};

export const WHATSAPP_NUMBER = siteConfig.whatsapp;

/** Deixa só os dígitos e garante o código do país (55) para números brasileiros. */
export function normalizeWhatsApp(raw: string | null | undefined): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function getWhatsAppUrl(message?: string, number: string = WHATSAPP_NUMBER): string {
  const text = encodeURIComponent(message ?? siteConfig.whatsappDefaultMessage);
  return `https://wa.me/${normalizeWhatsApp(number) || WHATSAPP_NUMBER}?text=${text}`;
}

export function getPropertyWhatsAppUrl(
  propertyTitle: string,
  propertyCode: string
): string {
  const message = `Olá! Gostaria de obter mais informações sobre o imóvel: ${propertyTitle} (Código: ${propertyCode}).`;
  return getWhatsAppUrl(message);
}

/** Formata um número de WhatsApp (ex.: 5519999999999 → (19) 99999-9999). */
export function formatWhatsApp(number: string): string {
  const d = normalizeWhatsApp(number).replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return number;
}
