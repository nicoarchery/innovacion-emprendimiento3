"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Mapa de Cali", href: "/mapa" },
  { label: "Explorador", href: "/explorador" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Para organizaciones", href: "/#para-organizaciones" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-double border-tinta/70 bg-papel/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-display text-xl font-bold leading-none text-tinta">
            Obras a la Vista
          </span>
          <span className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sello sm:inline">
            Cali · Consulta ciudadana
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-tinta/80 underline-offset-4 transition-colors hover:text-sello hover:underline"
            >
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
          "border-t border-tinta/15 md:hidden",
          open ? "block bg-papel" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[3px] px-3 py-2 text-sm font-medium text-tinta/80 hover:bg-accent hover:text-sello"
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
