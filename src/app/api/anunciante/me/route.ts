import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { advertiserError, getAdvertiserPlan, requireAdvertiser } from "@/lib/advertiserAuth";
import { isLiveStatus, mapPlan } from "@/lib/plans";

// GET — conta, plano, uso do plano e últimos pagamentos
export async function GET() {
  try {
    const account = await requireAdvertiser();
    const [planRow, usage, payments] = await Promise.all([
      getAdvertiserPlan(account),
      queryOne<{ listings: number; featured: number; leads: number }>(
        `SELECT
          (SELECT COUNT(*) FROM properties WHERE advertiser_id=? AND status<>'inativo') AS listings,
          (SELECT COUNT(*) FROM properties WHERE advertiser_id=? AND featured=1 AND status<>'inativo') AS featured,
          (SELECT COUNT(*) FROM leads l INNER JOIN properties p ON p.id=l.property_id WHERE p.advertiser_id=?) AS leads`,
        [account.id, account.id, account.id]
      ),
      query(
        `SELECT pay.id, pay.amount, pay.currency, pay.status, pay.invoice_url, pay.paid_at, pay.created_at, pl.name AS plan_name
         FROM payments pay LEFT JOIN plans pl ON pl.id=pay.plan_id
         WHERE pay.advertiser_id=? ORDER BY pay.created_at DESC LIMIT 12`,
        [account.id]
      ),
    ]);

    const { stripe_customer_id, stripe_subscription_id, ...publicAccount } = account;
    return NextResponse.json({
      account: {
        ...publicAccount,
        hasBillingAccount: Boolean(stripe_customer_id),
        hasSubscription: Boolean(stripe_subscription_id),
      },
      plan: planRow ? mapPlan(planRow) : null,
      live: isLiveStatus(account.subscription_status),
      usage: {
        listings: Number(usage?.listings ?? 0),
        featured: Number(usage?.featured ?? 0),
        leads: Number(usage?.leads ?? 0),
      },
      payments,
    });
  } catch (e) {
    return advertiserError(e, "Erro ao carregar conta");
  }
}

// PUT — dados de contato do anunciante
export async function PUT(req: NextRequest) {
  try {
    const account = await requireAdvertiser();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Informe o nome" }, { status: 400 });
    await query(
      "UPDATE advertisers SET name=?, company_name=?, document=?, creci=?, phone=? WHERE id=?",
      [
        name,
        String(body.company_name ?? "").trim() || null,
        String(body.document ?? "").replace(/\D/g, "") || null,
        String(body.creci ?? "").trim() || null,
        String(body.phone ?? "").trim() || null,
        account.id,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return advertiserError(e, "Erro ao salvar dados");
  }
}
