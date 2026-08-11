"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  property_id: number | null;
  property_title: string | null;
  status: string;
  notes: string | null;
  source: string | null;
  created_at: string;
}

interface ApiResponse {
  data: Lead[];
  total: number;
  page: number;
  pages: number;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  novo:          { label: "Novo",           cls: "bg-blue-100 text-blue-700" },
  em_atendimento:{ label: "Em atendimento", cls: "bg-yellow-100 text-yellow-700" },
  convertido:    { label: "Convertido",     cls: "bg-green-100 text-green-700" },
  arquivado:     { label: "Arquivado",      cls: "bg-neutral-200 text-neutral-500" },
};

const statusFilters = [
  { value: "", label: "Todos" },
  { value: "novo", label: "Novo" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "convertido", label: "Convertido" },
  { value: "arquivado", label: "Arquivado" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [panelNotes, setPanelNotes] = useState("");
  const [panelStatus, setPanelStatus] = useState("");
  const [savingPanel, setSavingPanel] = useState(false);
  const [panelSuccess, setPanelSuccess] = useState(false);

  const statusFilter = searchParams.get("status") ?? "";
  const q            = searchParams.get("q") ?? "";
  const page         = Number(searchParams.get("page") ?? 1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (q) params.set("q", q);
      params.set("page", String(page));
      const res = await fetch(`/api/leads?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function pushParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/admin/leads?${p}`);
  }

  function pushPage(newPage: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(newPage));
    router.push(`/admin/leads?${p}`);
  }

  function openPanel(lead: Lead) {
    setSelectedLead(lead);
    setPanelNotes(lead.notes ?? "");
    setPanelStatus(lead.status);
    setPanelSuccess(false);
  }

  function closePanel() {
    setSelectedLead(null);
  }

  async function savePanel() {
    if (!selectedLead) return;
    setSavingPanel(true);
    setPanelSuccess(false);
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: panelStatus, notes: panelNotes }),
      });
      if (res.ok) {
        setPanelSuccess(true);
        // Update in local list
        setData(prev => prev ? {
          ...prev,
          data: prev.data.map(l => l.id === selectedLead.id
            ? { ...l, status: panelStatus, notes: panelNotes }
            : l
          ),
        } : prev);
        setSelectedLead(prev => prev ? { ...prev, status: panelStatus, notes: panelNotes } : prev);
      }
    } finally {
      setSavingPanel(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
        {data && (
          <span className="bg-neutral-200 text-neutral-700 text-xs font-bold px-2.5 py-1">
            {data.total}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 space-y-3">
        {/* Status tabs */}
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

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            defaultValue={q}
            onKeyDown={e => {
              if (e.key === "Enter") pushParam("q", (e.target as HTMLInputElement).value);
            }}
            onBlur={e => pushParam("q", e.target.value)}
            className="w-full border border-neutral-300 pl-9 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>
      </div>

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
        ) : data?.data.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <p className="text-sm">Nenhum lead encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Telefone</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">E-mail</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Imóvel</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data?.data.map(lead => {
                  const sc = statusConfig[lead.status] ?? { label: lead.status, cls: "bg-neutral-100 text-neutral-600" };
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => openPanel(lead)}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">{lead.name}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {lead.phone ?? <span className="text-neutral-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 max-w-[180px] truncate">
                        {lead.email ?? <span className="text-neutral-300">—</span>}
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <span className="text-neutral-600 truncate block">
                          {lead.property_title ?? (
                            <span className="text-neutral-400 italic">Contato geral</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); openPanel(lead); }}
                          className="text-xs px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Ver
                        </button>
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
          <p className="text-sm text-neutral-500">
            Página {data.page} de {data.pages}
          </p>
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
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closePanel} />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-bold text-neutral-900">Detalhes do lead</h2>
              <button onClick={closePanel} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info grid */}
              <div className="space-y-3">
                <InfoRow label="Nome" value={selectedLead.name} />
                <InfoRow label="Telefone" value={selectedLead.phone ?? "—"} />
                <InfoRow label="E-mail" value={selectedLead.email ?? "—"} />
                <InfoRow label="Imóvel" value={selectedLead.property_title ?? "Contato geral"} />
                <InfoRow label="Origem" value={selectedLead.source ?? "site"} />
                <InfoRow label="Data" value={formatDate(selectedLead.created_at)} />
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Mensagem</p>
                  <p className="text-sm text-neutral-700 bg-neutral-50 border border-neutral-100 p-3 leading-relaxed">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              <div className="border-t border-neutral-200 pt-5 space-y-4">
                {/* Status select */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    Status
                  </label>
                  <select
                    value={panelStatus}
                    onChange={e => setPanelStatus(e.target.value)}
                    className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                  >
                    <option value="novo">Novo</option>
                    <option value="em_atendimento">Em atendimento</option>
                    <option value="convertido">Convertido</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    Anotações internas
                  </label>
                  <textarea
                    rows={5}
                    value={panelNotes}
                    onChange={e => setPanelNotes(e.target.value)}
                    placeholder="Adicione observações sobre este lead..."
                    className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between gap-3">
              {panelSuccess && (
                <span className="text-sm text-green-600 font-medium">Salvo com sucesso!</span>
              )}
              {!panelSuccess && <span />}
              <button
                onClick={savePanel}
                disabled={savingPanel}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {savingPanel && <Loader2 size={14} className="animate-spin" />}
                {savingPanel ? "Salvando..." : "Salvar"}
              </button>
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
      <span className="text-xs text-neutral-500 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-neutral-900 flex-1 break-all">{value}</span>
    </div>
  );
}
