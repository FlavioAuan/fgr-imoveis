import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth(["super_admin", "admin", "corretor"]);
    const { id } = await params;
    const body = await req.json();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.status !== undefined) { fields.push("status=?"); values.push(body.status); }
    if (body.notes !== undefined) { fields.push("notes=?"); values.push(body.notes); }
    if (!fields.length) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

    values.push(Number(id));
    await query(`UPDATE leads SET ${fields.join(",")} WHERE id=?`, values);
    const updated = await queryOne("SELECT * FROM leads WHERE id=?", [Number(id)]);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const { id } = await params;
    const leadId = Number(id);
    const lead = await queryOne("SELECT * FROM leads WHERE id=?", [leadId]);
    if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

    await query("DELETE FROM leads WHERE id=?", [leadId]);
    await auditLog({ userId: session.id, action: "delete", entity: "lead", entityId: leadId, oldData: lead });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão para excluir leads" }, { status: 403 });
    return NextResponse.json({ error: "Erro ao excluir lead" }, { status: 500 });
  }
}
