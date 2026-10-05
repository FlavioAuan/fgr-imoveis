import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const { id } = await params;
    const agentId = Number(id);
    const body = await req.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const old = await queryOne("SELECT * FROM agents WHERE id=?", [agentId]);
    if (!old) return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });

    await query(
      "UPDATE agents SET name=?, phone=?, email=?, creci=?, bio=?, active=? WHERE id=?",
      [
        String(body.name).trim(),
        body.phone ?? null,
        body.email ?? null,
        body.creci ?? null,
        body.bio ?? null,
        body.active === false || body.active === 0 ? 0 : 1,
        agentId,
      ]
    );
    const updated = await queryOne("SELECT * FROM agents WHERE id=?", [agentId]);
    await auditLog({ userId: session.id, action: "update", entity: "agent", entityId: agentId, oldData: old, newData: updated });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    return NextResponse.json({ error: "Erro ao atualizar corretor" }, { status: 500 });
  }
}
