import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { signToken, JWTPayload } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }

    const user = await queryOne<{
      id: number; name: string; email: string;
      password: string; role: "super_admin"|"admin"|"corretor"; active: number;
    }>(
      "SELECT id,name,email,password,role,active FROM users WHERE email=? LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (!user || !user.active) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    await queryOne("UPDATE users SET last_login=NOW() WHERE id=?", [user.id]);

    const payload: JWTPayload = {
      id: user.id, name: user.name, email: user.email, role: user.role,
    };
    const token = await signToken(payload);

    await auditLog({ userId: user.id, action: "LOGIN", entity: "users", entityId: user.id,
      ip: req.headers.get("x-forwarded-for") ?? undefined });

    const res = NextResponse.json({ ok: true, user: payload });
    res.cookies.set("fgr_token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 60 * 60 * 8, path: "/",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
