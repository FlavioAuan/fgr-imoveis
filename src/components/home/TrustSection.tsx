import Link from "next/link";
import { Shield, Users, Award, Handshake, ArrowRight } from "lucide-react";

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
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] relative overflow-hidden rounded-[32px]">
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
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-[28px] bg-neutral-950 grid-lines hidden lg:flex items-center justify-center text-center p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
              <div>
                <p className="font-display text-white text-3xl font-bold tracking-tight">FGR</p>
                <p className="font-mono text-neutral-400 text-[10px] tracking-[0.3em] mt-1">IMÓVEIS</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="eyebrow mb-4">Quem somos</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-6">
              Mais do que imóveis.{" "}
              <span className="font-normal text-neutral-400">Novos começos.</span>
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
                <div key={item.title} className="flex gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4 transition-colors hover:border-neutral-300 hover:bg-white">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center">
                    <item.icon size={18} className="text-white" />
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
              className="btn btn-dark"
            >
              Conheça a FGR Imóveis
              <span className="btn-icon"><ArrowRight size={14} /></span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
