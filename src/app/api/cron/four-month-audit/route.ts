import { NextResponse } from "next/server";
import {
  collectAndDispatchFourMonthAlerts,
  collectBusinessesDueForFourMonthReview,
} from "@/lib/audit/four-month-engine";

/**
 * GET /api/cron/four-month-audit
 * Standard cron trigger endpoint (compatible with Vercel Cron, external crons, or manual triggers).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceTest = searchParams.get("forceTest") === "true";
    const dryRun = searchParams.get("dryRun") === "true";
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;

    const result = await collectAndDispatchFourMonthAlerts({
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
    console.error("[CRON /api/cron/four-month-audit GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run 4-month audit cron job." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/four-month-audit
 * Manual or webhook trigger with json body options.
 */
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
    console.error("[CRON /api/cron/four-month-audit POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute 4-month audit." },
      { status: 500 }
    );
  }
}
