export interface DbProperty {
  id: number;
  code: string;
  slug: string;
  title: string;
  transaction_type: "venda" | "aluguel";
  property_type: string;
  status: "disponivel" | "vendido" | "alugado" | "reservado" | "inativo";
  featured: number;
  price: number;
  condominium_fee: number | null;
  iptu: number | null;
  area: number | null;
  built_area: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spaces: number;
  description: string | null;
  city: string;
  state: string;
  neighborhood: string | null;
  address: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
  youtube_url: string | null;
  virtual_tour_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  agent_id: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  // joined
  cover_image?: string | null;
  agent_name?: string | null;
  image_count?: number;
}

export interface DbLead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  property_id: number | null;
  source: string | null;
  status: "novo" | "em_atendimento" | "convertido" | "arquivado";
  notes: string | null;
  created_at: string;
  property_title?: string;
}

export interface DbUser {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "corretor";
  active: number;
  last_login: string | null;
  created_at: string;
}

export interface DbAgent {
  id: number;
  name: string;
  photo: string | null;
  phone: string | null;
  email: string | null;
  creci: string | null;
  bio: string | null;
  active: number;
}

export interface DbFeature {
  id: number;
  name: string;
  icon: string | null;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  about_text: string | null;
  footer_text: string | null;
}

export interface DashboardStats {
  total_properties: number;
  for_sale: number;
  for_rent: number;
  total_leads: number;
  leads_this_month: number;
  featured_properties: number;
}
