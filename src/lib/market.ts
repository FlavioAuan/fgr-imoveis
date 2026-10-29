// Imóveis do mercado: anúncios das imobiliárias da cidade usados na prospecção do Admin.
// Arquivo sem dependências de servidor, usado nas rotas e nas telas.

export type MarketStatus = "novo" | "em_contato" | "negociando" | "captado" | "descartado";
export type ContactTarget = "imobiliaria" | "proprietario";
export type ContactChannel = "telefone" | "whatsapp" | "email" | "visita" | "outro";
export type ContactOutcome = "sem_resposta" | "retornar" | "interessado" | "sem_interesse" | "captado";

export const MARKET_STATUSES: { value: MarketStatus; label: string; cls: string; color: string }[] = [
  { value: "novo",       label: "Novo",       cls: "bg-blue-100 text-blue-700",       color: "#2563eb" },
  { value: "em_contato", label: "Em contato", cls: "bg-yellow-100 text-yellow-800",   color: "#ca8a04" },
  { value: "negociando", label: "Negociando", cls: "bg-purple-100 text-purple-700",   color: "#7e22ce" },
  { value: "captado",    label: "Captado",    cls: "bg-green-100 text-green-700",     color: "#15803d" },
  { value: "descartado", label: "Descartado", cls: "bg-neutral-200 text-neutral-500", color: "#a3a3a3" },
];

export const CONTACT_TARGETS: { value: ContactTarget; label: string }[] = [
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "proprietario", label: "Proprietário" },
];

export const CONTACT_CHANNELS: { value: ContactChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefone", label: "Telefone" },
  { value: "email", label: "E-mail" },
  { value: "visita", label: "Visita" },
  { value: "outro", label: "Outro" },
];

export const CONTACT_OUTCOMES: { value: ContactOutcome; label: string }[] = [
  { value: "sem_resposta", label: "Sem resposta" },
  { value: "retornar", label: "Pediu retorno" },
  { value: "interessado", label: "Interessado" },
  { value: "sem_interesse", label: "Sem interesse" },
  { value: "captado", label: "Imóvel captado" },
];

/** Categorias na ordem do filtro, com a cor do ponto no mapa. */
export const MARKET_CATEGORIES: { value: string; color: string }[] = [
  { value: "Casa", color: "#c2410c" },
  { value: "Casa em condomínio", color: "#9d174d" },
  { value: "Apartamento", color: "#1d4ed8" },
  { value: "Terreno", color: "#a16207" },
  { value: "Chácara / rural", color: "#15803d" },
  { value: "Comercial", color: "#3f3f46" },
  { value: "Outros", color: "#6b7280" },
];

export const PRICE_BANDS: { label: string; min: number | null; max: number | null }[] = [
  { label: "Até 300 mil", min: null, max: 300000 },
  { label: "300–500 mil", min: 300000, max: 500000 },
  { label: "500 mil–1 mi", min: 500000, max: 1000000 },
  { label: "1–2 mi", min: 1000000, max: 2000000 },
  { label: "Acima de 2 mi", min: 2000000, max: null },
];

export interface MarketAgency {
  id: number;
  name: string;
  website: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  contactName: string | null;
  notes: string | null;
}

export interface MarketListing {
  id: number;
  agencyId: number;
  category: string;
  rawType: string | null;
  neighborhood: string | null;
  price: number;
  area: number | null;
  bedrooms: number | null;
  url: string;
  title: string | null;
  lat: number | null;
  lng: number | null;
  geo: "exata" | "bairro" | null;
  status: MarketStatus;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  notes: string | null;
  /** AAAA-MM-DD */
  nextFollowup: string | null;
  lastContact: string | null;
  contacts: number;
}

export interface MarketContact {
  id: number;
  listingId: number;
  target: ContactTarget;
  channel: ContactChannel;
  outcome: ContactOutcome;
  notes: string | null;
  userName: string | null;
  createdAt: string;
}

export function statusInfo(status: string) {
  return MARKET_STATUSES.find(s => s.value === status) ?? MARKET_STATUSES[0];
}

export function categoryColor(category: string) {
  return MARKET_CATEGORIES.find(c => c.value === category)?.color ?? "#6b7280";
}

export function labelOf<T extends string>(list: { value: T; label: string }[], value: string) {
  return list.find(i => i.value === value)?.label ?? value;
}

/** Link do WhatsApp com DDI 55 quando o número veio só com DDD. */
export function whatsappLink(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length <= 11) digits = "55" + digits;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function marketStreetViewUrl(l: Pick<MarketListing, "lat" | "lng" | "neighborhood">) {
  return l.lat != null && l.lng != null
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${l.lat},${l.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.neighborhood ?? ""}, São João da Boa Vista - SP`)}`;
}
