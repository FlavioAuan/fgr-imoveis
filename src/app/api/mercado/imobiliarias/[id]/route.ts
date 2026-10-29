import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, QueryParam } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { STAFF, cleanText, errorResponse, mapAgency } from "../../shared";

type RouteContext = { params: Promise<{ id: string }> };

// Dados de contato da imobiliária
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth(STAFF);
    const id = Number((await params).id);
    const body = await req.json();
    const fields: string[] = [];
    const values: QueryParam[] = [];
    const texts: [string, string, number][] = [
      ["website", "website", 255], ["phone", "phone", 30], ["whatsapp", "whatsapp", 30],
      ["email", "email", 150], ["contactName", "contact_name", 100], ["notes", "notes", 5000],
    ];
    for (const [key, col, max] of texts) {
      if (body[key] !== undefined) { fields.push(`${col}=?`); values.push(cleanText(body[key], max)); }
    }
    if (!fields.length) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

    values.push(id);
    await query(`UPDATE market_agencies SET ${fields.join(",")} WHERE id=?`, values);
    const row = await queryOne<Record<string, unknown>>("SELECT * FROM market_agencies WHERE id=?", [id]);
    if (!row) return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
    return NextResponse.json({ agency: mapAgency(row) });
  } catch (e) {
    return errorResponse(e, "Erro ao salvar a imobiliária");
  }
}
