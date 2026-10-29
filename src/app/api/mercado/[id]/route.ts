import { NextRequest, NextResponse } from "next/server";
import { query, QueryParam } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { MARKET_STATUSES } from "@/lib/market";
import { STAFF, cleanText, errorResponse, getListing, mapContact } from "../shared";

type RouteContext = { params: Promise<{ id: string }> };

// Anúncio com o histórico de contatos
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth(STAFF);
    const id = Number((await params).id);
    const listing = await getListing(id);
    if (!listing) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    const contacts = await query<Record<string, unknown>>(
      `SELECT c.*, u.name AS user_name FROM market_contacts c
       LEFT JOIN users u ON u.id=c.user_id
       WHERE c.listing_id=? ORDER BY c.created_at DESC, c.id DESC`,
      [id]
    );
    return NextResponse.json({ listing, contacts: contacts.map(mapContact) });
  } catch (e) {
    return errorResponse(e);
  }
}

// Status, dados do proprietário, anotações e próximo retorno
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth(STAFF);
    const id = Number((await params).id);
    const body = await req.json();
    const fields: string[] = [];
    const values: QueryParam[] = [];

    if (body.status !== undefined) {
      if (!MARKET_STATUSES.some(s => s.value === body.status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      fields.push("status=?"); values.push(body.status);
    }
    const texts: [string, string, number][] = [
      ["ownerName", "owner_name", 100], ["ownerPhone", "owner_phone", 30], ["ownerEmail", "owner_email", 150], ["notes", "notes", 5000],
    ];
    for (const [key, col, max] of texts) {
      if (body[key] !== undefined) { fields.push(`${col}=?`); values.push(cleanText(body[key], max)); }
    }
    if (body.nextFollowup !== undefined) {
      const d = body.nextFollowup ? String(body.nextFollowup) : null;
      if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return NextResponse.json({ error: "Data inválida" }, { status: 400 });
      fields.push("next_followup_at=?"); values.push(d);
    }
    if (!fields.length) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

    values.push(id);
    await query(`UPDATE market_listings SET ${fields.join(",")} WHERE id=?`, values);
    const listing = await getListing(id);
    if (!listing) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    return NextResponse.json({ listing });
  } catch (e) {
    return errorResponse(e, "Erro ao salvar");
  }
}
