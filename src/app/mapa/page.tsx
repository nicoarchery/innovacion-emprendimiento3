import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { MapaCaliDynamic } from "@/components/mapa/MapaCaliDynamic";

export const metadata: Metadata = {
  title: "Mapa de obras de Cali | Consulta ciudadana",
  description:
    "Filtra contratos de obra de Cali desde SECOP II por estado, entidad, valor y año. La ubicación es aproximada.",
};

export default function MapaPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <NavBar />
      <MapaCaliDynamic />
      <Footer />
      <Toaster />
    </main>
  );
}