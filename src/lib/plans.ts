import { query, queryOne } from "./db";
import type { Plan, PlanRow } from "./planTypes";

export * from "./planTypes";

export function mapPlan(row: PlanRow & { subscribers?: number }): Plan {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    billingInterval: row.billing_interval,
    trialDays: Number(row.trial_days),
    maxListings: row.max_listings == null ? null : Number(row.max_listings),
    maxFeatured: Number(row.max_featured),
    features: (row.features ?? "").split("\n").map(f => f.trim()).filter(Boolean),
    highlighted: Boolean(Number(row.highlighted)),
    active: Boolean(Number(row.active)),
    displayOrder: Number(row.display_order),
    stripeSynced: Boolean(row.stripe_price_id),
    ...(row.subscribers != null ? { subscribers: Number(row.subscribers) } : {}),
  };
}

export async function listActivePlans(): Promise<Plan[]> {
  const rows = await query<PlanRow>(
    "SELECT * FROM plans WHERE active=1 ORDER BY display_order ASC, price ASC"
  );
  return rows.map(mapPlan);
}

export async function getPlanRow(id: number) {
  return queryOne<PlanRow>("SELECT * FROM plans WHERE id=? LIMIT 1", [id]);
}

/** Condição SQL para o site público: imóveis da FGR ou de anunciantes com plano em dia. */
export const PUBLIC_LISTING_SQL = `(p.advertiser_id IS NULL OR EXISTS (
  SELECT 1 FROM advertisers adv
  WHERE adv.id=p.advertiser_id AND adv.active=1 AND adv.subscription_status IN ('active','trialing')
))`;
