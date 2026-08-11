import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { query } from "@/lib/db";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["super_admin", "admin", "corretor"]);

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const propertyId = formData.get("property_id");
    const isCover = formData.get("is_cover") === "1";

    if (!files.length) return NextResponse.json({ error: "Nenhum arquivo" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    await mkdir(uploadDir, { recursive: true });

    const saved: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const dest = path.join(uploadDir, name);

      // Compress + convert to WebP
      await sharp(buffer)
        .resize(1280, 960, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(dest);

      const relativePath = `/uploads/properties/${name}`;
      saved.push(relativePath);

      if (propertyId) {
        // Get current max order
        const rows = await query<{ max_order: number }>(
          "SELECT COALESCE(MAX(display_order),0) AS max_order FROM property_images WHERE property_id=?",
          [Number(propertyId)]
        );
        const nextOrder = (rows[0]?.max_order ?? 0) + 1;

        if (isCover) {
          await query("UPDATE property_images SET is_cover=0 WHERE property_id=?", [Number(propertyId)]);
        }

        await query(
          "INSERT INTO property_images (property_id,image_path,display_order,is_cover) VALUES (?,?,?,?)",
          [Number(propertyId), relativePath, nextOrder, isCover ? 1 : 0]
        );
      }
    }

    return NextResponse.json({ ok: true, paths: saved });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
