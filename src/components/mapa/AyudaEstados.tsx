"use client";

import { useState } from "react";
import { CircleHelp, X } from "lucide-react";

const EXPLICACION_ESTADO: Record<string, string> = {
  "en ejecución": "La obra está en plena ejecución según el cronograma oficial.",
  aprobado: "Fue aprobado y está listo para ejecutarse (contratista designado).",
  terminado:
    "La obra terminó: finalizó su ejecución. SECOP la guarda en minúsculas.",
  liquidado:
    "Se liquidó el contrato: cerró administrativa y financieramente.",
  cancelado: "El contrato se canceló antes de completarse.",
  borrador: "Proceso en borrador: aún no se publica como oficial.",
  cerrado: "El proceso cerró a nuevas propuestas.",
  suspendido: "La ejecución está suspendida temporalmente.",
  modificado:
    "El contrato tuvo cambios (prórrogas, adiciones u otros) frente a su versión original.",
  "enviado proveedor": "Enviado al proveedor: etapa inicial de gestión.",
  "en aprobación":
    "El documento está pendiente de aprobación interna.",
};

function explicar(estado: string): string {
  const clave = estado.trim().toLowerCase();
  return (
    EXPLICACION_ESTADO[clave] ??
    "Estado publicado por SECOP II; consulta el contrato oficial para detalles."
  );
}

interface AyudaEstadosProps {
  estados: string[];
}

export function AyudaEstados({ estados }: AyudaEstadosProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="¿Qué significa cada estado?"
        title="¿Qué significa cada estado?"
        className="rounded-full text-tinta/45 transition-colors hover:bg-tinta/10 hover:text-tinta"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>

      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar ayuda"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-[4px] border border-tinta/20 bg-papel p-3 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-tinta/60">
                Estados SECOP
              </p>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar ayuda"
                className="rounded p-0.5 text-tinta/45 hover:bg-tinta/10 hover:text-tinta"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {estados.map((estado) => (
                <li key={estado} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 rounded-[3px] border border-tinta/15 bg-ficha px-1.5 py-0.5 font-mono text-[11px] font-bold text-tinta/80">
                    {estado}
                  </span>
                  <span className="text-[11px] leading-snug text-tinta/70">
                    {explicar(estado)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </span>
  );
}