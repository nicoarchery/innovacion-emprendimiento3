import { NextResponse } from "next/server";

import { MUNICIPALITIES } from "@/lib/data";

type LeadCitizenBody = {
  contact?: string;
  municipality?: string;
  projects?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadCitizenBody;
    const { contact, municipality, projects } = body;

    if (!contact?.trim() || !municipality?.trim()) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    if (!MUNICIPALITIES.includes(municipality as (typeof MUNICIPALITIES)[number])) {
      return NextResponse.json(
        { error: "Municipio no soportado" },
        { status: 400 }
      );
    }

    console.log("[LEAD CIUDADANO CAPTURADO]:", {
      contact: contact.trim(),
      municipality,
      projects: projects ?? [],
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Registro ciudadano recibido exitosamente",
    });
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido" },
      { status: 400 }
    );
  }
}