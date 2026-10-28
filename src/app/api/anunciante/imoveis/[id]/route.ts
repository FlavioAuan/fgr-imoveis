import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { deletePropertyImage } from "@/lib/propertyImages";
import { ADVERTISER_FIELDS, checkPlanLimits, getOwnedProperty, parseAdvertiserProperty } from "../shared";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const account = await requireAdvertiser();
    const propertyId = Number((await params).id);
    const prop = await queryOne<Record<string, unknown>>(
      "SELECT * FROM properties WHERE id=? AND advertiser_id=? LIMIT 1",
      [propertyId, account.id]
    );
    if (!prop) return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
    const [images, features] = await Promise.all([
      query("SELECT * FROM property_images WHERE property_id=? ORDER BY display_order ASC", [propertyId]),
      query(
        "SELECT f.* FROM features f INNER JOIN property_features pf ON pf.feature_id=f.id WHERE pf.property_id=?",
        [propertyId]
      ),
    ]);
    return NextResponse.json({ ...prop, images, features });
  } catch (e) {
    return advertiserError(e, "Erro ao carregar anúncio");
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const account = await requireAdvertiser();
    const propertyId = Number((await params).id);
    const previous = await getOwnedProperty(account.id, propertyId);
    if (!previous) return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });

    const body = await req.json();
    const parsed = parseAdvertiserProperty(body);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const data = parsed.data;

    const limitError = await checkPlanLimits(account, data, previous);
    if (limitError) return NextResponse.json({ error: limitError }, { status: 403 });

    await query(
      `UPDATE properties SET ${ADVERTISER_FIELDS.map(f => `${f}=?`).join(",")} WHERE id=? AND advertiser_id=?`,
      [...ADVERTISER_FIELDS.map(f => data[f]), propertyId, account.id]
    );

    if (Array.isArray(body.features)) {
      await query("DELETE FROM property_features WHERE property_id=?", [propertyId]);
      for (const fid of body.features) {
        await query("INSERT IGNORE INTO property_features (property_id,feature_id) VALUES (?,?)", [propertyId, Number(fid)]);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return advertiserError(e, "Erro ao salvar anúncio");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const account = await requireAdvertiser();
    const propertyId = Number((await params).id);
    if (!(await getOwnedProperty(account.id, propertyId))) {
      return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
    }
    const images = await query<{ id: number }>("SELECT id FROM property_images WHERE property_id=?", [propertyId]);
    for (const img of images) await deletePropertyImage(propertyId, img.id);
    await query("DELETE FROM properties WHERE id=? AND advertiser_id=?", [propertyId, account.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return advertiserError(e, "Erro ao excluir anúncio");
  }
}
