import Link from "next/link";
import { ArrowDown, Building2, MapPinned, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "1.433", label: "Obras de Cali identificadas en SECOP II" },
  { value: "SECOP II", label: "Fuente oficial: datos.gov.co" },
  { value: "Tú", label: "Confirmas el avance y das reconocimiento" },
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
            Datos SECOP II + reporte ciudadano
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Consulta las obras de Cali. Reconoce a quien ejecuta bien.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Revisa valor, contratista y avance en un mapa. Confirma lo que ves
            en terreno y otorga reconocimiento público a las entidades que cumplen.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white" asChild>
              <Link href="/mapa">
                <MapPinned className="h-4 w-4" />
                Ver mapa de Cali
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#para-organizaciones">
                <Building2 className="h-4 w-4" />
                Para organizaciones
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
            Revisa las obras de tu municipio
          </a>
        </div>
      </div>
    </section>
  );
}