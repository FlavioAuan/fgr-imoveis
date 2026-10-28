"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Search, Loader2, Trash2, MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/config";

interface Prospect {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  property_type: string | null;
  city: string | null;
  neighborhood: string | null;
  expected_price: string | number | null;
  message: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface ApiResponse {
  data: Prospect[];
  total: number;
  page: number;
  pages: number;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  novo:       { label: "Novo",               cls: "bg-blue-100 text-blue-700" },
  em_contato: { label: "Em contato",         cls: "bg-yellow-100 text-yellow-700" },
  avaliacao:  { label: "Avaliação agendada", cls: "bg-purple-100 text-purple-700" },
  captado:    { label: "Imóvel captado",     cls: "bg-green-100 text-green-700" },
  arquivado:  { label: "Arquivado",          cls: "bg-neutral-200 text-neutral-500" },
};

const statusFilters = [
  { value: "", label: "Todos" },
  ...Object.entries(statusConfig).map(([value, c]) => ({ value, label: c.label })),
];

const typeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  cobertura: "Cobertura",
  studio: "Studio",
  terreno: "Terreno",
  comercial: "Comercial",
  condominio: "Condomínio",
  outro: "Outro",
};

const sourceLabels: Record<string, string> = {
  home_quero_vender: "Home — Quero vender",
  pagina_venda_seu_imovel: "Página Venda seu imóvel",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPrice(value: Prospect["expected_price"]) {
  const n = Number(value);
  return value != null && n > 0 ? formatCurrency(n) : null;
}

function location(p: Prospect) {
  return [p.neighborhood, p.city].filter(Boolean).join(", ") || null;
}

export default function ProspeccaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [panelNotes, setPanelNotes] = useState("");
  const [panelStatus, setPanelStatus] = useState("");
  const [savingPanel, setSavingPanel] = useState(false);
  const [panelSuccess, setPanelSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [canDelete, setCanDelete] = useState(false);

  const statusFilter = searchParams.get("status") ?? "";
  const q            = searchParams.get("q") ?? "";
  const page         = Number(searchParams.get("page") ?? 1);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(d => setCanDelete(d?.role === "super_admin" || d?.role === "admin"))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (q) params.set("q", q);
      params.set("page", String(page));
      const res = await fetch(`/api/prospects?${params}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function pushParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/admin/prospeccao?${p}`);
  }

  function pushPage(newPage: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(newPage));
    router.push(`/admin/prospeccao?${p}`);
  }

  function openPanel(prospect: Prospect) {
    setSelected(prospect);
    setPanelNotes(prospect.notes ?? "");
    setPanelStatus(prospect.status);
    setPanelSuccess(false);
    setConfirmDeleteId(null);
    setDeleteError("");
  }

  function closePanel() {
    setSelected(null);
    setConfirmDeleteId(null);
  }

  async function savePanel() {
    if (!selected) return;
    setSavingPanel(true);
    setPanelSuccess(false);
    try {
      const res = await fetch(`/api/prospects/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: panelStatus, notes: panelNotes }),
      });
      if (res.ok) {
        setPanelSuccess(true);
        setData(prev => prev ? {
          ...prev,
          data: prev.data.map(p => p.id === selected.id ? { ...p, status: panelStatus, notes: panelNotes } : p),
        } : prev);
        setSelected(prev => prev ? { ...prev, status: panelStatus, notes: panelNotes } : prev);
      }
    } finally {
      setSavingPanel(false);
    }
  }

  async function deleteProspect(id: number) {
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/prospects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setDeleteError(err.error || "Erro ao excluir");
        return;
      }
      setConfirmDeleteId(null);
      if (selected?.id === id) setSelected(null);
      if (data && data.data.length === 1 && page > 1) pushPage(page - 1);
      else fetchData();
    } catch {
      setDeleteError("Erro de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">Prospecção</h1>
          {data && (
            <span className="bg-neutral-200 text-neutral-700 text-xs font-bold px-2.5 py-1">
              {data.total}
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-0.5">
          Proprietários que pediram para vender ou anunciar o imóvel pelo site.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => pushParam("status", f.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, telefone, cidade ou bairro..."
            defaultValue={q}
            onKeyDown={e => {
              if (e.key === "Enter") pushParam("q", (e.target as HTMLInputElement).value);
            }}
            onBlur={e => pushParam("q", e.target.value)}
            className="w-full border border-neutral-300 pl-9 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>
      </div>

      {deleteError && !selected && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{deleteError}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-neutral-200 w-1/4" />
                  <div className="h-3 bg-neutral-100 w-1/3" />
                </div>
                <div className="h-3 bg-neutral-200 w-24" />
                <div className="h-6 bg-neutral-100 w-20" />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <p className="text-sm">Nenhuma prospecção encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Proprietário</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Telefone</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Imóvel</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Localização</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Valor pretendido</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.data.map(p => {
                  const sc = statusConfig[p.status] ?? { label: p.status, cls: "bg-neutral-100 text-neutral-600" };
                  const dash = <span className="text-neutral-300">—</span>;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => openPanel(p)}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{p.phone ?? dash}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {p.property_type ? (typeLabels[p.property_type] ?? p.property_type) : dash}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 max-w-[180px] truncate">{location(p) ?? dash}</td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{formatPrice(p.expected_price) ?? dash}</td>
                      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium whitespace-nowrap ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {confirmDeleteId === p.id && !selected ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-xs text-neutral-600">Excluir?</span>
                            <button
                              onClick={() => deleteProspect(p.id)}
                              disabled={deletingId === p.id}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {deletingId === p.id && <Loader2 size={12} className="animate-spin" />}
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                              Não
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openPanel(p)}
                              className="text-xs px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                              Ver
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => { setDeleteError(""); setConfirmDeleteId(p.id); }}
                                aria-label={`Excluir prospecção de ${p.name}`}
                                title="Excluir"
                                className="inline-flex items-center justify-center px-2 py-1.5 border border-neutral-300 text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">Página {data.page} de {data.pages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pushPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
              Anterior
            </button>
            <button
              onClick={() => pushPage(page + 1)}
              disabled={page >= data.pages}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Side panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={closePanel} />

          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-bold text-neutral-900">Detalhes da prospecção</h2>
              <button onClick={closePanel} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <InfoRow label="Proprietário" value={selected.name} />
                <InfoRow label="Telefone" value={selected.phone ?? "—"} />
                <InfoRow label="E-mail" value={selected.email ?? "—"} />
                <InfoRow
                  label="Imóvel"
                  value={selected.property_type ? (typeLabels[selected.property_type] ?? selected.property_type) : "—"}
                />
                <InfoRow label="Localização" value={location(selected) ?? "—"} />
                <InfoRow label="Valor pretendido" value={formatPrice(selected.expected_price) ?? "—"} />
                <InfoRow label="Origem" value={sourceLabels[selected.source ?? ""] ?? selected.source ?? "site"} />
                <InfoRow label="Data" value={formatDate(selected.created_at)} />
              </div>

              {selected.phone && (
                <a
                  href={getWhatsAppUrl(
                    `Olá, ${selected.name}! Aqui é da FGR Imóveis. Recebemos seu interesse em vender o seu imóvel e gostaríamos de conversar.`,
                    selected.phone
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle size={16} />
                  Chamar no WhatsApp
                </a>
              )}

              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Mensagem</p>
                  <p className="text-sm text-neutral-700 bg-neutral-50 border border-neutral-100 p-3 leading-relaxed whitespace-pre-line">
                    {selected.message}
                  </p>
                </div>
              )}

              <div className="border-t border-neutral-200 pt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    Status
                  </label>
                  <select
                    value={panelStatus}
                    onChange={e => setPanelStatus(e.target.value)}
                    className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                  >
                    {Object.entries(statusConfig).map(([value, c]) => (
                      <option key={value} value={value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    Anotações internas
                  </label>
                  <textarea
                    rows={5}
                    value={panelNotes}
                    onChange={e => setPanelNotes(e.target.value)}
                    placeholder="Ex.: visita de avaliação marcada para sexta, 10h..."
                    className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 space-y-3">
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{deleteError}</div>
              )}
              {confirmDeleteId === selected.id ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-700">Excluir definitivamente?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-4 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => deleteProspect(selected.id)}
                      disabled={deletingId === selected.id}
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deletingId === selected.id && <Loader2 size={14} className="animate-spin" />}
                      Excluir
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  {canDelete ? (
                    <button
                      onClick={() => { setDeleteError(""); setConfirmDeleteId(selected.id); }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={15} />
                      Excluir
                    </button>
                  ) : <span />}
                  {panelSuccess && (
                    <span className="text-sm text-green-600 font-medium">Salvo com sucesso!</span>
                  )}
                  <button
                    onClick={savePanel}
                    disabled={savingPanel}
                    className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    {savingPanel && <Loader2 size={14} className="animate-spin" />}
                    {savingPanel ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-neutral-500 w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-neutral-900 flex-1 break-all">{value}</span>
    </div>
  );
}
