import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, QueryParam } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { slugify } from "@/lib/utils";

// GET — listagem pública e admin
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const conditions: string[] = ["1=1"];
  const params: QueryParam[] = [];

  const isAdmin = req.headers.get("x-admin") === "1";
  if (!isAdmin) conditions.push("status = 'disponivel'");

  if (p.get("transaction")) { conditions.push("transaction_type=?"); params.push(p.get("transaction")); }
  if (p.get("type")) { conditions.push("property_type=?"); params.push(p.get("type")); }
  if (p.get("city")) { conditions.push("city=?"); params.push(p.get("city")); }
  if (p.get("neighborhood")) { conditions.push("neighborhood LIKE ?"); params.push(`%${p.get("neighborhood")}%`); }
  if (p.get("minPrice")) { conditions.push("price>=?"); params.push(Number(p.get("minPrice"))); }
  if (p.get("maxPrice")) { conditions.push("price<=?"); params.push(Number(p.get("maxPrice"))); }
  if (p.get("bedrooms")) { conditions.push("bedrooms>=?"); params.push(Number(p.get("bedrooms"))); }
  if (p.get("minArea")) { conditions.push("area>=?"); params.push(Number(p.get("minArea"))); }
  if (p.get("maxArea")) { conditions.push("area<=?"); params.push(Number(p.get("maxArea"))); }
  if (p.get("featured")) { conditions.push("featured=1"); }
  if (p.get("status")) { conditions.push("status=?"); params.push(p.get("status")); }
  if (p.get("q")) { conditions.push("(title LIKE ? OR code LIKE ? OR neighborhood LIKE ?)");
    const q = `%${p.get("q")}%`; params.push(q, q, q); }

  const sort = p.get("sort") ?? "newest";
  const orderMap: Record<string, string> = {
    newest: "p.created_at DESC", oldest: "p.created_at ASC",
    price_asc: "p.price ASC", price_desc: "p.price DESC", area_desc: "p.area DESC",
  };
  const order = orderMap[sort] ?? "p.created_at DESC";

  const page = Math.max(1, Number(p.get("page") ?? 1));
  const limit = Math.min(48, Math.max(1, Number(p.get("limit") ?? 12)));
  const offset = (page - 1) * limit;

  const where = conditions.join(" AND ");

  const [items, countRows] = await Promise.all([
    query(
      `SELECT p.*,
        (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image,
        (SELECT COUNT(*) FROM property_images WHERE property_id=p.id) AS image_count,
        a.name AS agent_name
       FROM properties p
       LEFT JOIN agents a ON a.id=p.agent_id
       WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM properties p WHERE ${where}`,
      params
    ),
  ]);

  return NextResponse.json({
    data: items,
    total: countRows[0]?.total ?? 0,
    page,
    limit,
    pages: Math.ceil((countRows[0]?.total ?? 0) / limit),
  });
}

// POST — criar imóvel (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["super_admin", "admin"]);
    const body = await req.json();

    const code = body.code || `FGR-${Date.now().toString().slice(-6)}`;
    const slug = body.slug || slugify(body.title);

    const [result] = await query<{ insertId: number }>(
      `INSERT INTO properties
       (code,slug,title,transaction_type,property_type,status,featured,price,
        condominium_fee,iptu,area,built_area,bedrooms,suites,bathrooms,parking_spaces,
        description,city,state,neighborhood,address,zipcode,latitude,longitude,
        youtube_url,virtual_tour_url,seo_title,seo_description,seo_keywords,agent_id,created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        code, slug, body.title, body.transaction_type ?? "venda",
        body.property_type ?? "apartamento", body.status ?? "disponivel",
        body.featured ? 1 : 0, body.price ?? 0,
        body.condominium_fee ?? null, body.iptu ?? null,
        body.area ?? null, body.built_area ?? null,
        body.bedrooms ?? 0, body.suites ?? 0, body.bathrooms ?? 0, body.parking_spaces ?? 0,
        body.description ?? null, body.city, body.state ?? "SP",
        body.neighborhood ?? null, body.address ?? null, body.zipcode ?? null,
        body.latitude ?? null, body.longitude ?? null,
        body.youtube_url ?? null, body.virtual_tour_url ?? null,
        body.seo_title ?? null, body.seo_description ?? null, body.seo_keywords ?? null,
        body.agent_id ?? null, session.id,
      ]
    ) as unknown as [{ insertId: number }];

    const propertyId = result.insertId;

    // features
    if (Array.isArray(body.features) && body.features.length > 0) {
      for (const fid of body.features) {
        await query("INSERT IGNORE INTO property_features (property_id,feature_id) VALUES (?,?)", [propertyId, fid]);
      }
    }

    await auditLog({ userId: session.id, action: "CREATE", entity: "properties", entityId: propertyId, newData: body });

    const created = await queryOne("SELECT * FROM properties WHERE id=?", [propertyId]);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar imóvel" }, { status: 500 });
  }
}
