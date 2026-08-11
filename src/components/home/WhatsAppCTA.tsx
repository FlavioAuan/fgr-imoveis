import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/config";

export function WhatsAppCTA() {
  return (
    <section className="py-20 lg:py-28 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-neutral-950 px-8 py-16 text-center lg:py-20">
          {/* Decorative */}
          <div className="absolute -top-20 -left-20 w-64 h-64 border border-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 border border-white/5 rounded-full" />

          <div className="relative z-10 max-w-xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
              Atendimento personalizado
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-5">
              Está procurando um imóvel?
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-10">
              Fale com a FGR Imóveis e encontre oportunidades que combinam com
              você. Atendimento humano, dedicado e sem burocracia.
            </p>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-semibold px-10 py-4 hover:bg-[#20bd5a] transition-colors text-sm tracking-wide"
            >
              <MessageCircle size={20} />
              Falar pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
