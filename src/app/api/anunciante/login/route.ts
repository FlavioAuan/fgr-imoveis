import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { setAdvertiserCookie, signAdvertiserToken } from "@/lib/advertiserAuth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }

    const account = await queryOne<{ id: number; name: string; email: string; password: string; active: number }>(
      "SELECT id,name,email,password,active FROM advertisers WHERE email=? LIMIT 1",
      [String(email).toLowerCase().trim()]
    );

    if (!account || !(await bcrypt.compare(String(password), account.password))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 });
    }
    if (!Number(account.active)) {
      return NextResponse.json({ error: "Conta desativada. Fale com a FGR Imóveis." }, { status: 403 });
    }

    await query("UPDATE advertisers SET last_login=NOW() WHERE id=?", [account.id]);

    const res = NextResponse.json({ ok: true });
    setAdvertiserCookie(res, await signAdvertiserToken({ id: account.id, name: account.name, email: account.email }));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
