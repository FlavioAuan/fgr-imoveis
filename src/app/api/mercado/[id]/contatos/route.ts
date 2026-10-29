import { NextRequest, NextResponse } from "next/server";
import { insert, query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { CONTACT_CHANNELS, CONTACT_OUTCOMES, CONTACT_TARGETS } from "@/lib/market";
import { STAFF, cleanText, errorResponse, getListing, mapContact } from "../../shared";

type RouteContext = { params: Promise<{ id: string }> };

// Registra um contato feito com a imobiliária ou o proprietário
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(STAFF);
    const id = Number((await params).id);
    const body = await req.json();

    if (!CONTACT_TARGETS.some(t => t.value === body.target)) return NextResponse.json({ error: "Informe com quem foi o contato" }, { status: 400 });
    if (!CONTACT_CHANNELS.some(c => c.value === body.channel)) return NextResponse.json({ error: "Informe o canal" }, { status: 400 });
    if (!CONTACT_OUTCOMES.some(o => o.value === body.outcome)) return NextResponse.json({ error: "Informe o resultado" }, { status: 400 });
    const followup = body.nextFollowup ? String(body.nextFollowup) : null;
    if (followup && !/^\d{4}-\d{2}-\d{2}$/.test(followup)) return NextResponse.json({ error: "Data inválida" }, { status: 400 });

    const current = await queryOne<{ status: string }>("SELECT status FROM market_listings WHERE id=?", [id]);
    if (!current) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

    const contactId = await insert(
      "INSERT INTO market_contacts (listing_id,target,channel,outcome,notes,user_id) VALUES (?,?,?,?,?,?)",
      [id, body.target, body.channel, body.outcome, cleanText(body.notes, 2000), session.id]
    );

    // O resultado do contato avança o status, sem desfazer uma captação
    let status = current.status;
    if (body.outcome === "captado") status = "captado";
    else if (status !== "captado") {
      if (body.outcome === "interessado") status = "negociando";
      else if (status === "novo") status = "em_contato";
    }
    const closed = body.outcome === "captado" || body.outcome === "sem_interesse";
    await query(
      `UPDATE market_listings SET status=?, contacts_count=contacts_count+1, last_contact_at=NOW(),
       next_followup_at=${followup ? "?" : closed ? "NULL" : "next_followup_at"} WHERE id=?`,
      followup ? [status, followup, id] : [status, id]
    );

    const row = await queryOne<Record<string, unknown>>(
      "SELECT c.*, u.name AS user_name FROM market_contacts c LEFT JOIN users u ON u.id=c.user_id WHERE c.id=?",
      [contactId]
    );
    return NextResponse.json({ contact: row ? mapContact(row) : null, listing: await getListing(id) }, { status: 201 });
  } catch (e) {
    return errorResponse(e, "Erro ao registrar o contato");
  }
}
