import { NextRequest, NextResponse } from "next/server";
import { fetchSecopContracts } from "@/lib/secop";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const department = searchParams.get("department") || undefined;
  const municipality = searchParams.get("municipality") || undefined;
  const search = searchParams.get("search") || undefined;
  const limitStr = searchParams.get("limit");
  const limit = limitStr ? parseInt(limitStr, 10) : 15;

  try {
    const contracts = await fetchSecopContracts({
      department,
      municipality,
      search,
      limit,
    });

    const totalValue = contracts.reduce((acc, c) => acc + c.contractValue, 0);
    const atRiskCount = contracts.filter((c) => c.atRisk).length;

    return NextResponse.json({
      success: true,
      count: contracts.length,
      stats: {
        totalValue,
        atRiskCount,
        onTrackCount: contracts.length - atRiskCount,
      },
      data: contracts,
    });
  } catch (error) {
    console.error("[SECOP_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error consultando datos de contratación SECOP II" },
      { status: 500 }
    );
  }
}
