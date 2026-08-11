import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

async function getProperty(id: number) {
  const prop = await queryOne<Record<string, unknown>>(
    `SELECT p.*,
      a.name AS agent_name, a.phone AS agent_phone, a.email AS agent_email, a.creci AS agent_creci, a.photo AS agent_photo
     FROM properties p LEFT JOIN agents a ON a.id=p.agent_id
     WHERE p.id=? LIMIT 1`,
    [id]
  );
  if (!prop) return null;
  const images = await query("SELECT * FROM property_images WHERE property_id=? ORDER BY display_order ASC", [id]);
  const features = await query(
    "SELECT f.* FROM features f INNER JOIN property_features pf ON pf.feature_id=f.id WHERE pf.property_id=?",
    [id]
  );
  return { ...prop, images, features };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const prop = await getProperty(Number(id));
  if (!prop) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(prop);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const { id } = await params;
    const body = await req.json();
    const old = await queryOne("SELECT * FROM properties WHERE id=?", [Number(id)]);
    if (!old) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    await query(
      `UPDATE properties SET
        title=?,transaction_type=?,property_type=?,status=?,featured=?,price=?,
        condominium_fee=?,iptu=?,area=?,built_area=?,bedrooms=?,suites=?,bathrooms=?,parking_spaces=?,
        description=?,city=?,state=?,neighborhood=?,address=?,zipcode=?,latitude=?,longitude=?,
        youtube_url=?,virtual_tour_url=?,seo_title=?,seo_description=?,seo_keywords=?,agent_id=?
       WHERE id=?`,
      [
        body.title, body.transaction_type, body.property_type, body.status, body.featured ? 1 : 0,
        body.price, body.condominium_fee ?? null, body.iptu ?? null,
        body.area ?? null, body.built_area ?? null,
        body.bedrooms ?? 0, body.suites ?? 0, body.bathrooms ?? 0, body.parking_spaces ?? 0,
        body.description ?? null, body.city, body.state ?? "SP",
        body.neighborhood ?? null, body.address ?? null, body.zipcode ?? null,
        body.latitude ?? null, body.longitude ?? null,
        body.youtube_url ?? null, body.virtual_tour_url ?? null,
        body.seo_title ?? null, body.seo_description ?? null, body.seo_keywords ?? null,
        body.agent_id ?? null, Number(id),
      ]
    );

    if (Array.isArray(body.features)) {
      await query("DELETE FROM property_features WHERE property_id=?", [Number(id)]);
      for (const fid of body.features) {
        await query("INSERT IGNORE INTO property_features (property_id,feature_id) VALUES (?,?)", [Number(id), Number(fid)]);
      }
    }

    await auditLog({ userId: session.id, action: "UPDATE", entity: "properties", entityId: Number(id), oldData: old, newData: body });
    const updated = await getProperty(Number(id));
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const { id } = await params;
    const old = await queryOne("SELECT * FROM properties WHERE id=?", [Number(id)]);
    if (!old) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    await query("DELETE FROM properties WHERE id=?", [Number(id)]);
    await auditLog({ userId: session.id, action: "DELETE", entity: "properties", entityId: Number(id), oldData: old });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
