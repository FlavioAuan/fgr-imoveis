"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Search } from "lucide-react";

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

const cities = [
  { value: "", label: "Todas as cidades" },
  { value: "São João da Boa Vista", label: "São João da Boa Vista" },
  { value: "Águas da Prata", label: "Águas da Prata" },
  { value: "Vargem Grande do Sul", label: "Vargem Grande do Sul" },
  { value: "Espírito Santo do Pinhal", label: "Espírito Santo do Pinhal" },
  { value: "Aguaí", label: "Aguaí" },
  { value: "Santo Antônio do Jardim", label: "Santo Antônio do Jardim" },
];

const priceRanges = [
  { value: "", label: "Qualquer valor" },
  { value: "0-500000", label: "Até R$ 500 mil" },
  { value: "500000-1000000", label: "R$ 500 mil – R$ 1 mi" },
  { value: "1000000-2000000", label: "R$ 1 mi – R$ 2 mi" },
  { value: "2000000-5000000", label: "R$ 2 mi – R$ 5 mi" },
  { value: "5000000-999999999", label: "Acima de R$ 5 mi" },
];

const highlights = [
  "Atendimento feito por gente da região",
  "Documentação conferida do início ao fim",
  "Visitas no horário que for melhor para você",
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
    <section className="bg-white pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Photo card */}
        <div className="relative overflow-hidden rounded-[28px] min-h-[480px] lg:min-h-[min(600px,calc(100vh-190px))] flex items-end">
          <div
            className="absolute inset-0 bg-cover bg-[position:20%_center] bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-sao-joao-da-boa-vista.jpg')",
            }}
            role="img"
            aria-label="Catedral de São João da Boa Vista ao entardecer, com a Serra da Mantiqueira ao fundo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/35 to-neutral-950/10" />

          {/* Photo credit (CC BY 2.0) */}
          <a
            href="https://commons.wikimedia.org/wiki/File:Vista_da_Igreja_Matriz_de_S%C3%A3o_Jo%C3%A3o_de_Boa_Vista,_localizada_na_Pra%C3%A7a_da_Catedral,_regi%C3%A3o_central_(14289251091).jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-5 z-10 text-[10px] text-white/50 hover:text-white/80 transition-colors"
          >
            Foto: Governo do Estado de São Paulo (CC BY 2.0)
          </a>

          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 pb-28 sm:pb-32 pt-24">
            <p className="eyebrow-dark mb-5">
              <MapPin size={14} />
              São João da Boa Vista e região
            </p>
            <h1 className="max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-5">
              Seu novo lar está mais perto do que você imagina
            </h1>
            <p className="max-w-lg text-base sm:text-lg text-neutral-200 leading-relaxed">
              Casas, apartamentos, terrenos e chácaras com o atendimento de
              quem conhece cada bairro da cidade.
            </p>
          </div>
        </div>

        {/* Search card */}
        <div className="relative z-20 -mt-20 mx-auto max-w-5xl px-2 sm:px-6">
          <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] ring-1 ring-neutral-100">
            <div className="flex gap-2 mb-4">
              {(["venda", "aluguel"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTransaction(value)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    transaction === value
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {value === "venda" ? "Comprar" : "Alugar"}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 sm:gap-0 sm:divide-x sm:divide-neutral-200 sm:rounded-2xl sm:bg-neutral-50 sm:p-1.5"
            >
              {[
                { label: "Tipo", value: type, set: setType, options: propertyTypes },
                { label: "Cidade", value: city, set: setCity, options: cities },
                { label: "Preço", value: priceRange, set: setPriceRange, options: priceRanges },
              ].map((field) => (
                <label key={field.label} className="flex flex-col rounded-2xl bg-neutral-50 px-4 py-2.5 sm:rounded-none sm:bg-transparent">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    {field.label}
                  </span>
                  <select
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    className="bg-transparent text-sm font-medium text-neutral-800 focus:outline-none appearance-none cursor-pointer"
                    aria-label={field.label}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <div className="sm:pl-1.5 sm:border-l-0">
                <button type="submit" className="btn btn-dark w-full h-full min-h-[52px] rounded-2xl px-7">
                  <Search size={18} />
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {/* Highlights */}
          <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-neutral-600">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-neutral-900" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
