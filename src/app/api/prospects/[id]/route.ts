import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

const STATUSES = ["novo", "em_contato", "avaliacao", "captado", "arquivado"];

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth(["super_admin", "admin", "corretor"]);
    const { id } = await params;
    const body = await req.json();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      fields.push("status=?"); values.push(body.status);
    }
    if (body.notes !== undefined) { fields.push("notes=?"); values.push(body.notes); }
    if (!fields.length) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

    values.push(Number(id));
    await query(`UPDATE prospects SET ${fields.join(",")} WHERE id=?`, values);
    const updated = await queryOne("SELECT * FROM prospects WHERE id=?", [Number(id)]);
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
    const prospectId = Number(id);
    const prospect = await queryOne("SELECT * FROM prospects WHERE id=?", [prospectId]);
    if (!prospect) return NextResponse.json({ error: "Prospecção não encontrada" }, { status: 404 });

    await query("DELETE FROM prospects WHERE id=?", [prospectId]);
    await auditLog({ userId: session.id, action: "delete", entity: "prospect", entityId: prospectId, oldData: prospect });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão para excluir" }, { status: 403 });
    return NextResponse.json({ error: "Erro ao excluir prospecção" }, { status: 500 });
  }
}
