import { NextRequest, NextResponse } from "next/server";
import { insert, query, queryOne } from "@/lib/db";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { slugify } from "@/lib/utils";
import { ADVERTISER_FIELDS, checkPlanLimits, parseAdvertiserProperty } from "./shared";

// GET — anúncios do anunciante logado
export async function GET() {
  try {
    const account = await requireAdvertiser();
    const rows = await query(
      `SELECT p.id, p.code, p.slug, p.title, p.transaction_type, p.property_type, p.status, p.featured,
        p.price, p.city, p.neighborhood, p.created_at,
        (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image,
        (SELECT COUNT(*) FROM leads WHERE property_id=p.id) AS lead_count
       FROM properties p WHERE p.advertiser_id=? ORDER BY p.created_at DESC`,
      [account.id]
    );
    return NextResponse.json(rows);
  } catch (e) {
    return advertiserError(e, "Erro ao carregar anúncios");
  }
}

// POST — novo anúncio, dentro dos limites do plano
export async function POST(req: NextRequest) {
  try {
    const account = await requireAdvertiser();
    const parsed = parseAdvertiserProperty(await req.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const data = parsed.data;

    const limitError = await checkPlanLimits(account, data);
    if (limitError) return NextResponse.json({ error: limitError }, { status: 403 });

    const code = `ANU-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const slug = `${slugify(String(data.title))}-${code.toLowerCase()}`;

    const insertedId = await insert(
      `INSERT INTO properties (code,slug,advertiser_id,${ADVERTISER_FIELDS.join(",")})
       VALUES (?,?,?,${ADVERTISER_FIELDS.map(() => "?").join(",")})`,
      [code, slug, account.id, ...ADVERTISER_FIELDS.map(f => data[f])]
    );

    const created = await queryOne("SELECT id, code, slug FROM properties WHERE id=?", [insertedId]);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return advertiserError(e, "Erro ao criar anúncio");
  }
}
