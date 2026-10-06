import { NextResponse } from "next/server";
import {
  collectBusinessesDueForFourMonthReview,
  collectAndDispatchFourMonthAlerts,
} from "@/lib/audit/four-month-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceTestAll = searchParams.get("forceTest") === "true";
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;
    const limit = parseInt(searchParams.get("limit") || "200", 10);

    const summary = await collectBusinessesDueForFourMonthReview({
      forceTestAll,
      filterCountry: country,
      filterCity: city,
      limit,
    });

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error("[API /admin/audit-cycle GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit cycle data." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      businessIds,
      forceTest = false,
      dryRun = false,
      country,
      city,
    } = body;

    const result = await collectAndDispatchFourMonthAlerts({
      businessIds,
      forceTest,
      dryRun,
      filterCountry: country,
      filterCity: city,
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error("[API /admin/audit-cycle POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger audit cycle." },
      { status: 500 }
    );
  }
}
