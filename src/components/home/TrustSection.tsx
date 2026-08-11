import Link from "next/link";
import { Shield, Users, Award, Handshake } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Transparência",
    description:
      "Cada etapa do processo realizada com clareza, honestidade e compromisso.",
  },
  {
    icon: Users,
    title: "Atendimento personalizado",
    description:
      "Entendemos suas necessidades e encontramos a solução certa para você.",
  },
  {
    icon: Award,
    title: "Excelência",
    description:
      "Padrão elevado de qualidade em cada imóvel e em cada relacionamento.",
  },
  {
    icon: Handshake,
    title: "Segurança",
    description:
      "Transações seguras, documentação correta e suporte completo do início ao fim.",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] relative overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80')",
                }}
                role="img"
                aria-label="Consultoria imobiliária profissional"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-neutral-900 hidden lg:flex items-center justify-center text-center p-4">
              <div>
                <p className="text-white text-2xl font-bold">FGR</p>
                <p className="text-neutral-400 text-xs tracking-widest mt-1">IMÓVEIS</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
              Quem somos
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6">
              Mais do que imóveis.{" "}
              <span className="italic font-normal">Novos começos.</span>
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              A FGR Imóveis nasce da convicção de que encontrar o imóvel certo
              vai muito além de uma transação. É sobre descobrir um lugar onde
              sua história vai continuar — com segurança, conforto e
              significado.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-10">
              Com profundo conhecimento do mercado imobiliário e um compromisso
              genuíno com cada cliente, a FGR Imóveis oferece uma experiência
              diferente: humana, personalizada e centrada nos seus objetivos.
            </p>

            {/* Values grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {values.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 border border-neutral-200 flex items-center justify-center">
                    <item.icon size={18} className="text-neutral-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white font-medium px-8 py-4 text-sm hover:bg-neutral-700 transition-colors"
            >
              Conheça a FGR Imóveis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
