import type { PropertyType } from "@/types/property";

/** Centro de São João da Boa Vista, usado quando não há pontos para enquadrar. */
export const CITY_CENTER: [number, number] = [-21.9707, -46.7944];

/** Mapa do OpenStreetMap: mostra ruas, bairros e pontos de referência. */
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">colaboradores do OpenStreetMap</a>';

/** Cor do pino por tipo de imóvel (legíveis sobre o mapa claro). */
export const TYPE_COLORS: Record<PropertyType, string> = {
  casa: "#c2410c",
  condominio: "#9d174d",
  apartamento: "#1d4ed8",
  cobertura: "#0e7490",
  studio: "#6d28d9",
  terreno: "#a16207",
  comercial: "#3f3f46",
};

export function streetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

export interface MapListing {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  transaction: "venda" | "aluguel";
  price: number;
  bedrooms: number;
  area: number;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  cover: string | null;
  advertiser: string | null;
}
