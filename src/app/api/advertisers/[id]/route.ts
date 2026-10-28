import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

// PUT — ativa ou bloqueia um anunciante (admin). Bloqueado: some do site e não entra no painel.
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const advertiserId = Number((await params).id);
    const old = await queryOne<{ id: number; active: number }>("SELECT id, active FROM advertisers WHERE id=?", [advertiserId]);
    if (!old) return NextResponse.json({ error: "Anunciante não encontrado" }, { status: 404 });

    const { active } = await req.json();
    const value = active ? 1 : 0;
    await query("UPDATE advertisers SET active=? WHERE id=?", [value, advertiserId]);
    await auditLog({
      userId: session.id, action: "UPDATE", entity: "advertisers", entityId: advertiserId,
      oldData: { active: old.active }, newData: { active: value },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar anunciante" }, { status: 500 });
  }
}
