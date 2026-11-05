import { getObraPorId } from "@/lib/mapa/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

function diasEntre(fechaInicio: string, fechaFin: string): number {
  const ini = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return Math.max(0, Math.round((fin.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24)));
}

function diasRestantes(fechaFin: string | null): { dias: number; vencido: boolean } | null {
  if (!fechaFin) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  const dias = Math.round((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  return { dias, vencido: dias < 0 };
}

function estadoBadge(cumple: boolean, textoOk: string, textoMal: string) {
  return (
    <span
      className={`px-3 py-1.5 text-[12px] font-bold rounded border ${
        cumple
          ? "bg-verde/10 text-verde border border-verde/20"
          : "bg-alerta/10 text-alerta border border-alerta/20"
      }`}
    >
      {cumple ? textoOk : textoMal}
    </span>
  );
}

export default async function InformeCumplimientoPage({
  params,
}: {
  params: Promise<{ id_contrato: string }>;
}) {
  const { id_contrato } = await params;
  const obra = await getObraPorId(id_contrato);
  if (!obra) notFound();

  const valor = obra.valor ?? 0;
  const pagado = obra.valor_pagado ?? 0;
  const pendienteEjecucion = obra.valor_pendiente_ejecucion ?? 0;
  const pctPagado = valor > 0 ? Math.round((pagado / valor) * 100) : 0;
  const pctPendiente = valor > 0 ? Math.round((pendienteEjecucion / valor) * 100) : 0;

  const plazo = diasRestantes(obra.fecha_fin ?? "");
  const plazoVencido = plazo ? plazo.vencido : null;
  const plazoDias = plazo ? Math.abs(plazo.dias) : null;

  const cumplePlazo = plazoVencido === false;
  const cumplePresupuesto = pctPagado >= 80;
  const cumple = cumplePlazo && cumplePresupuesto;

  return (
    <main className="min-h-screen flex flex-col bg-papel">
      <nav className="border-b border-tinta/70 bg-papel/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <a
                href="/mapa"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sello hover:text-sello/80 transition-colors"
              >
                Volver al mapa
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={obra.url_secop || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-tinta/60 underline-offset-4 hover:text-sello hover:underline"
              >
                Ver en SECOP II
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-tinta/70 pb-6">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sello">
              Informe de cumplimiento · Obra pública
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-tinta mt-1">
              {obra.descripcion || "Obra pública"}
            </h1>
            <p className="text-sm text-tinta/60 mt-1">
              Contrato <span className="font-mono">{obra.id_contrato}</span> ·
              <span className="font-mono">{obra.referencia || "-"}</span>
            </p>
          </div>

          <div className="flex items-end gap-2">
            {estadoBadge(cumple, "Cumple", "No cumple")}
          </div>
        </div>

        {/* Datos de la obra */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Datos de la obra</CardTitle>
            <CardDescription>
              Contratación pública de Cali — fuente: SECOP II
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Entidad</p>
              <p className="text-sm text-tinta">{obra.entidad_nombre || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Contratista</p>
              <p className="text-sm text-tinta">{obra.contratista || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Valor del contrato</p>
              <p className="text-sm font-semibold text-tinta">
                ${new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(valor)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Estado</p>
              <p className="text-sm text-tinta">{obra.estado || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Fecha de firma</p>
              <p className="text-sm text-tinta">{obra.fecha_firma || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Fecha de inicio</p>
              <p className="text-sm text-tinta">{obra.fecha_inicio || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-tinta/50 uppercase">Fecha fin prevista</p>
              <p className="text-sm text-tinta">{obra.fecha_fin || "-"}</p>
            </div>
            {obra.barrio || obra.comuna ? (
              <div className="space-y-2">
                <p className="text-xs font-mono text-tinta/50 uppercase">Ubicación</p>
                <p className="text-sm text-tinta">
                  {obra.barrio || "-"} {obra.comuna ? `· Comuna ${obra.comuna}` : ""}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Cumplimiento */}
        <section className="space-y-6">
          <h2 className="font-display text-xl font-semibold text-tinta">Cumplimiento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plazo */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Plazo de ejecución</CardTitle>
                {estadoBadge(cumplePlazo, "Al día", plazoVencido === true ? "Vencido" : "Sin fecha")}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {plazo && plazoDias !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-tinta">
                        {plazoVencido === true ? "-" : ""}
                        {plazoDias} días
                      </span>
                      <span className="text-sm text-tinta/60">
                        {plazoVencido === true ? "retrasados" : "restantes"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-tinta/60">Sin fecha fin registrada</p>
                  )}
                  <p className="text-xs text-tinta/50">
                    Fin previsto:{obra.fecha_fin || "—"} ·
                    {diasEntre(obra.fecha_inicio ?? "", obra.fecha_fin ?? "")} días de contrato
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Presupuesto */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Ejecución presupuestal</CardTitle>
                {estadoBadge(cumplePresupuesto, "Al día", "Retraso")}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <Progress value={Math.min(100, pctPagado)} className="h-3" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-tinta">{pctPagado}%</span>
                    <span className="text-sm text-tinta/60">ejecutado</span>
                  </div>
                  <div className="flex items-baseline gap-2 text-xs text-tinta/50">
                    <span className="font-mono">
                      ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(pagado)}
                    </span>
                    <span className="text-sello">pagado de</span>
                    <span className="font-mono">
                      ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(valor)}
                    </span>
                  </div>
                  {pendienteEjecucion > 0 && (
                    <p className="text-xs text-alerta/70 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(pendienteEjecucion)} pendiente de ejecución
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Conclusión */}
        <Card className={`border-2 ${cumple ? "border-verde/40" : "border-alerta/40"}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              {cumple ? <CheckCircle2 className="h-5 w-5 text-verde" /> : <AlertCircle className="h-5 w-5 text-alerta" />}
              Conclusión del informe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-tinta leading-relaxed">
              El contratista <span className="font-semibold">{obra.contratista}</span>
              {" "}
              {cumple
                ? "va al día en los plazos y en la ejecución presupuestal registrada en SECOP II."
                : "presenta desviaciones en plazos y/o ejecución presupuestal según SECOP II."}
              Esta información sirve para supervisar la obra y respaldar la decisión de contratación.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-tinta/60 underline-offset-4 hover:text-sello hover:underline transition-colors"
              >
                Buscar otra obra
              </a>
              <a
                href="/#para-organizaciones"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-tinta/60 underline-offset-4 hover:text-sello hover:underline transition-colors"
              >
                Solicitar informe piloto
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
