import Link from "next/link";
import { ArrowDown, Building2, MapPinned, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "$19B+", label: "COP invertidos al año en proyectos de impacto" },
  { value: "SECOP II", label: "API de contratación pública auditable" },
  { value: "100%", label: "Evidencias georreferenciadas en campo" },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-slate-50"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-50 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            Transparencia verificada · SECOP II + Evidencias en campo
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            La plataforma de inteligencia territorial que conecta la{" "}
            <span className="text-emerald-700">inversión corporativa</span> con
            la realidad de las{" "}
            <span className="text-emerald-700">comunidades</span> en Colombia.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Transparencia verificada entre datos de SECOP II, reportes ESG y
            evidencias en campo. Inversión con licencia social real.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white" asChild>
              <Link href="/explorador">
                <MapPinned className="h-4 w-4" />
                Explorador de Obras en Vivo (MVP)
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#lead-b2b">
                <Building2 className="h-4 w-4" />
                Solicitar Reporte Competitivo ESG
              </a>
            </Button>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-xl border bg-card p-5 text-center shadow-sm"
              )}
            >
              <dt className="order-last mt-1 text-sm text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="text-2xl font-extrabold text-emerald-700">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex justify-center">
          <a
            href="#mapa-ciudadano"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
          >
            <ArrowDown className="h-4 w-4 animate-bounce" />
            Descubre las obras cerca de ti
          </a>
        </div>
      </div>
    </section>
  );
}