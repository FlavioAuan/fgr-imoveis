import { NextRequest, NextResponse } from "next/server";
import { query, QueryParam } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const conditions = ["1=1"];
  const params: QueryParam[] = [];

  if (p.get("status")) { conditions.push("status=?"); params.push(p.get("status")); }
  if (p.get("q")) {
    conditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ? OR neighborhood LIKE ?)");
    const q = `%${p.get("q")}%`; params.push(q, q, q, q, q);
  }

  const page = Math.max(1, Number(p.get("page") ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;
  const where = conditions.join(" AND ");

  const [items, countRows] = await Promise.all([
    query(`SELECT * FROM prospects WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query<{ total: number }>(`SELECT COUNT(*) AS total FROM prospects WHERE ${where}`, params),
  ]);

  return NextResponse.json({ data: items, total: countRows[0]?.total ?? 0, page, pages: Math.ceil((countRows[0]?.total ?? 0) / limit) });
}

function text(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim().slice(0, max);
  return s || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = text(body.name, 100);
    if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

    const phone = text(body.phone, 30);
    const email = text(body.email, 150);
    if (!phone && !email) return NextResponse.json({ error: "Informe WhatsApp ou e-mail" }, { status: 400 });

    const price = Number(String(body.expected_price ?? "").replace(/[^\d.]/g, ""));
    const expectedPrice = Number.isFinite(price) && price > 0 ? price : null;

    await query(
      `INSERT INTO prospects (name,email,phone,property_type,city,neighborhood,expected_price,message,source)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        name,
        email,
        phone,
        text(body.property_type, 30),
        text(body.city, 100),
        text(body.neighborhood, 100),
        expectedPrice,
        text(body.message, 2000),
        text(body.source, 50) ?? "site",
      ]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao salvar prospecção" }, { status: 500 });
  }
}
