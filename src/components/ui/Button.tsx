"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:ring-neutral-900":
              variant === "primary",
            "bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:ring-neutral-900":
              variant === "secondary",
            "border border-neutral-300 text-neutral-900 bg-transparent hover:border-neutral-950 hover:bg-neutral-900 hover:text-white focus-visible:ring-neutral-900":
              variant === "outline",
            "text-neutral-700 bg-transparent hover:bg-neutral-100 focus-visible:ring-neutral-900":
              variant === "ghost",
            "bg-[#25D366] text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366]":
              variant === "whatsapp",
          },
          {
            "text-sm px-5 py-2": size === "sm",
            "text-sm px-7 py-3.5": size === "md",
            "text-base px-9 py-4": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
