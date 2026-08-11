export type PropertyTransaction = "venda" | "aluguel";

export type PropertyType =
  | "casa"
  | "apartamento"
  | "terreno"
  | "comercial"
  | "condominio"
  | "cobertura"
  | "studio";

export type PropertyStatus = "disponivel" | "vendido" | "alugado" | "reservado";

export interface PropertyFeature {
  key: string;
  label: string;
}

export interface PropertyLocation {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Property {
  id: string;
  slug: string;
  code: string;
  title: string;
  description: string;
  type: PropertyType;
  transaction: PropertyTransaction;
  status: PropertyStatus;
  price: number;
  condoFee?: number;
  iptu?: number;
  location: PropertyLocation;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  features: string[];
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
  condominio: "Condomínio",
  cobertura: "Cobertura",
  studio: "Studio",
};

export const propertyTransactionLabels: Record<PropertyTransaction, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  alugado: "Alugado",
  reservado: "Reservado",
};

export interface PropertyFilters {
  transaction?: PropertyTransaction;
  type?: PropertyType;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  minArea?: number;
  maxArea?: number;
}

export type PropertySortOption =
  | "recentes"
  | "menor-preco"
  | "maior-preco"
  | "maior-area";
