import { NextRequest, NextResponse } from "next/server";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { getStripe, isStripeConfigured, syncSubscription } from "@/lib/stripe";

// POST — chamado na volta do Checkout. Sincroniza a assinatura sem esperar o webhook.
export async function POST(req: NextRequest) {
  try {
    const account = await requireAdvertiser();
    const { sessionId } = await req.json();
    if (!sessionId || !isStripeConfigured()) return NextResponse.json({ ok: false });

    const session = await getStripe().checkout.sessions.retrieve(String(sessionId), {
      expand: ["subscription"],
    });
    if (session.client_reference_id !== String(account.id)) {
      return NextResponse.json({ error: "Sessão de pagamento inválida" }, { status: 403 });
    }
    if (session.subscription && typeof session.subscription !== "string") {
      await syncSubscription(session.subscription);
    }
    return NextResponse.json({ ok: true, status: session.status });
  } catch (e) {
    return advertiserError(e, "Erro ao confirmar pagamento");
  }
}
