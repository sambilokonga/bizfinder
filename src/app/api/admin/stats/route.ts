import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminStats } from "@/lib/db/queries/businesses";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;

    const stats = await getAdminStats({ country, city });
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("[API /admin/stats GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
