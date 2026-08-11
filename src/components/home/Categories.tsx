import Link from "next/link";

const categories = [
  {
    label: "Casas",
    href: "/imoveis?categoria=casa",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
    description: "Residências espaçosas",
  },
  {
    label: "Apartamentos",
    href: "/imoveis?categoria=apartamento",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    description: "Vida urbana sofisticada",
  },
  {
    label: "Terrenos",
    href: "/imoveis?categoria=terreno",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    description: "Construa seus sonhos",
  },
  {
    label: "Comercial",
    href: "/imoveis?categoria=comercial",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    description: "Espaços para negócios",
  },
  {
    label: "Condomínios",
    href: "/imoveis?categoria=condominio",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    description: "Segurança e lazer",
  },
  {
    label: "Alto Padrão",
    href: "/imoveis?categoria=cobertura",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
    description: "O máximo em sofisticação",
  },
];

export function Categories() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-3">
            Encontre o que procura
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
            Categorias de imóveis
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative aspect-[3/2] overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${cat.image}')` }}
                role="img"
                aria-label={cat.label}
              />
              <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-950/50 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  {cat.label}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300">
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
