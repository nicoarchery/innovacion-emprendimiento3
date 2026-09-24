import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { SecopExplorer } from "@/components/SecopExplorer";
import { RankingContratistas } from "@/components/RankingContratistas";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Explorador de obras de Cali | Consulta ciudadana",
  description:
    "Todas las obras públicas de Santiago de Cali, tengan o no ubicación. Revisa datos SECOP II y participa con reportes ciudadanos.",
};

export default function ExploradorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-papel">
      <NavBar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb / Regreso */}
        <div className="flex items-center gap-2 font-mono text-xs text-tinta/55">
          <Link
            href="/"
            className="flex items-center gap-1 underline-offset-4 hover:text-sello hover:underline transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la portada
          </Link>
          <span>/</span>
          <span className="font-bold text-tinta">
            Explorador
          </span>
        </div>

        {/* Encabezado del Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-tinta/70 pb-5">
          <div>
            <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sello">
              SECOP II · Cali
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-tinta">
              Explorador de obras públicas
            </h1>
            <p className="text-sm text-tinta/65 mt-1 max-w-2xl">
              Todas las obras de Santiago de Cali con datos SECOP II, tengan o
              no ubicación. Filtra por estado, búsqueda y reportes ciudadanos.
            </p>
          </div>
        </div>

        {/* Explorador Interactivo */}
        <SecopExplorer />

        {/* Ranking de reputación de contratistas */}
        <RankingContratistas />
      </div>

      <Footer />
      <Toaster />
    </main>
  );
}
