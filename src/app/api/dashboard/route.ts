import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const [stats, leadsByMonth, propertiesByType, recentLeads, recentProperties] =
      await Promise.all([
        queryOne<Record<string, number>>(
          `SELECT
            COUNT(*) AS total_properties,
            SUM(transaction_type='venda') AS for_sale,
            SUM(transaction_type='aluguel') AS for_rent,
            SUM(featured=1) AS featured_properties,
            (SELECT COUNT(*) FROM leads) AS total_leads,
            (SELECT COUNT(*) FROM leads WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())) AS leads_this_month
           FROM properties WHERE status != 'inativo'`
        ),
        query<{ month: string; total: number }>(
          `SELECT DATE_FORMAT(created_at,'%Y-%m') AS month, COUNT(*) AS total
           FROM leads WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
           GROUP BY month ORDER BY month ASC`
        ),
        query<{ type: string; total: number }>(
          `SELECT property_type AS type, COUNT(*) AS total
           FROM properties WHERE status != 'inativo'
           GROUP BY property_type ORDER BY total DESC`
        ),
        query(
          `SELECT l.*, p.title AS property_title FROM leads l
           LEFT JOIN properties p ON p.id=l.property_id
           ORDER BY l.created_at DESC LIMIT 5`
        ),
        query(
          `SELECT p.id,p.code,p.title,p.price,p.transaction_type,p.status,p.created_at,
            (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image
           FROM properties p ORDER BY p.created_at DESC LIMIT 5`
        ),
      ]);

    return NextResponse.json({ stats, leadsByMonth, propertiesByType, recentLeads, recentProperties });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
