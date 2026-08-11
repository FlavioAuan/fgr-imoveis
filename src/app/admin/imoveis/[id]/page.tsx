"use client";

import { useParams } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";

export default function EditarImovelPage() {
  const { id } = useParams<{ id: string }>();
  return <PropertyForm id={id} />;
}
