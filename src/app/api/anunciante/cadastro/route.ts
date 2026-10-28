import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { insert, query } from "@/lib/db";
import { ADVERTISER_KINDS, AdvertiserKind, setAdvertiserCookie, signAdvertiserToken } from "@/lib/advertiserAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const kind = (ADVERTISER_KINDS as readonly string[]).includes(body.kind) ? (body.kind as AdvertiserKind) : "imobiliaria";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Preencha nome, e-mail e senha" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 });
    }
    if (kind === "proprietario" && !String(body.phone ?? "").replace(/\D/g, "")) {
      return NextResponse.json({ error: "Informe seu WhatsApp: é por ele que os interessados vão falar com você" }, { status: 400 });
    }
    if (!body.acceptTerms) {
      return NextResponse.json({ error: "É preciso aceitar os termos de uso" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    let insertId: number;
    try {
      const insertedId = await insert(
        `INSERT INTO advertisers (name,company_name,kind,document,creci,phone,email,password)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          name,
          String(body.company_name ?? "").trim() || null,
          kind,
          String(body.document ?? "").replace(/\D/g, "") || null,
          String(body.creci ?? "").trim() || null,
          String(body.phone ?? "").trim() || null,
          email,
          hash,
        ]
      );
      insertId = insertedId;
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Já existe uma conta com este e-mail" }, { status: 409 });
      }
      throw err;
    }

    const res = NextResponse.json({ ok: true }, { status: 201 });
    setAdvertiserCookie(res, await signAdvertiserToken({ id: insertId, name, email }));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
