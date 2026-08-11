"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { getWhatsAppUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Comprar", href: "/imoveis?tipo=venda" },
  { label: "Alugar", href: "/imoveis?tipo=aluguel" },
  { label: "Imóveis", href: "/imoveis" },
  { label: "Venda seu imóvel", href: "/venda-seu-imovel" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-white/95 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo variant="dark" height={48} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-medium tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-neutral-700 transition-colors"
            >
              <MessageCircle size={16} />
              Fale conosco
            </a>
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="flex items-center justify-center w-9 h-9 text-neutral-900"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-sm z-40 transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col px-6 py-8 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-neutral-600 font-medium py-4 border-b border-neutral-100 hover:text-neutral-900 tracking-wide transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-neutral-900 text-white font-medium py-4 mt-2"
            >
              <MessageCircle size={18} />
              Fale conosco pelo WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
