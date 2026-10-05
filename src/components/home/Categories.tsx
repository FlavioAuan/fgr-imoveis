import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    label: "Casas",
    href: "/imoveis?categoria=casa",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    description: "Espaço para a família crescer",
  },
  {
    label: "Apartamentos",
    href: "/imoveis?categoria=apartamento",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    description: "Praticidade perto de tudo",
  },
  {
    label: "Terrenos",
    href: "/imoveis?categoria=terreno",
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80",
    description: "Lotes e chácaras para construir do seu jeito",
  },
  {
    label: "Comercial",
    href: "/imoveis?categoria=comercial",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    description: "Pontos e salas para o seu negócio",
  },
  {
    label: "Condomínios",
    href: "/imoveis?categoria=condominio",
    image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80",
    description: "Tranquilidade e lazer na porta de casa",
  },
  {
    label: "Alto Padrão",
    href: "/imoveis?categoria=cobertura",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    description: "Acabamento e localização especiais",
  },
];

export function Categories() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="eyebrow mb-4">Do seu jeito</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-3">
            O que você está procurando?
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Escolha uma categoria e veja as opções disponíveis em São João da
            Boa Vista e nas cidades vizinhas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6">
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                  role="img"
                  aria-label={cat.label}
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                    {cat.label}
                  </h3>
                  <p className="mt-0.5 text-sm text-neutral-500">{cat.description}</p>
                </div>
                <span className="mt-0.5 hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
