import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { errorResponse, getListing } from "../../shared";

type RouteContext = { params: Promise<{ contactId: string }> };

// Remove um contato registrado por engano e recalcula o resumo do imóvel
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const contactId = Number((await params).contactId);
    const contact = await queryOne<{ listing_id: number }>("SELECT * FROM market_contacts WHERE id=?", [contactId]);
    if (!contact) return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 });

    await query("DELETE FROM market_contacts WHERE id=?", [contactId]);
    await query(
      `UPDATE market_listings SET
         contacts_count=(SELECT COUNT(*) FROM market_contacts WHERE listing_id=?),
         last_contact_at=(SELECT MAX(created_at) FROM market_contacts WHERE listing_id=?)
       WHERE id=?`,
      [contact.listing_id, contact.listing_id, contact.listing_id]
    );
    await auditLog({ userId: session.id, action: "delete", entity: "market_contact", entityId: contactId, oldData: contact });
    return NextResponse.json({ listing: await getListing(contact.listing_id) });
  } catch (e) {
    return errorResponse(e, "Erro ao excluir o contato");
  }
}
