import { NextResponse } from "next/server";
import { getActiveSponsoredBusinessIds } from "@/lib/db/queries/ads";
import { searchBusinesses } from "@/lib/db/queries/businesses";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "4");

  try {
    const sponsoredIds = await getActiveSponsoredBusinessIds(limit);

    if (sponsoredIds.length === 0) {
      // Fallback to top featured businesses
      const result = await searchBusinesses({
        featured: true,
        limit,
      } as any);
      return NextResponse.json({ sponsoredBusinesses: result.businesses });
    }

    const result = await searchBusinesses({
      ids: sponsoredIds,
      limit,
    } as any);

    return NextResponse.json({ sponsoredBusinesses: result.businesses });
  } catch (error: any) {
    console.error("[API /ads/sponsored GET]", error);
    return NextResponse.json({ sponsoredBusinesses: [] });
  }
}
