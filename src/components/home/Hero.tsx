"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const propertyTypes = [
  { value: "", label: "Tipo de imóvel" },
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "cobertura", label: "Cobertura" },
  { value: "studio", label: "Studio" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "condominio", label: "Condomínio" },
];

const cities = [
  { value: "", label: "Localização" },
  { value: "São Paulo", label: "São Paulo" },
  { value: "Barueri", label: "Barueri" },
  { value: "Cotia", label: "Cotia" },
  { value: "Alphaville", label: "Alphaville" },
];

const priceRanges = [
  { value: "", label: "Faixa de preço" },
  { value: "0-500000", label: "Até R$ 500 mil" },
  { value: "500000-1000000", label: "R$ 500 mil – R$ 1 mi" },
  { value: "1000000-2000000", label: "R$ 1 mi – R$ 2 mi" },
  { value: "2000000-5000000", label: "R$ 2 mi – R$ 5 mi" },
  { value: "5000000-999999999", label: "Acima de R$ 5 mi" },
];

export function Hero() {
  const router = useRouter();
  const [transaction, setTransaction] = useState<"venda" | "aluguel">("venda");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("tipo", transaction);
    if (type) params.set("categoria", type);
    if (city) params.set("cidade", city);
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      params.set("precoMin", min);
      params.set("precoMax", max);
    }
    router.push(`/imoveis?${params.toString()}`);
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80')",
          }}
          role="img"
          aria-label="Imóvel moderno de alto padrão"
        />
        <div className="absolute inset-0 bg-neutral-950/55" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-5">
          FGR Imóveis
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Encontre o imóvel ideal{" "}
          <span className="block">para você</span>
        </h1>
        <p className="text-lg text-neutral-300 max-w-xl mx-auto mb-12 leading-relaxed">
          Imóveis selecionados para quem busca qualidade, segurança e uma nova
          forma de viver.
        </p>

        {/* Search box */}
        <div className="bg-white shadow-2xl max-w-3xl mx-auto">
          {/* Transaction toggle */}
          <div className="flex">
            <button
              type="button"
              onClick={() => setTransaction("venda")}
              className={`flex-1 py-3.5 text-sm font-semibold tracking-wide transition-colors ${
                transaction === "venda"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              COMPRAR
            </button>
            <button
              type="button"
              onClick={() => setTransaction("aluguel")}
              className={`flex-1 py-3.5 text-sm font-semibold tracking-wide transition-colors ${
                transaction === "aluguel"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              ALUGAR
            </button>
          </div>

          {/* Filters */}
          <form onSubmit={handleSearch} className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors appearance-none cursor-pointer"
                aria-label="Tipo de imóvel"
              >
                {propertyTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors appearance-none cursor-pointer"
                aria-label="Localização"
              >
                {cities.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 transition-colors appearance-none cursor-pointer"
                aria-label="Faixa de preço"
              >
                {priceRanges.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white font-semibold py-4 hover:bg-neutral-700 transition-colors text-sm tracking-wide"
            >
              <Search size={18} />
              Buscar imóveis
            </button>
          </form>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-widest uppercase">Explorar</span>
        <div className="w-px h-10 bg-white/20 animate-pulse" />
      </div>
    </section>
  );
}
