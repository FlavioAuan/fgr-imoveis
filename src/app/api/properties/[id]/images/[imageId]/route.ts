import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

type Params = { id: string; imageId: string };

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await requireAuth(["super_admin", "admin", "corretor"]);
    const { id, imageId } = await params;

    const image = await queryOne<{ image_path: string }>(
      "SELECT image_path FROM property_images WHERE id=? AND property_id=?",
      [Number(imageId), Number(id)]
    );

    if (!image) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    // Remove from DB
    await query("DELETE FROM property_images WHERE id=?", [Number(imageId)]);

    // Try to remove file from disk
    try {
      const filePath = path.join(process.cwd(), "public", image.image_path);
      await unlink(filePath);
    } catch {
      // File may not exist, continue
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro ao excluir imagem" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await requireAuth(["super_admin", "admin", "corretor"]);
    const { id, imageId } = await params;

    // Unset all covers for this property, then set the target
    await query("UPDATE property_images SET is_cover=0 WHERE property_id=?", [Number(id)]);
    await query("UPDATE property_images SET is_cover=1 WHERE id=? AND property_id=?", [
      Number(imageId),
      Number(id),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Erro ao definir capa" }, { status: 500 });
  }
}
