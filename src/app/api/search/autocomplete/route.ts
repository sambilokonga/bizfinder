import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { BusinessModel } from "@/lib/db/models/Business";
import { docToBusiness } from "@/lib/db/queries/businesses";
import {
  performMultiFacetSearch,
  KNOWN_BUILDINGS,
} from "@/lib/search/multi-facet-search";
import { SearchOptionScope } from "@/types/search";
import { Business } from "@/types/business";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const scope = (searchParams.get("scope") as SearchOptionScope) || "all";
  const limit = Math.min(Number(searchParams.get("limit") || "12"), 25);

  if (!q.trim()) {
    return NextResponse.json({
      query: "",
      results: [],
      total: 0,
      scope,
    });
  }

  let dbBusinesses: Business[] = [];
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const regex = { $regex: q.trim(), $options: "i" };
      const rawDocs = await BusinessModel.find({
        $or: [
          { name: regex },
          { categoryName: regex },
          { subcategoryName: regex },
          { cityName: regex },
          { addressLine: regex },
          { building: regex },
          { "services.name": regex },
          { "branches.name": regex },
          { "branches.branchCode": regex },
          { "branches.building": regex },
        ],
      })
        .limit(20)
        .lean();

      dbBusinesses = rawDocs.map((d: any) => docToBusiness(d));
    }
  } catch (error) {
    // If DB read fails, continue gracefully with in-memory seed dataset
  }

  const results = performMultiFacetSearch({
    query: q,
    scope,
    limit,
    customBusinesses: dbBusinesses.length > 0 ? dbBusinesses : undefined,
  });

  return NextResponse.json({
    query: q,
    scope,
    total: results.length,
    results,
  });
}
