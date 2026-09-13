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
    title: "Ingesta Pública (SECOP II)",
    description:
      "Sincronización continua con la API abierta de datos.gov.co (SODA) para auditar contratos de infraestructura, presupuestos y cronogramas oficiales de proyectos de impacto.",
  },
  {
    icon: Satellite,
    step: "02",
    title: "Auditoría Territorial (App Offline)",
    description:
      "Captura de evidencia física con fotografías georreferenciadas, metadatos EXIF y marcas de tiempo, procesada por veedurías y comunidades incluso sin conexión a internet.",
  },
  {
    icon: Cpu,
    step: "03",
    title: "Motor de Brecha (Gap Analysis)",
    description:
      "Cálcula la desviación entre la ejecución registrada en SECOP II y la evidencia físicamente validada. Si supera el 15%, se activa una alerta de riesgo territorial.",
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
            Un motor de brechas con tres fuentes de verdad
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cruzamos el dato oficial, el reporte empresarial y la evidencia de
            campo para revelar la diferencia entre lo que se dice y lo que
            realmente se ejecuta.
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