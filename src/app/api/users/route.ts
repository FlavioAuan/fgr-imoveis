import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireAuth(["super_admin", "admin"]);
    const users = await query("SELECT id,name,email,role,active,last_login,created_at FROM users ORDER BY created_at DESC");
    return NextResponse.json(users);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["super_admin"]);
    const body = await req.json();
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }
    const hash = await bcrypt.hash(body.password, 10);
    await query(
      "INSERT INTO users (name,email,password,role,active) VALUES (?,?,?,?,?)",
      [body.name, body.email.toLowerCase(), hash, body.role ?? "corretor", 1]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
