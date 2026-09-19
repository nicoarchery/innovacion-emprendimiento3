"use client";

import { useState } from "react";
import { Menu, X, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Mapa de Cali", href: "/mapa" },
  { label: "Explorador", href: "/explorador", isBadge: true },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Para organizaciones", href: "/#para-organizaciones" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-slate-50/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-emerald-50">
            <ArrowDown className="h-5 w-5 -rotate-90" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-slate-900">
              Obras a la Vista
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-700">
              Consulta ciudadana · Cali
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-700",
                link.isBadge
                  ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                  : "text-slate-600"
              )}
            >
              {link.isBadge && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              )}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button size="sm" asChild>
            <a href="/mapa">Consultar obras</a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "md:hidden",
          open ? "block border-t bg-slate-50" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Button asChild>
              <a href="/mapa">Consultar obras</a>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}