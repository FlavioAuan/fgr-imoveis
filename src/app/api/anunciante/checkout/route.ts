import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { getPlanRow } from "@/lib/plans";
import { ensurePlanPrice, getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

/** Status em que o anunciante já tem assinatura no Stripe e deve trocar de plano pelo portal. */
const MANAGED_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete", "paused"];

// POST — inicia a assinatura de um plano. Devolve a URL do Stripe Checkout.
export async function POST(req: NextRequest) {
  try {
    const account = await requireAdvertiser();
    const { planId } = await req.json();
    const plan = await getPlanRow(Number(planId));
    if (!plan || !Number(plan.active)) {
      return NextResponse.json({ error: "Plano indisponível" }, { status: 404 });
    }

    const hasStripeSubscription =
      Boolean(account.stripe_subscription_id) && MANAGED_STATUSES.includes(account.subscription_status ?? "");
    if (hasStripeSubscription) {
      return NextResponse.json(
        { error: "Você já tem uma assinatura. Use \"Gerenciar assinatura\" para trocar de plano ou cancelar.", usePortal: true },
        { status: 409 }
      );
    }

    // Plano grátis: ativa direto, sem passar pelo Stripe
    if (Number(plan.price) === 0) {
      await query(
        `UPDATE advertisers SET plan_id=?, subscription_status='active', stripe_subscription_id=NULL,
           current_period_end=NULL, cancel_at_period_end=0 WHERE id=?`,
        [plan.id, account.id]
      );
      return NextResponse.json({ activated: true });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Pagamentos ainda não estão disponíveis. Tente mais tarde." }, { status: 503 });
    }

    const stripe = getStripe();
    const priceId = await ensurePlanPrice(plan);

    let customerId = account.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: account.email,
        name: account.company_name || account.name,
        phone: account.phone || undefined,
        metadata: { advertiser_id: String(account.id) },
      });
      customerId = customer.id;
      await query("UPDATE advertisers SET stripe_customer_id=? WHERE id=?", [customerId, account.id]);
    }

    const appUrl = getAppUrl(req.nextUrl.origin);
    const metadata = { advertiser_id: String(account.id), plan_id: String(plan.id) };
    const common = {
      customer: customerId,
      client_reference_id: String(account.id),
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      allow_promotion_codes: true,
      locale: "pt-BR" as const,
      success_url: `${appUrl}/anunciante/plano?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/anunciante/plano?checkout=cancelado`,
    };

    // Anúncio avulso: pagamento único, com fatura para aparecer em "Pagamentos"
    const session = plan.billing_interval === "once"
      ? await stripe.checkout.sessions.create({
          ...common,
          mode: "payment",
          invoice_creation: { enabled: true, invoice_data: { metadata } },
          payment_intent_data: { metadata },
        })
      : await stripe.checkout.sessions.create({
          ...common,
          mode: "subscription",
          subscription_data: {
            metadata,
            ...(Number(plan.trial_days) > 0 ? { trial_period_days: Number(plan.trial_days) } : {}),
          },
        });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return advertiserError(e, "Não foi possível iniciar o pagamento");
  }
}
