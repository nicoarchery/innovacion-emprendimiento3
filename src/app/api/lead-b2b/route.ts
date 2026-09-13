import { NextResponse } from "next/server";

const BLOCKED_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "msn.com",
];

type LeadB2bBody = {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  sector?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadB2bBody;
    const { name, email, company, role, sector } = body;

    if (!name?.trim() || !email?.trim() || !company?.trim()) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const domain = email.trim().split("@")[1]?.toLowerCase() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Formato de correo inválido" },
        { status: 400 }
      );
    }
    if (!domain || BLOCKED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: "Se requiere un correo corporativo" },
        { status: 400 }
      );
    }

    console.log("[LEAD B2B CAPTURADO]:", {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      role,
      sector,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Lead registrado exitosamente",
    });
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido" },
      { status: 400 }
    );
  }
}