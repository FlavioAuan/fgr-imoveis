import Link from "next/link";
import { MessagesSquare, UserRound, MapPinned, ShieldCheck, ArrowRight } from "lucide-react";

const values = [
  {
    icon: UserRound,
    title: "Vários anunciantes, uma busca",
    description:
      "Imóveis de imobiliárias, corretores e proprietários no mesmo lugar.",
  },
  {
    icon: MessagesSquare,
    title: "Contato direto",
    description:
      "A mensagem e o WhatsApp vão para quem anuncia. Sem intermediário.",
  },
  {
    icon: MapPinned,
    title: "Tudo no mapa",
    description:
      "Veja em que rua e bairro fica cada imóvel antes de marcar a visita.",
  },
  {
    icon: ShieldCheck,
    title: "Anúncios autorizados",
    description:
      "Quem anuncia declara ter autorização para anunciar cada imóvel.",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] relative overflow-hidden rounded-[28px]">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80')",
                }}
                role="img"
                aria-label="Casa à venda com jardim"
              />
            </div>
            <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-xs rounded-2xl bg-white p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
              <p className="text-sm font-bold text-neutral-900">
                Você escolhe, você conversa
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                O contato é direto com quem anuncia o imóvel.
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="eyebrow mb-4">Como funciona o portal</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6">
              Os imóveis da região em um lugar só.
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              A FGR Imóveis é um portal de São João da Boa Vista e região. Aqui
              imobiliárias, corretores e proprietários publicam seus imóveis, e
              você encontra tudo em uma busca só, na lista ou no mapa.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-10">
              Gostou de um imóvel? Fale direto com quem anuncia. A conversa, a
              visita e a negociação são entre você e o anunciante.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 mb-10">
              {values.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center">
                    <item.icon size={19} className="text-neutral-800" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/sobre" className="btn btn-dark">
              Saiba mais sobre o portal
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
