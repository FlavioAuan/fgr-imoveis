import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    label: "Casas",
    href: "/imoveis?categoria=casa",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    description: "Residências espaçosas",
    className: "col-span-2 md:row-span-2",
  },
  {
    label: "Apartamentos",
    href: "/imoveis?categoria=apartamento",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    description: "Vida urbana sofisticada",
    className: "",
  },
  {
    label: "Terrenos",
    href: "/imoveis?categoria=terreno",
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80",
    description: "Lotes, chácaras e áreas rurais",
    className: "",
  },
  {
    label: "Comercial",
    href: "/imoveis?categoria=comercial",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    description: "Espaços para negócios",
    className: "",
  },
  {
    label: "Condomínios",
    href: "/imoveis?categoria=condominio",
    image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80",
    description: "Segurança e lazer",
    className: "",
  },
  {
    label: "Alto Padrão",
    href: "/imoveis?categoria=cobertura",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    description: "O máximo em sofisticação",
    className: "col-span-2 md:col-span-4",
  },
];

export function Categories() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="eyebrow mb-4">Encontre o que procura</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900">
              Categorias de imóveis
            </h2>
          </div>
          <p className="font-mono text-xs text-neutral-400">
            {String(categories.length).padStart(2, "0")} categorias
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group relative overflow-hidden rounded-3xl bg-neutral-900 ${cat.className}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url('${cat.image}')` }}
                role="img"
                aria-label={cat.label}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent" />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-white/30 transition" />

              <span className="glass absolute left-4 top-4 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-widest text-white/90">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="glass absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-300 group-hover:bg-white group-hover:text-neutral-950 group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
                <h3 className="text-lg sm:text-2xl font-bold">{cat.label}</h3>
                <p className="mt-1 text-xs sm:text-sm text-neutral-300 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
