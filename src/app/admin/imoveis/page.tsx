"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, Star, Pencil, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Property {
  id: number;
  code: string;
  title: string;
  city: string;
  neighborhood: string | null;
  price: number;
  transaction_type: string;
  status: string;
  featured: number;
  cover_image: string | null;
}

interface ApiResponse {
  data: Property[];
  total: number;
  page: number;
  pages: number;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-green-100 text-green-700" },
  vendido:    { label: "Vendido",    cls: "bg-neutral-200 text-neutral-600" },
  alugado:    { label: "Alugado",   cls: "bg-blue-100 text-blue-700" },
  reservado:  { label: "Reservado", cls: "bg-yellow-100 text-yellow-700" },
  inativo:    { label: "Inativo",   cls: "bg-red-100 text-red-600" },
};

const typeLabels: Record<string, string> = {
  venda: "Venda", aluguel: "Aluguel",
};

export default function ImoveisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const q      = searchParams.get("q") ?? "";
  const tipo   = searchParams.get("tipo") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort   = searchParams.get("sort") ?? "newest";
  const page   = Number(searchParams.get("page") ?? 1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)      params.set("q", q);
      if (tipo)   params.set("transaction", tipo);
      if (status) params.set("status", status);
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "15");

      const res = await fetch(`/api/properties?${params}`, {
        headers: { "x-admin": "1" },
      });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [q, tipo, status, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function pushParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/admin/imoveis?${p}`);
  }

  function pushPage(newPage: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(newPage));
    router.push(`/admin/imoveis?${p}`);
  }

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Excluir o imóvel "${title}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/properties/${id}`, { method: "DELETE" });
      fetchData();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleFeatured(property: Property) {
    setTogglingId(property.id);
    try {
      await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...property, featured: property.featured ? 0 : 1 }),
      });
      fetchData();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Imóveis</h1>
          {data && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {data.total} imóvel{data.total !== 1 ? "s" : ""} encontrado{data.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          <Plus size={16} />
          Novo imóvel
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por título, código, bairro..."
            defaultValue={q}
            onKeyDown={e => {
              if (e.key === "Enter") pushParam("q", (e.target as HTMLInputElement).value);
            }}
            onBlur={e => pushParam("q", e.target.value)}
            className="w-full border border-neutral-300 pl-9 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          <select
            value={tipo}
            onChange={e => pushParam("tipo", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
          >
            <option value="">Todos os tipos</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>

          <select
            value={status}
            onChange={e => pushParam("status", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
          >
            <option value="">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="vendido">Vendido</option>
            <option value="alugado">Alugado</option>
            <option value="reservado">Reservado</option>
            <option value="inativo">Inativo</option>
          </select>

          <select
            value={sort}
            onChange={e => pushParam("sort", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
          >
            <option value="newest">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="area_desc">Maior área</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="w-12 h-12 bg-neutral-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-neutral-200 w-2/3" />
                  <div className="h-3 bg-neutral-100 w-1/3" />
                </div>
                <div className="h-3 bg-neutral-200 w-20" />
                <div className="h-6 bg-neutral-100 w-16" />
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <p className="text-sm">Nenhum imóvel encontrado.</p>
            <Link href="/admin/imoveis/novo" className="mt-3 text-sm text-neutral-900 underline">
              Cadastrar novo imóvel
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 w-14" />
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Localização</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Preço</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600">Destaque</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data?.data.map(prop => {
                  const sc = statusConfig[prop.status] ?? { label: prop.status, cls: "bg-neutral-100 text-neutral-600" };
                  return (
                    <tr key={prop.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Cover image */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-neutral-100 overflow-hidden shrink-0">
                          {prop.cover_image ? (
                            <img src={prop.cover_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                              sem foto
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-neutral-500">{prop.code}</span>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-neutral-900 truncate">{prop.title}</p>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3">
                        <span className="text-neutral-500 text-xs">
                          {[prop.neighborhood, prop.city].filter(Boolean).join(", ")}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900 whitespace-nowrap">
                          {formatCurrency(prop.price)}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-neutral-600 text-xs capitalize">
                          {typeLabels[prop.transaction_type] ?? prop.transaction_type}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prop)}
                          disabled={togglingId === prop.id}
                          title={prop.featured ? "Remover destaque" : "Marcar como destaque"}
                          className={`transition-colors disabled:opacity-40 ${
                            prop.featured ? "text-yellow-500 hover:text-yellow-600" : "text-neutral-300 hover:text-neutral-500"
                          }`}
                        >
                          <Star size={18} fill={prop.featured ? "currentColor" : "none"} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/imoveis/${prop.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                          >
                            <Pencil size={13} />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(prop.id, prop.title)}
                            disabled={deletingId === prop.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                            {deletingId === prop.id ? "..." : "Excluir"}
                          </button>
                        </div>
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
    </div>
  );
}
