import { NextRequest, NextResponse } from "next/server";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

// POST — abre o Portal do Cliente do Stripe (cartão, faturas, troca e cancelamento de plano)
export async function POST(req: NextRequest) {
  try {
    const account = await requireAdvertiser();
    if (!isStripeConfigured() || !account.stripe_customer_id) {
      return NextResponse.json({ error: "Nenhuma assinatura paga encontrada" }, { status: 400 });
    }
    const portal = await getStripe().billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: `${getAppUrl(req.nextUrl.origin)}/anunciante/plano`,
      locale: "pt-BR",
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    return advertiserError(e, "Não foi possível abrir o portal de pagamento");
  }
}
