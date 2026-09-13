import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { SecopExplorer } from "@/components/SecopExplorer";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Explorador Territorial de Contratos | Impacto Territorial",
  description:
    "Auditoría en tiempo real de contratos de obra pública e infraestructura desde SECOP II vs. evidencias de campo y veedurías ciudadanas.",
};

export default function ExploradorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <NavBar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb / Regreso */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la portada
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">
            Explorador Territorial MVP
          </span>
        </div>

        {/* Encabezado del Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <MapPinned className="h-3.5 w-3.5" />
              <span>Plataforma de Inteligencia Territorial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explorador y Auditoría de Obras en Tiempo Real
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Monitorea el cumplimiento físico de los contratos de obra pública (SECOP II) y proyectos de Obras por Impuestos (OxI). Cruza la promesa jurídica del Estado con el avance real certificado por comunidades y veedurías en territorio.
            </p>
          </div>
        </div>

        {/* Explorador Interactivo */}
        <SecopExplorer />
      </div>

      <Footer />
      <Toaster />
    </main>
  );
}
