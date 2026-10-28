import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { mapPlan, PlanRow } from "@/lib/plans";
import { archivePlanInStripe, ensurePlanPrice, isStripeConfigured } from "@/lib/stripe";
import { parsePlanBody, planError } from "../shared";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const planId = Number((await params).id);
    const old = await queryOne<PlanRow>("SELECT * FROM plans WHERE id=?", [planId]);
    if (!old) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

    const parsed = parsePlanBody(await req.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const p = parsed.data;

    try {
      await query(
        `UPDATE plans SET name=?,slug=?,audience=?,description=?,price=?,billing_interval=?,duration_days=?,
          trial_days=?,max_listings=?,max_featured=?,features=?,highlighted=?,active=?,display_order=?
         WHERE id=?`,
        [p.name, p.slug, p.audience, p.description, p.price, p.billing_interval, p.duration_days,
          p.trial_days, p.max_listings,
          p.max_featured, p.features, p.highlighted, p.active, p.display_order, planId]
      );
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Já existe um plano com este nome" }, { status: 409 });
      }
      throw err;
    }

    let stripeWarning: string | null = null;
    const updated = await queryOne<PlanRow>("SELECT * FROM plans WHERE id=?", [planId]);
    if (updated && isStripeConfigured()) {
      try {
        if (!updated.active) await archivePlanInStripe(updated);
        else if (Number(updated.price) > 0) await ensurePlanPrice(updated);
      } catch (err) {
        console.error(err);
        stripeWarning = "Plano salvo, mas não foi possível sincronizar com o Stripe.";
      }
    }

    const priceChanged =
      Number(old.price) !== p.price || old.billing_interval !== p.billing_interval;

    await auditLog({ userId: session.id, action: "UPDATE", entity: "plans", entityId: planId, oldData: old, newData: p });
    const fresh = await queryOne<PlanRow>("SELECT * FROM plans WHERE id=?", [planId]);
    return NextResponse.json({
      plan: fresh ? mapPlan(fresh) : null,
      stripeWarning,
      // Assinaturas existentes continuam no preço antigo até o anunciante trocar de plano
      notice: priceChanged && old.billing_interval !== "once"
        ? "O novo preço vale para novas assinaturas. Quem já assina continua no valor anterior."
        : null,
    });
  } catch (e: unknown) {
    return planError(e, "Erro ao atualizar plano");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const planId = Number((await params).id);
    const old = await queryOne<PlanRow>("SELECT * FROM plans WHERE id=?", [planId]);
    if (!old) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

    const usage = await queryOne<{ total: number }>(
      "SELECT COUNT(*) AS total FROM advertisers WHERE plan_id=?",
      [planId]
    );

    if (isStripeConfigured()) {
      try { await archivePlanInStripe(old); } catch (err) { console.error(err); }
    }

    // Plano já usado por anunciantes: só desativa, para manter o histórico
    if (Number(usage?.total) > 0) {
      await query("UPDATE plans SET active=0 WHERE id=?", [planId]);
      await auditLog({ userId: session.id, action: "DEACTIVATE", entity: "plans", entityId: planId, oldData: old });
      return NextResponse.json({ ok: true, deactivated: true });
    }

    await query("DELETE FROM plans WHERE id=?", [planId]);
    await auditLog({ userId: session.id, action: "DELETE", entity: "plans", entityId: planId, oldData: old });
    return NextResponse.json({ ok: true, deactivated: false });
  } catch (e: unknown) {
    return planError(e, "Erro ao excluir plano");
  }
}
