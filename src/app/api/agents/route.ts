import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const agents = await query("SELECT * FROM agents WHERE active=1 ORDER BY name ASC");
  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["super_admin", "admin"]);
    const body = await req.json();
    await query(
      "INSERT INTO agents (name,phone,email,creci,bio,active) VALUES (?,?,?,?,?,?)",
      [body.name, body.phone ?? null, body.email ?? null, body.creci ?? null, body.bio ?? null, 1]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
