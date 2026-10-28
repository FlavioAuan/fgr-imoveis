import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Eye, MapPinned, MessagesSquare, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre o portal",
  description:
    "A FGR Imóveis é um portal de imóveis de São João da Boa Vista e região: reúne anúncios de imobiliárias, corretores e proprietários, com contato direto com quem anuncia.",
};

const values = [
  {
    icon: Eye,
    title: "Tudo à vista",
    description: "Preço, fotos, localização e quem anuncia aparecem em cada anúncio.",
  },
  {
    icon: MessagesSquare,
    title: "Contato direto",
    description: "A mensagem e o WhatsApp vão para o anunciante, sem intermediário.",
  },
  {
    icon: MapPinned,
    title: "Feito na região",
    description: "São João da Boa Vista e cidades vizinhas, com o mapa de ruas e bairros.",
  },
  {
    icon: ShieldCheck,
    title: "Anúncios autorizados",
    description: "Quem anuncia declara ter autorização para anunciar cada imóvel.",
  },
];

const audiences = [
  {
    title: "Para quem procura",
    items: [
      "Busque por tipo, preço, quartos e bairro",
      "Veja os imóveis na lista ou no mapa da cidade",
      "Fale direto com quem anuncia, pelo WhatsApp ou pelo formulário",
    ],
    cta: { label: "Ver imóveis", href: "/imoveis" },
    dark: false,
  },
  {
    title: "Para quem anuncia",
    items: [
      "Proprietários: anúncio avulso, sem mensalidade",
      "Imobiliárias e corretores: planos mensais com vários anúncios",
      "Painel próprio para cadastrar imóveis e ver os contatos",
    ],
    cta: { label: "Anunciar no portal", href: "/venda-seu-imovel" },
    dark: true,
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-neutral-950 text-white py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow-dark mb-5">Sobre o portal</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Sobre a FGR Imóveis</h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Um portal para encontrar e anunciar imóveis em São João da Boa Vista e região.
          </p>
        </div>
      </section>

      {/* O que é */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="eyebrow mb-4">O que é</p>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                Os imóveis da região em um lugar só
              </h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  A FGR Imóveis reúne os imóveis anunciados por imobiliárias, corretores e
                  proprietários de São João da Boa Vista e das cidades vizinhas. Em vez de
                  procurar site por site, você encontra tudo em uma busca só.
                </p>
                <p>
                  Cada anúncio mostra preço, fotos, características e o ponto no mapa. Gostou
                  de um imóvel? O contato vai direto para quem anuncia.
                </p>
                <p>
                  A FGR Imóveis é o portal: não é imobiliária e não intermedeia negociações.
                  A conversa, a visita e o negócio são entre você e o anunciante.
                </p>
              </div>
            </div>

            <div
              className="aspect-[4/3] rounded-[28px] bg-cover bg-center"
              style={{ backgroundImage: "url('/images/hero-sao-joao-da-boa-vista.jpg')" }}
              role="img"
              aria-label="Vista de São João da Boa Vista"
            />
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="py-20 lg:py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
          {audiences.map(a => (
            <div
              key={a.title}
              className={`rounded-[28px] p-8 sm:p-10 flex flex-col ${a.dark ? "bg-neutral-900 text-white" : "bg-white ring-1 ring-neutral-200/70"}`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${a.dark ? "text-white" : "text-neutral-900"}`}>{a.title}</h2>
              <ul className="space-y-3 mb-8 flex-1">
                {a.items.map(item => (
                  <li key={item} className={`flex gap-3 text-sm ${a.dark ? "text-neutral-200" : "text-neutral-700"}`}>
                    <Check size={18} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={a.cta.href} className={`btn self-start ${a.dark ? "btn-light" : "btn-dark"}`}>
                {a.cta.label}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4">O que nos guia</p>
            <h2 className="text-3xl font-bold text-neutral-900">Como o portal funciona</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(value => (
              <div key={value.title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-5">
                  <value.icon size={22} className="text-neutral-800" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-3">{value.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-20 lg:py-24 bg-neutral-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ficou com alguma dúvida?</h2>
          <p className="text-neutral-300 leading-relaxed text-lg mb-10">
            Fale com a equipe do portal sobre o site, os anúncios ou os planos.
          </p>
          <Link href="/contato" className="btn btn-light px-10 py-4">
            Fale com o portal
          </Link>
        </div>
      </section>
    </div>
  );
}
