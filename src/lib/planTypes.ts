// Tipos e formatação de planos, sem acesso ao banco (pode ser usado no navegador).

/** "once" = anúncio avulso: pagamento único que vale por `duration_days`. */
export type BillingInterval = "month" | "year" | "once";

/** Profissionais (imobiliárias e corretores) assinam; proprietários compram anúncio avulso. */
export type PlanAudience = "profissional" | "proprietario";

export interface PlanRow {
  id: number;
  name: string;
  slug: string;
  audience: PlanAudience;
  description: string | null;
  price: number | string;
  billing_interval: BillingInterval;
  duration_days: number;
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
  audience: PlanAudience;
  description: string | null;
  price: number;
  billingInterval: BillingInterval;
  durationDays: number;
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

export function formatPlanPrice(price: number, interval: BillingInterval, durationDays = 0): string {
  const value = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  if (interval === "once") return `${value} por ${durationDays} dias`;
  return `${value}/${interval === "year" ? "ano" : "mês"}`;
}

/** Status do Stripe que mantêm os anúncios do anunciante no ar. */
export const LIVE_STATUSES = ["active", "trialing"] as const;

export function isLiveStatus(status: string | null | undefined): boolean {
  return LIVE_STATUSES.includes(status as (typeof LIVE_STATUSES)[number]);
}

/**
 * Anunciante com anúncios no ar: assinatura ativa/em teste, ou anúncio avulso
 * (sem assinatura no Stripe) dentro do prazo. Plano grátis não tem prazo.
 */
export function isLiveAccount(account: {
  subscription_status: string | null;
  stripe_subscription_id?: string | null;
  hasSubscription?: boolean;
  current_period_end: string | Date | null;
}): boolean {
  if (!isLiveStatus(account.subscription_status)) return false;
  const hasSubscription = account.hasSubscription ?? Boolean(account.stripe_subscription_id);
  if (hasSubscription || !account.current_period_end) return true;
  return new Date(account.current_period_end).getTime() > Date.now();
}
