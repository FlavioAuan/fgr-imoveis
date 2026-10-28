import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { query, queryOne } from "./db";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_PROPERTY = 30;

/** Salva fotos de um imóvel em public/uploads/properties. Aceita só imagens até 10 MB. */
export async function savePropertyImages(propertyId: number, files: File[]): Promise<{ saved: string[]; error?: string }> {
  const current = await queryOne<{ total: number; max_order: number }>(
    "SELECT COUNT(*) AS total, COALESCE(MAX(display_order),0) AS max_order FROM property_images WHERE property_id=?",
    [propertyId]
  );
  const total = Number(current?.total ?? 0);
  if (total + files.length > MAX_IMAGES_PER_PROPERTY) {
    return { saved: [], error: `Cada imóvel aceita até ${MAX_IMAGES_PER_PROPERTY} fotos` };
  }

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext) || !file.type.startsWith("image/")) {
      return { saved: [], error: "Envie apenas fotos JPG, PNG ou WEBP" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { saved: [], error: "Cada foto pode ter no máximo 10 MB" };
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
  await mkdir(uploadDir, { recursive: true });

  const saved: string[] = [];
  let order = Number(current?.max_order ?? 0);
  for (const file of files) {
    const ext = file.name.split(".").pop()!.toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(path.join(uploadDir, name), Buffer.from(await file.arrayBuffer()));
    const relativePath = `/uploads/properties/${name}`;
    order += 1;
    // A primeira foto do imóvel vira capa
    const isCover = total === 0 && saved.length === 0 ? 1 : 0;
    await query(
      "INSERT INTO property_images (property_id,image_path,display_order,is_cover) VALUES (?,?,?,?)",
      [propertyId, relativePath, order, isCover]
    );
    saved.push(relativePath);
  }
  return { saved };
}

export async function deletePropertyImage(propertyId: number, imageId: number): Promise<boolean> {
  const image = await queryOne<{ image_path: string }>(
    "SELECT image_path FROM property_images WHERE id=? AND property_id=?",
    [imageId, propertyId]
  );
  if (!image) return false;
  await query("DELETE FROM property_images WHERE id=?", [imageId]);
  try {
    await unlink(path.join(process.cwd(), "public", image.image_path));
  } catch {
    // O arquivo pode já não existir
  }
  return true;
}

export async function setPropertyCover(propertyId: number, imageId: number): Promise<void> {
  await query("UPDATE property_images SET is_cover=0 WHERE property_id=?", [propertyId]);
  await query("UPDATE property_images SET is_cover=1 WHERE id=? AND property_id=?", [imageId, propertyId]);
}
