import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";

// GET — contatos recebidos nos anúncios do anunciante
export async function GET() {
  try {
    const account = await requireAdvertiser();
    const rows = await query(
      `SELECT l.id, l.name, l.email, l.phone, l.message, l.created_at,
        p.id AS property_id, p.title AS property_title, p.code AS property_code, p.slug AS property_slug
       FROM leads l INNER JOIN properties p ON p.id=l.property_id
       WHERE p.advertiser_id=? ORDER BY l.created_at DESC LIMIT 500`,
      [account.id]
    );
    return NextResponse.json(rows);
  } catch (e) {
    return advertiserError(e, "Erro ao carregar contatos");
  }
}
