import {
  Cpu,
  DatabaseZap,
  Satellite,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [
  {
    icon: DatabaseZap,
    step: "01",
    title: "Lee el contrato oficial",
    description:
      "Traemos valor, contratista, fechas y estado desde SECOP II (datos.gov.co). Cada ficha cita su fuente.",
  },
  {
    icon: Satellite,
    step: "02",
    title: "Confirma en terreno",
    description:
      "Reportas el avance con foto, fecha y ubicación. Validamos tu reporte antes de publicarlo.",
  },
  {
    icon: Cpu,
    step: "03",
    title: "Otorga el reconocimiento",
    description:
      "Las obras al día muestran sello público. Las obras con diferencia mayor a 15% quedan marcadas para revisión.",
  },
];

export function VerificationSection() {
  return (
    <section id="como-funciona" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Cómo funciona
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Tres pasos para reconocer con base verificable
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tú consultas. La entidad publica. La comunidad confirma.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <Card key={step} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-700 text-emerald-50">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-4xl font-extrabold text-emerald-100">
                    {step}
                  </span>
                </div>
                <CardTitle className="pt-4 text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}