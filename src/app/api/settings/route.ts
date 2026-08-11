import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const settings = await queryOne("SELECT * FROM site_settings ORDER BY id ASC LIMIT 1");
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    await requireAuth(["super_admin", "admin"]);
    const body = await req.json();
    const existing = await queryOne<{ id: number }>("SELECT id FROM site_settings LIMIT 1");

    if (existing) {
      await query(
        `UPDATE site_settings SET site_name=?,phone=?,whatsapp=?,email=?,instagram=?,
         facebook=?,youtube=?,address=?,city=?,state=?,about_text=?,footer_text=?
         WHERE id=?`,
        [body.site_name, body.phone, body.whatsapp, body.email, body.instagram,
         body.facebook, body.youtube, body.address, body.city, body.state,
         body.about_text, body.footer_text, existing.id]
      );
    } else {
      await query(
        `INSERT INTO site_settings (site_name,phone,whatsapp,email,instagram,facebook,youtube,address,city,state,about_text,footer_text)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [body.site_name, body.phone, body.whatsapp, body.email, body.instagram,
         body.facebook, body.youtube, body.address, body.city, body.state, body.about_text, body.footer_text]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
