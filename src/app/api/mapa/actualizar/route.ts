import { NextResponse } from "next/server";
import { totalObras, ultimaSync } from "@/lib/mapa/db";
import { estaSincronizando, syncMapa } from "@/lib/mapa/syncService";

export async function POST() {
  if (estaSincronizando()) {
    return NextResponse.json(
      { success: false, error: "Ya hay una actualización del mapa en curso" },
      { status: 409 }
    );
  }

  try {
    const resultado = await syncMapa();
    return NextResponse.json({
      success: true,
      resultado,
      totales: totalObras(),
      ultimaSync: ultimaSync(),
    });
  } catch (error) {
    console.error("[API_MAPA_ACTUALIZAR_ERROR]", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}