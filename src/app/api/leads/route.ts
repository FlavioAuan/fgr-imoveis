import { NextRequest, NextResponse } from "next/server";
import { query, QueryParam } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const conditions = ["1=1"];
  const params: QueryParam[] = [];

  if (p.get("status")) { conditions.push("l.status=?"); params.push(p.get("status")); }
  if (p.get("property_id")) { conditions.push("l.property_id=?"); params.push(p.get("property_id")); }
  if (p.get("q")) { conditions.push("(l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)");
    const q = `%${p.get("q")}%`; params.push(q, q, q); }

  const page = Math.max(1, Number(p.get("page") ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;
  const where = conditions.join(" AND ");

  const [items, countRows] = await Promise.all([
    query(
      `SELECT l.*, p.title AS property_title FROM leads l
       LEFT JOIN properties p ON p.id=l.property_id
       WHERE ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query<{ total: number }>(`SELECT COUNT(*) AS total FROM leads l WHERE ${where}`, params),
  ]);

  return NextResponse.json({ data: items, total: countRows[0]?.total ?? 0, page, pages: Math.ceil((countRows[0]?.total ?? 0) / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

    // Basic sanitization
    const name = String(body.name).slice(0, 100);
    const email = body.email ? String(body.email).slice(0, 150) : null;
    const phone = body.phone ? String(body.phone).slice(0, 30) : null;
    const message = body.message ? String(body.message).slice(0, 2000) : null;
    const propertyId = body.property_id ? Number(body.property_id) : null;
    const source = body.source ? String(body.source).slice(0, 50) : "site";

    await query(
      "INSERT INTO leads (name,email,phone,message,property_id,source) VALUES (?,?,?,?,?,?)",
      [name, email, phone, message, propertyId, source]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
  }
}
