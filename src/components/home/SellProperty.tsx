import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const sellBenefits = [
  "Você mesmo cadastra fotos, preço e descrição",
  "Interessados falam direto com você pelo WhatsApp",
  "Pagamento único, sem mensalidade",
];

export function SellProperty() {
  return (
    <section className="py-20 lg:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-[28px] bg-white ring-1 ring-neutral-200/70">
          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <p className="eyebrow mb-4 self-start">Para proprietários</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-5">
              Quer vender ou alugar? Anuncie você mesmo
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Coloque seu imóvel no portal e mostre para quem está procurando na região.
              Os contatos chegam direto para você, sem intermediário.
            </p>
            <ul className="space-y-3 mb-10">
              {sellBenefits.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-neutral-800">
                  <CheckCircle2 size={18} className="text-neutral-900 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/venda-seu-imovel" className="btn btn-dark self-start px-8 py-4">
              Anunciar meu imóvel
              <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className="min-h-[280px] lg:min-h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80')",
            }}
            role="img"
            aria-label="Casa com jardim e varanda"
          />
        </div>
      </div>
    </section>
  );
}
