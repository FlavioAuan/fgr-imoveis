import type { Metadata } from "next";
import { Heart, Eye, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a FGR Imóveis — nossa história, propósito e os valores que guiam nosso trabalho no mercado imobiliário.",
};

const values = [
  {
    icon: Eye,
    title: "Transparência",
    description:
      "Comunicação clara e honesta em cada etapa do processo. Você sempre saberá exatamente o que está acontecendo.",
  },
  {
    icon: Heart,
    title: "Dedicação",
    description:
      "Tratamos cada cliente como único. Entendemos suas necessidades e trabalhamos com empenho para superá-las.",
  },
  {
    icon: Shield,
    title: "Integridade",
    description:
      "Agimos com ética e responsabilidade, priorizando sempre os interesses de nossos clientes.",
  },
  {
    icon: Users,
    title: "Relacionamento",
    description:
      "Construímos relações duradouras baseadas em confiança, respeito e comprometimento genuíno.",
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-neutral-950 text-white py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-5">
            Conheça a FGR Imóveis
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Sobre a FGR Imóveis
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Uma imobiliária que acredita que encontrar o imóvel certo é o
            começo de uma nova história.
          </p>
        </div>
      </section>

      {/* Nossa história */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
                Nossa história
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                Uma empresa construída sobre propósito
              </h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  A FGR Imóveis surgiu da vontade de oferecer algo diferente no
                  mercado imobiliário: um atendimento verdadeiramente humano,
                  centrado nas necessidades reais de cada cliente.
                </p>
                <p>
                  Acreditamos que um imóvel não é apenas um bem — é o lugar
                  onde projetos de vida se realizam. Por isso, levamos nossa
                  responsabilidade a sério e tratamos cada negociação com
                  cuidado, ética e profissionalismo.
                </p>
                <p>
                  Nossa equipe é formada por profissionais comprometidos com a
                  excelência, prontos para oferecer orientação especializada em
                  cada passo da jornada imobiliária.
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80')",
                }}
                role="img"
                aria-label="Equipe FGR Imóveis"
              />
              <div className="absolute -bottom-4 -left-4 bg-neutral-900 text-white p-6 hidden lg:block">
                <p className="text-3xl font-bold">FGR</p>
                <p className="text-xs tracking-widest text-neutral-400 mt-1">
                  IMÓVEIS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propósito */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
            Nosso propósito
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Mais do que imóveis. Novos começos.
          </h2>
          <p className="text-neutral-600 leading-relaxed text-lg">
            Nosso propósito é conectar pessoas a imóveis que transformem suas
            vidas. Queremos que cada cliente saia de uma negociação com a
            certeza de que fez a escolha certa — com segurança, clareza e a
            sensação de ter sido verdadeiramente ouvido.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
              O que nos guia
            </p>
            <h2 className="text-3xl font-bold text-neutral-900">
              Nossos valores
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-14 h-14 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
                  <value.icon size={22} className="text-neutral-700" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Atendimento personalizado */}
      <section className="py-20 lg:py-28 bg-neutral-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
            Nossa abordagem
          </p>
          <h2 className="text-3xl font-bold mb-6">
            Atendimento personalizado
          </h2>
          <p className="text-neutral-300 leading-relaxed text-lg mb-10">
            Cada cliente tem uma história, um estilo de vida e objetivos únicos.
            Por isso, não trabalhamos com soluções genéricas. Ouvimos,
            entendemos e buscamos o imóvel que faz sentido para você — não
            apenas qualquer imóvel disponível.
          </p>
          <a
            href="/contato"
            className="inline-flex items-center justify-center bg-white text-neutral-900 font-semibold px-10 py-4 hover:bg-neutral-100 transition-colors text-sm tracking-wide"
          >
            Entre em contato
          </a>
        </div>
      </section>
    </div>
  );
}
