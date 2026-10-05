"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhatsAppUrl } from "@/components/providers/SiteContactProvider";
import { saveLead } from "@/lib/leads";

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="white"
      aria-hidden="true"
    >
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.829 1.782 6.86L2 30l7.347-1.745A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.54 11.54 0 0 1-5.89-1.61l-.422-.25-4.36 1.036 1.08-4.24-.275-.436A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.34-8.66c-.347-.174-2.055-1.013-2.374-1.129-.319-.116-.55-.174-.782.174-.23.347-.896 1.129-1.098 1.36-.202.232-.405.261-.752.087-.347-.174-1.464-.54-2.788-1.72-1.03-.92-1.726-2.055-1.928-2.402-.202-.347-.022-.534.152-.707.156-.155.347-.405.52-.607.174-.203.232-.347.347-.578.116-.232.058-.434-.029-.608-.087-.173-.782-1.884-1.071-2.58-.282-.678-.569-.586-.782-.596l-.666-.012c-.231 0-.607.087-.925.434-.318.347-1.214 1.187-1.214 2.894s1.243 3.355 1.416 3.587c.174.231 2.448 3.736 5.933 5.24.83.358 1.477.572 1.982.732.833.265 1.591.228 2.19.138.668-.1 2.055-.84 2.346-1.652.29-.811.29-1.506.203-1.652-.086-.145-.318-.231-.665-.405z" />
    </svg>
  );
}

const inputClass =
  "w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 transition-colors rounded-none";

export function WhatsAppButton() {
  const getWhatsAppUrl = useWhatsAppUrl();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const message = `Olá! Vim pelo site da FGR Imóveis e gostaria de mais informações.\n\nNome: ${form.name}\nWhatsApp: ${form.whatsapp}`;
    await saveLead({
      name: form.name,
      phone: form.whatsapp,
      email: form.email || undefined,
      message,
      source: "whatsapp_flutuante",
    });
    window.open(getWhatsAppUrl(message), "_blank");
    setOpen(false);
    setForm({ name: "", whatsapp: "", email: "" });
    setLoading(false);
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {open && (
        <div className="w-72 bg-white shadow-2xl border border-neutral-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WhatsAppIcon size={22} />
              <span className="text-white font-semibold text-sm">
                Fale pelo WhatsApp
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Seu nome *"
              required
              className={inputClass}
            />
            <input
              name="whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="Seu WhatsApp *"
              required
              className={inputClass}
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail (opcional)"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#25D366] text-white font-semibold py-3 text-sm hover:bg-[#20bd5a] transition-colors disabled:opacity-60"
            >
              {loading ? "Aguarde..." : "Iniciar conversa"}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Falar pelo WhatsApp"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-xl hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300"
      >
        <WhatsAppIcon />
      </button>
    </div>
  );
}
