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
  { value: "São João da Boa Vista", label: "São João da Boa Vista" },
  { value: "Águas da Prata", label: "Águas da Prata" },
  { value: "Vargem Grande do Sul", label: "Vargem Grande do Sul" },
  { value: "Espírito Santo do Pinhal", label: "Espírito Santo do Pinhal" },
  { value: "Aguaí", label: "Aguaí" },
  { value: "Santo Antônio do Jardim", label: "Santo Antônio do Jardim" },
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
          className="w-full h-full bg-cover bg-[position:20%_center] bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-sao-joao-da-boa-vista.jpg')",
          }}
          role="img"
          aria-label="Catedral de São João da Boa Vista ao entardecer, com a Serra da Mantiqueira ao fundo"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/45 to-neutral-950/80" />
        <div className="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      {/* Photo credit (CC BY 2.0) */}
      <a
        href="https://commons.wikimedia.org/wiki/File:Vista_da_Igreja_Matriz_de_S%C3%A3o_Jo%C3%A3o_de_Boa_Vista,_localizada_na_Pra%C3%A7a_da_Catedral,_regi%C3%A3o_central_(14289251091).jpg"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-3 z-10 font-mono text-[10px] text-white/40 hover:text-white/70 transition-colors"
      >
        Foto: Governo do Estado de São Paulo (CC BY 2.0)
      </a>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
        <p className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-white/80 mb-7">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          FGR Imóveis · São João da Boa Vista
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.02] mb-6">
          Encontre o imóvel ideal{" "}
          <span className="block bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
            para você
          </span>
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto mb-12 leading-relaxed">
          Imóveis selecionados para quem busca qualidade, segurança e uma nova
          forma de viver.
        </p>

        {/* Search box */}
        <div className="glass max-w-3xl mx-auto rounded-3xl p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <div className="rounded-[20px] bg-white p-3 sm:p-4">
            {/* Transaction toggle */}
            <div className="relative grid grid-cols-2 rounded-full bg-neutral-100 p-1 mb-3">
              <span
                aria-hidden
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-neutral-950 shadow-md transition-transform duration-300 ${
                  transaction === "aluguel" ? "translate-x-full" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setTransaction("venda")}
                className={`relative z-10 py-2.5 font-mono text-xs font-medium tracking-[0.2em] transition-colors ${
                  transaction === "venda" ? "text-white" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                COMPRAR
              </button>
              <button
                type="button"
                onClick={() => setTransaction("aluguel")}
                className={`relative z-10 py-2.5 font-mono text-xs font-medium tracking-[0.2em] transition-colors ${
                  transaction === "aluguel" ? "text-white" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                ALUGAR
              </button>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition appearance-none cursor-pointer"
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
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition appearance-none cursor-pointer"
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
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition appearance-none cursor-pointer"
                  aria-label="Faixa de preço"
                >
                  {priceRanges.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-dark w-full py-4">
                <Search size={18} />
                Buscar imóveis
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden [@media(min-height:900px)]:flex flex-col items-center gap-2 text-white/50">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Explorar</span>
        <div className="flex h-9 w-5 justify-center rounded-full border border-white/30 pt-1.5">
          <span className="h-2 w-0.5 rounded-full bg-white/70 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
