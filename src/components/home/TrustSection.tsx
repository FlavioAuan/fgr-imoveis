import Link from "next/link";
import { MessagesSquare, UserRound, MapPinned, ShieldCheck, ArrowRight } from "lucide-react";

const values = [
  {
    icon: MessagesSquare,
    title: "Conversa franca",
    description:
      "Informações claras sobre valores, documentação e prazos, sem letras miúdas.",
  },
  {
    icon: UserRound,
    title: "Atendimento próximo",
    description:
      "Você fala sempre com a mesma pessoa, do primeiro contato à assinatura.",
  },
  {
    icon: MapPinned,
    title: "Conhecimento da região",
    description:
      "Sabemos o que cada bairro oferece e ajudamos você a escolher bem.",
  },
  {
    icon: ShieldCheck,
    title: "Negócio seguro",
    description:
      "Conferimos a documentação e acompanhamos cada etapa com cuidado.",
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
                aria-label="Corretora apresentando um imóvel a clientes"
              />
            </div>
            <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-xs rounded-2xl bg-white p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
              <p className="text-sm font-bold text-neutral-900">
                Do primeiro café à entrega das chaves
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                A gente acompanha cada passo da sua mudança.
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="eyebrow mb-4">Sobre a FGR</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6">
              Gente daqui, cuidando do seu próximo endereço.
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              A FGR Imóveis conhece de perto São João da Boa Vista e a região:
              os bairros mais tranquilos, as ruas mais procuradas e o que faz
              cada imóvel valer a pena.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-10">
              Nosso trabalho é simples: ouvir com atenção, mostrar opções que
              fazem sentido para a sua vida e cuidar de tudo até você estar
              com as chaves na mão.
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
              Conheça nossa história
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
