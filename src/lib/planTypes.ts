// Tipos e formatação de planos, sem acesso ao banco (pode ser usado no navegador).

export type BillingInterval = "month" | "year";

export interface PlanRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  billing_interval: BillingInterval;
  trial_days: number;
  max_listings: number | null;
  max_featured: number;
  features: string | null;
  highlighted: number;
  active: number;
  display_order: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  billingInterval: BillingInterval;
  trialDays: number;
  maxListings: number | null;
  maxFeatured: number;
  features: string[];
  highlighted: boolean;
  active: boolean;
  displayOrder: number;
  stripeSynced: boolean;
  subscribers?: number;
}

export function formatPlanPrice(price: number, interval: BillingInterval): string {
  const value = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  return `${value}/${interval === "year" ? "ano" : "mês"}`;
}

/** Status do Stripe que mantêm os anúncios do anunciante no ar. */
export const LIVE_STATUSES = ["active", "trialing"] as const;

export function isLiveStatus(status: string | null | undefined): boolean {
  return LIVE_STATUSES.includes(status as (typeof LIVE_STATUSES)[number]);
}
