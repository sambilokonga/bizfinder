import { NextResponse } from "next/server";
import { getFeaturedBusinesses } from "@/lib/db/queries/businesses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") || "4", 10);
    const limit = isNaN(limitParam) ? 4 : Math.min(Math.max(1, limitParam), 12);

    const businesses = await getFeaturedBusinesses(limit);

    return NextResponse.json(
      {
        success: true,
        businesses,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/businesses/featured]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch featured businesses" },
      { status: 500 }
    );
  }
}
