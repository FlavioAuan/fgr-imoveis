"use client";

import { getWhatsAppUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="white"
      aria-hidden="true"
    >
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.829 1.782 6.86L2 30l7.347-1.745A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.54 11.54 0 0 1-5.89-1.61l-.422-.25-4.36 1.036 1.08-4.24-.275-.436A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.34-8.66c-.347-.174-2.055-1.013-2.374-1.129-.319-.116-.55-.174-.782.174-.23.347-.896 1.129-1.098 1.36-.202.232-.405.261-.752.087-.347-.174-1.464-.54-2.788-1.72-1.03-.92-1.726-2.055-1.928-2.402-.202-.347-.022-.534.152-.707.156-.155.347-.405.52-.607.174-.203.232-.347.347-.578.116-.232.058-.434-.029-.608-.087-.173-.782-1.884-1.071-2.58-.282-.678-.569-.586-.782-.596l-.666-.012c-.231 0-.607.087-.925.434-.318.347-1.214 1.187-1.214 2.894s1.243 3.355 1.416 3.587c.174.231 2.448 3.736 5.933 5.24.83.358 1.477.572 1.982.732.833.265 1.591.228 2.19.138.668-.1 2.055-.84 2.346-1.652.29-.811.29-1.506.203-1.652-.086-.145-.318-.231-.665-.405z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <WhatsAppIcon />
    </a>
  );
}
