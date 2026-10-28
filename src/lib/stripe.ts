import Stripe from "stripe";
import { query, queryOne } from "./db";
import type { PlanRow } from "./plans";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_NOT_CONFIGURED");
  if (!client) client = new Stripe(key);
  return client;
}

/** URL pública do site, usada nos retornos do Checkout e do Portal. */
export function getAppUrl(fallbackOrigin: string): string {
  return (process.env.APP_URL || fallbackOrigin).replace(/\/$/, "");
}

/**
 * Garante que o plano tenha produto e preço no Stripe e devolve o price id.
 * Preços no Stripe não mudam de valor: quando o Admin altera preço ou período,
 * o preço antigo é arquivado e um novo é criado.
 */
export async function ensurePlanPrice(plan: PlanRow): Promise<string> {
  const stripe = getStripe();
  let productId = plan.stripe_product_id;

  if (productId) {
    await stripe.products.update(productId, {
      name: plan.name,
      description: plan.description || undefined,
      active: true,
    });
  } else {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: { plan_id: String(plan.id) },
    });
    productId = product.id;
  }

  if (plan.stripe_price_id) {
    const current = await stripe.prices.retrieve(plan.stripe_price_id);
    const sameAmount = current.unit_amount === Math.round(Number(plan.price) * 100);
    const sameInterval = current.recurring?.interval === plan.billing_interval;
    if (current.active && sameAmount && sameInterval && current.product === productId) {
      await query("UPDATE plans SET stripe_product_id=? WHERE id=?", [productId, plan.id]);
      return current.id;
    }
    await stripe.prices.update(current.id, { active: false });
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "brl",
    unit_amount: Math.round(Number(plan.price) * 100),
    recurring: { interval: plan.billing_interval },
    metadata: { plan_id: String(plan.id) },
  });

  await query("UPDATE plans SET stripe_product_id=?, stripe_price_id=? WHERE id=?", [productId, price.id, plan.id]);
  return price.id;
}

/** Arquiva produto e preço do plano no Stripe (planos desativados ou excluídos). */
export async function archivePlanInStripe(plan: PlanRow): Promise<void> {
  if (!isStripeConfigured()) return;
  const stripe = getStripe();
  if (plan.stripe_price_id) await stripe.prices.update(plan.stripe_price_id, { active: false });
  if (plan.stripe_product_id) await stripe.products.update(plan.stripe_product_id, { active: false });
}

function toDate(unix: number | null | undefined): Date | null {
  return unix ? new Date(unix * 1000) : null;
}

/** Copia o estado de uma assinatura do Stripe para o anunciante. */
export async function syncSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? null;

  const advertiserId = Number(subscription.metadata?.advertiser_id) || null;
  const advertiser = advertiserId
    ? await queryOne<{ id: number }>("SELECT id FROM advertisers WHERE id=?", [advertiserId])
    : await queryOne<{ id: number }>("SELECT id FROM advertisers WHERE stripe_customer_id=? LIMIT 1", [customerId]);
  if (!advertiser) return;

  const plan = priceId
    ? await queryOne<{ id: number }>("SELECT id FROM plans WHERE stripe_price_id=? LIMIT 1", [priceId])
    : null;
  const planId = plan?.id ?? (Number(subscription.metadata?.plan_id) || null);

  await query(
    `UPDATE advertisers SET
       stripe_customer_id=?, stripe_subscription_id=?, subscription_status=?,
       plan_id=COALESCE(?, plan_id), current_period_end=?, cancel_at_period_end=?
     WHERE id=?`,
    [
      customerId,
      subscription.id,
      subscription.status,
      planId,
      toDate(item?.current_period_end ?? null),
      subscription.cancel_at_period_end || subscription.cancel_at ? 1 : 0,
      advertiser.id,
    ]
  );
}

/** Registra (ou atualiza) uma fatura do Stripe na tabela de pagamentos. */
export async function recordInvoice(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.id) return;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const advertiser = await queryOne<{ id: number; plan_id: number | null }>(
    "SELECT id, plan_id FROM advertisers WHERE stripe_customer_id=? LIMIT 1",
    [customerId]
  );
  if (!advertiser) return;

  const priceId = invoice.lines?.data[0]?.pricing?.price_details?.price;
  const plan = typeof priceId === "string"
    ? await queryOne<{ id: number }>("SELECT id FROM plans WHERE stripe_price_id=? LIMIT 1", [priceId])
    : null;

  const paid = invoice.status === "paid";
  const paidAt = paid ? toDate(invoice.status_transitions?.paid_at ?? null) : null;

  await query(
    `INSERT INTO payments (advertiser_id,plan_id,stripe_invoice_id,amount,currency,status,invoice_url,paid_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE amount=VALUES(amount), status=VALUES(status),
       invoice_url=VALUES(invoice_url), paid_at=VALUES(paid_at)`,
    [
      advertiser.id,
      plan?.id ?? advertiser.plan_id,
      invoice.id,
      (paid ? invoice.amount_paid : invoice.amount_due) / 100,
      invoice.currency,
      invoice.status ?? "open",
      invoice.hosted_invoice_url ?? null,
      paidAt,
    ]
  );
}
