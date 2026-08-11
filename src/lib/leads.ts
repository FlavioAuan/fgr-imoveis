interface LeadData {
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  property_id?: number;
  source: string;
}

export async function saveLead(data: LeadData): Promise<void> {
  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // Silently fail — não bloqueia o fluxo do usuário
  }
}
