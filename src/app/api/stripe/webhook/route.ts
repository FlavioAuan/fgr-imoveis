import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { query } from "@/lib/db";
import { applyOneTimeCheckout, getStripe, recordInvoice, syncSubscription } from "@/lib/stripe";

// POST — eventos do Stripe. Cadastre no Dashboard: Developers > Webhooks > {APP_URL}/api/stripe/webhook
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (e) {
    console.error("Stripe webhook: assinatura inválida", e);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const advertiserId = Number(session.client_reference_id);
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (advertiserId && customerId) {
          await query(
            "UPDATE advertisers SET stripe_customer_id=? WHERE id=? AND stripe_customer_id IS NULL",
            [customerId, advertiserId]
          );
        }
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (subscriptionId) {
          await syncSubscription(await getStripe().subscriptions.retrieve(subscriptionId));
        }
        await applyOneTimeCheckout(session);
        break;
      }
      // Pix/boleto confirmados depois do fim do Checkout
      case "checkout.session.async_payment_succeeded":
        await applyOneTimeCheckout(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object);
        break;
      case "invoice.paid":
      case "invoice.payment_failed":
      case "invoice.finalized":
        await recordInvoice(event.data.object);
        break;
    }
  } catch (e) {
    console.error(`Stripe webhook: erro ao processar ${event.type}`, e);
    return NextResponse.json({ error: "Erro ao processar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
