export interface ProspectData {
  name: string;
  phone?: string;
  email?: string;
  property_type?: string;
  city?: string;
  neighborhood?: string;
  expected_price?: string;
  message?: string;
  source: string;
}

/** Salva um proprietário interessado em vender. Retorna false se não foi possível salvar. */
export async function saveProspect(data: ProspectData): Promise<boolean> {
  try {
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}
