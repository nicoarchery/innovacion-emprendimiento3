import Link from "next/link";
import { ArrowDown, Building2, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/Stamp";

const LEDGER = [
  {
    figure: "1.433",
    text: "obras de Cali identificadas en SECOP II",
  },
  {
    figure: "datos.gov.co",
    text: "cada ficha enlaza su contrato fuente",
  },
  {
    figure: "15%",
    text: "diferencia máxima con terreno para el sello",
  },
];

function FichaEjemplo() {
  return (
    <figure className="border border-tinta/20 bg-ficha">
      <div className="flex items-center justify-between border-b border-tinta/15 px-5 py-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-tinta/60">
          Ficha de obra
        </span>
        <span className="font-mono text-[11px] text-tinta/60">
          Folio CO1.PCCNTR.5095519
        </span>
      </div>

      <div className="space-y-0 px-5 py-2">
        {[
          ["Contrato", "CO1.PCCNTR.5095519"],
          ["Estado SECOP II", "Terminado"],
          ["Valor", "$65.570.214"],
          ["Dirección SECOP", "Carrera 56 #11-36, Cali"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-dotted border-tinta/20 py-2.5 last:border-b-0"
          >
            <span className="text-[13px] text-tinta/60">{label}</span>
            <span className="text-right font-mono text-[13px] font-bold text-tinta">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-tinta/15 bg-papel px-5 py-4">
        <Stamp tone="sello" className="stamp-press">
          Registro SECOP II
        </Stamp>
        <Link
          href="/mapa"
          className="text-[13px] font-semibold text-sello underline-offset-4 hover:underline"
        >
          Abrir en el mapa
        </Link>
      </div>
    </figure>
  );
}

export function HeroSection() {
  return (
    <section id="inicio" className="bg-papel">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-sello">
              SECOP II · Santiago de Cali · Expediente abierto
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-tinta sm:text-[3.4rem]">
              Cada obra de Cali tiene un contrato. Aquí lees si avanza.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-tinta/75">
              Leímos 1.433 contratos de obra de SECOP II y los pusimos en
              un mapa. Si pasas frente a una obra, confirmas cómo va. Tu
              reporte sostiene el reconocimiento de quien cumple.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/mapa">
                  <MapPinned className="h-4 w-4" />
                  Ver mapa de Cali
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#para-organizaciones">
                  <Building2 className="h-4 w-4" />
                  Para organizaciones
                </a>
              </Button>
            </div>
          </div>

          <FichaEjemplo />
        </div>

        <dl className="mt-14 border-t-2 border-tinta/70">
          {LEDGER.map((row) => (
            <div
              key={row.figure}
              className="flex flex-col gap-1 border-b border-tinta/15 py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <dt className="shrink-0 font-mono text-lg font-bold tabular-nums text-tinta sm:w-40">
                {row.figure}
              </dt>
              <dd className="text-[15px] text-tinta/70">{row.text}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <a
            href="#mapa-ciudadano"
            className="inline-flex items-center gap-2 text-sm font-medium text-tinta/60 underline-offset-4 transition-colors hover:text-sello hover:underline"
          >
            <ArrowDown className="h-4 w-4" />
            Ver las obras por municipio
          </a>
        </div>
      </div>
    </section>
  );
}
