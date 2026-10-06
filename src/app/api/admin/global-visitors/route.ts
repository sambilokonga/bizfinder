import { NextResponse } from "next/server";
import { getGlobalVisitorsTelemetry } from "@/lib/analytics/globalVisitors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;

    const data = await getGlobalVisitorsTelemetry({
      country,
      city,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API /admin/global-visitors GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch global visitors telemetry" },
      { status: 500 }
    );
  }
}
