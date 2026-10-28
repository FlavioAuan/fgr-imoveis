import { NextRequest, NextResponse } from "next/server";
import { insert, query, queryOne } from "@/lib/db";
import { getSession, requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { listActivePlans, mapPlan, PlanRow } from "@/lib/plans";
import { ensurePlanPrice, isStripeConfigured } from "@/lib/stripe";
import { parsePlanBody, planError } from "./shared";

// GET — planos ativos (público) ou todos com ?all=1 (admin)
export async function GET(req: NextRequest) {
  const wantsAll = req.nextUrl.searchParams.get("all") === "1";
  const session = wantsAll ? await getSession() : null;

  if (wantsAll && session && session.role !== "corretor") {
    const rows = await query<PlanRow & { subscribers: number }>(
      `SELECT pl.*,
        (SELECT COUNT(*) FROM advertisers a WHERE a.plan_id=pl.id AND a.subscription_status IN ('active','trialing','past_due')) AS subscribers
       FROM plans pl ORDER BY pl.display_order ASC, pl.price ASC`
    );
    return NextResponse.json({ plans: rows.map(mapPlan), stripeConfigured: isStripeConfigured() });
  }

  return NextResponse.json({ plans: await listActivePlans(), stripeConfigured: isStripeConfigured() });
}

// POST — criar plano (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const parsed = parsePlanBody(await req.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const p = parsed.data;

    let insertedId: number;
    try {
      insertedId = await insert(
        `INSERT INTO plans (name,slug,description,price,billing_interval,trial_days,max_listings,
          max_featured,features,highlighted,active,display_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [p.name, p.slug || slugify(p.name), p.description, p.price, p.billing_interval, p.trial_days,
          p.max_listings, p.max_featured, p.features, p.highlighted, p.active, p.display_order]
      );
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Já existe um plano com este nome" }, { status: 409 });
      }
      throw err;
    }

    let stripeWarning: string | null = null;
    const created = await queryOne<PlanRow>("SELECT * FROM plans WHERE id=?", [insertedId]);
    if (created && isStripeConfigured() && created.active && Number(created.price) > 0) {
      try {
        await ensurePlanPrice(created);
      } catch (err) {
        console.error(err);
        stripeWarning = "Plano salvo, mas não foi possível sincronizar com o Stripe. Ele será sincronizado na primeira assinatura.";
      }
    }

    await auditLog({ userId: session.id, action: "CREATE", entity: "plans", entityId: insertedId, newData: p });
    const fresh = await queryOne<PlanRow>("SELECT * FROM plans WHERE id=?", [insertedId]);
    return NextResponse.json({ plan: fresh ? mapPlan(fresh) : null, stripeWarning }, { status: 201 });
  } catch (e: unknown) {
    return planError(e, "Erro ao criar plano");
  }
}
