import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

const ROLES = ["super_admin", "admin", "corretor"];

type UserRow = { id: number; name: string; email: string; role: string; active: number };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin"]);
    const { id } = await params;
    const userId = Number(id);
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = String(body.role ?? "");
    const active = body.active === false || body.active === 0 ? 0 : 1;
    const password = body.password ? String(body.password) : "";

    if (!name || !email) return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 400 });
    if (!ROLES.includes(role)) return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
    if (password && password.length < 6) return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 });

    const old = await queryOne<UserRow>("SELECT id,name,email,role,active FROM users WHERE id=?", [userId]);
    if (!old) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Evita que o usuário logado se bloqueie
    if (userId === session.id && (!active || role !== "super_admin")) {
      return NextResponse.json({ error: "Você não pode desativar nem rebaixar o seu próprio usuário" }, { status: 400 });
    }

    // Garante que sempre reste pelo menos um super admin ativo
    if (old.role === "super_admin" && Number(old.active) === 1 && (role !== "super_admin" || !active)) {
      const others = await queryOne<{ total: number }>(
        "SELECT COUNT(*) AS total FROM users WHERE role='super_admin' AND active=1 AND id<>?",
        [userId]
      );
      if (!others || Number(others.total) === 0) {
        return NextResponse.json({ error: "É preciso manter pelo menos um Super Admin ativo" }, { status: 400 });
      }
    }

    const fields = ["name=?", "email=?", "role=?", "active=?"];
    const values: (string | number)[] = [name, email, role, active];
    if (password) {
      fields.push("password=?");
      values.push(await bcrypt.hash(password, 10));
    }
    values.push(userId);

    try {
      await query(`UPDATE users SET ${fields.join(",")} WHERE id=?`, values);
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Já existe um usuário com este e-mail" }, { status: 409 });
      }
      throw err;
    }

    const updated = await queryOne<UserRow>("SELECT id,name,email,role,active,last_login,created_at FROM users WHERE id=?", [userId]);
    await auditLog({
      userId: session.id,
      action: "update",
      entity: "user",
      entityId: userId,
      oldData: old,
      newData: { ...updated, passwordChanged: Boolean(password) },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Apenas Super Admin pode editar usuários" }, { status: 403 });
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}
