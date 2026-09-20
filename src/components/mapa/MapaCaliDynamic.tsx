"use client";

import dynamic from "next/dynamic";

const MapaCali = dynamic(
  () => import("@/components/mapa/MapaCali").then((m) => m.MapaCali),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-sm text-tinta/55">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sello border-t-transparent" />
        Cargando mapa…
      </div>
    ),
  }
);

export function MapaCaliDynamic() {
  return <MapaCali />;
}