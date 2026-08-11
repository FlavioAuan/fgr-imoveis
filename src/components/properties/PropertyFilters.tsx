"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const propertyTypes = [
  { value: "", label: "Todos os tipos" },
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "cobertura", label: "Cobertura" },
  { value: "studio", label: "Studio" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "condominio", label: "Condomínio" },
];

const bedroomsOptions = [
  { value: "", label: "Qualquer" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const cities = [
  { value: "", label: "Todas as cidades" },
  { value: "São Paulo", label: "São Paulo" },
  { value: "Barueri", label: "Barueri" },
  { value: "Cotia", label: "Cotia" },
];

const sortOptions = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "maior-area", label: "Maior área" },
];

interface FiltersState {
  tipo: string;
  categoria: string;
  cidade: string;
  quartos: string;
  precoMin: string;
  precoMax: string;
  areaMin: string;
  areaMax: string;
  ordenar: string;
}

export function PropertyFilters({ count }: { count: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getParam = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams]
  );

  const [filters, setFilters] = useState<FiltersState>({
    tipo: getParam("tipo"),
    categoria: getParam("categoria"),
    cidade: getParam("cidade"),
    quartos: getParam("quartos"),
    precoMin: getParam("precoMin"),
    precoMax: getParam("precoMax"),
    areaMin: getParam("areaMin"),
    areaMax: getParam("areaMax"),
    ordenar: getParam("ordenar", "recentes"),
  });

  function applyFilters(updated: FiltersState) {
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    router.push(`/imoveis?${params.toString()}`);
  }

  function handleChange(key: keyof FiltersState, value: string) {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  }

  function clearFilters() {
    const clean: FiltersState = {
      tipo: "",
      categoria: "",
      cidade: "",
      quartos: "",
      precoMin: "",
      precoMax: "",
      areaMin: "",
      areaMax: "",
      ordenar: "recentes",
    };
    setFilters(clean);
    router.push("/imoveis");
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== "ordenar" && val !== ""
  );

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Transaction */}
      <div>
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
          Finalidade
        </label>
        <div className="flex gap-2">
          {[
            { value: "", label: "Todos" },
            { value: "venda", label: "Comprar" },
            { value: "aluguel", label: "Alugar" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange("tipo", opt.value)}
              className={cn(
                "flex-1 py-2 text-xs font-medium border transition-colors",
                filters.tipo === opt.value
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-900"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
          Tipo de imóvel
        </label>
        <select
          value={filters.categoria}
          onChange={(e) => handleChange("categoria", e.target.value)}
          className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors appearance-none"
        >
          {propertyTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
          Cidade
        </label>
        <select
          value={filters.cidade}
          onChange={(e) => handleChange("cidade", e.target.value)}
          className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors appearance-none"
        >
          {cities.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
          Faixa de preço
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mínimo"
            value={filters.precoMin}
            onChange={(e) => handleChange("precoMin", e.target.value)}
            className="flex-1 border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 min-w-0"
          />
          <input
            type="number"
            placeholder="Máximo"
            value={filters.precoMax}
            onChange={(e) => handleChange("precoMax", e.target.value)}
            className="flex-1 border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 min-w-0"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
          Quartos
        </label>
        <div className="flex gap-2">
          {bedroomsOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange("quartos", opt.value)}
              className={cn(
                "flex-1 py-2 text-xs font-medium border transition-colors",
                filters.quartos === opt.value
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-900"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
          Área (m²)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mínima"
            value={filters.areaMin}
            onChange={(e) => handleChange("areaMin", e.target.value)}
            className="flex-1 border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 min-w-0"
          />
          <input
            type="number"
            placeholder="Máxima"
            value={filters.areaMax}
            onChange={(e) => handleChange("areaMax", e.target.value)}
            className="flex-1 border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 min-w-0"
          />
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors pt-2 border-t border-neutral-100"
        >
          <X size={14} />
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-900">{count}</span>{" "}
          {count === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 border border-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filtros
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">
              Filtros
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Sort (desktop) */}
          <div className="mb-6 pb-6 border-b border-neutral-100">
            <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
              Ordenar por
            </label>
            <select
              value={filters.ordenar}
              onChange={(e) => handleChange("ordenar", e.target.value)}
              className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors appearance-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <FilterContent />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900">Filtros</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-neutral-400 hover:text-neutral-900"
                aria-label="Fechar filtros"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-6 pb-6 border-b border-neutral-100">
                <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 block mb-3">
                  Ordenar por
                </label>
                <select
                  value={filters.ordenar}
                  onChange={(e) => {
                    handleChange("ordenar", e.target.value);
                    setMobileOpen(false);
                  }}
                  className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:outline-none appearance-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <FilterContent />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full mt-8 bg-neutral-900 text-white font-medium py-4 text-sm"
              >
                Ver resultados ({count})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
