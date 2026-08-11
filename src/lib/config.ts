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

export function getWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(message ?? siteConfig.whatsappDefaultMessage);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function getPropertyWhatsAppUrl(
  propertyTitle: string,
  propertyCode: string
): string {
  const message = `Olá! Gostaria de obter mais informações sobre o imóvel: ${propertyTitle} (Código: ${propertyCode}).`;
  return getWhatsAppUrl(message);
}
