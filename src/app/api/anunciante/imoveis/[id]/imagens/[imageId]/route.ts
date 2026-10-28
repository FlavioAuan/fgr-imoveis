import { NextRequest, NextResponse } from "next/server";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { deletePropertyImage, setPropertyCover } from "@/lib/propertyImages";
import { getOwnedProperty } from "../../../shared";

type RouteContext = { params: Promise<{ id: string; imageId: string }> };

async function resolve(params: RouteContext["params"]) {
  const account = await requireAdvertiser();
  const { id, imageId } = await params;
  const owned = await getOwnedProperty(account.id, Number(id));
  return owned ? { propertyId: owned.id, imageId: Number(imageId) } : null;
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const target = await resolve(params);
    if (!target || !(await deletePropertyImage(target.propertyId, target.imageId))) {
      return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return advertiserError(e, "Erro ao excluir foto");
  }
}

// PATCH — define a foto como capa
export async function PATCH(_req: NextRequest, { params }: RouteContext) {
  try {
    const target = await resolve(params);
    if (!target) return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
    await setPropertyCover(target.propertyId, target.imageId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return advertiserError(e, "Erro ao definir capa");
  }
}
