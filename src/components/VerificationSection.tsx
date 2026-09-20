import { Cpu, DatabaseZap, Satellite } from "lucide-react";

const STEPS = [
  {
    icon: DatabaseZap,
    numeral: "1",
    title: "Lees el contrato oficial",
    description:
      "Valor, contratista, fechas y estado salen de SECOP II. Cada ficha enlaza su fuente en datos.gov.co.",
  },
  {
    icon: Satellite,
    numeral: "2",
    title: "Confirmas en terreno",
    description:
      "Reportas lo que ves con foto, fecha y ubicación. Revisamos cada reporte antes de publicarlo.",
  },
  {
    icon: Cpu,
    numeral: "3",
    title: "Sostienes el reconocimiento",
    description:
      "Las obras al día llevan sello público. Si la diferencia con SECOP II pasa de 15%, la obra queda marcada para revisión.",
  },
];

export function VerificationSection() {
  return (
    <section id="como-funciona" className="bg-ficha">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-tinta sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-3 text-lg text-tinta/70">
            Lees la ficha, pasas por la obra y dejas constancia.
          </p>
        </div>

        <ol className="mt-10 border-t-2 border-tinta/70">
          {STEPS.map(({ icon: Icon, numeral, title, description }) => (
            <li
              key={numeral}
              className="grid gap-3 border-b border-tinta/15 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-8"
            >
              <span className="font-mono text-sm font-bold tabular-nums text-sello">
                {numeral}.
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-tinta">
                  {title}
                </h3>
                <p className="mt-1.5 max-w-xl leading-relaxed text-tinta/70">
                  {description}
                </p>
              </div>
              <span className="hidden h-10 w-10 items-center justify-center border border-tinta/20 text-tinta/60 sm:flex">
                <Icon className="h-5 w-5" />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
