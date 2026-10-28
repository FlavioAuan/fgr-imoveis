import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET — anunciantes do marketplace com plano, status e uso (admin)
export async function GET() {
  try {
    await requireAuth(["super_admin", "admin"]);
    const [advertisers, summary] = await Promise.all([
      query(
        `SELECT a.id, a.name, a.company_name, a.kind, a.document, a.creci, a.phone, a.email, a.active,
          CASE WHEN a.subscription_status='active' AND a.stripe_subscription_id IS NULL
                 AND a.current_period_end IS NOT NULL AND a.current_period_end <= NOW()
               THEN 'expired' ELSE a.subscription_status END AS subscription_status,
          a.current_period_end, a.cancel_at_period_end, a.last_login, a.created_at,
          a.stripe_customer_id IS NOT NULL AS has_billing,
          pl.id AS plan_id, pl.name AS plan_name, pl.price AS plan_price, pl.billing_interval AS plan_interval,
          (SELECT COUNT(*) FROM properties p WHERE p.advertiser_id=a.id AND p.status<>'inativo') AS listings,
          (SELECT COUNT(*) FROM leads l INNER JOIN properties p ON p.id=l.property_id WHERE p.advertiser_id=a.id) AS leads
         FROM advertisers a LEFT JOIN plans pl ON pl.id=a.plan_id
         ORDER BY a.created_at DESC`
      ),
      queryOne<{ live: number; mrr: number; past_due: number; revenue_month: number }>(
        `SELECT
          (SELECT COUNT(*) FROM advertisers WHERE active=1 AND subscription_status IN ('active','trialing')
             AND (stripe_subscription_id IS NOT NULL OR current_period_end IS NULL OR current_period_end > NOW())) AS live,
          (SELECT COUNT(*) FROM advertisers WHERE subscription_status IN ('past_due','unpaid')) AS past_due,
          (SELECT COALESCE(SUM(CASE WHEN pl.billing_interval='year' THEN pl.price/12 ELSE pl.price END),0)
             FROM advertisers a INNER JOIN plans pl ON pl.id=a.plan_id
             WHERE a.active=1 AND a.subscription_status='active' AND a.stripe_subscription_id IS NOT NULL) AS mrr,
          (SELECT COALESCE(SUM(amount),0) FROM payments
             WHERE status='paid' AND paid_at >= DATE_FORMAT(NOW(),'%Y-%m-01')) AS revenue_month`
      ),
    ]);
    return NextResponse.json({
      advertisers,
      summary: {
        live: Number(summary?.live ?? 0),
        pastDue: Number(summary?.past_due ?? 0),
        mrr: Number(summary?.mrr ?? 0),
        revenueMonth: Number(summary?.revenue_month ?? 0),
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Erro ao carregar anunciantes" }, { status: 500 });
  }
}
