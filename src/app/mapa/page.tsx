import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { MapaCaliDynamic } from "@/components/mapa/MapaCaliDynamic";

export const metadata: Metadata = {
  title: "Mapa de Obras Públicas de Cali | Impacto Territorial",
  description:
    "Mapa interactivo de obras públicas de Cali identificadas desde SECOP II con ubicación georreferenciada (fuente SECOP + geocodificación).",
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