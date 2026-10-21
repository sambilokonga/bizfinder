import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/db/queries/settings";
import { connectToDatabase } from "@/lib/db/mongodb";
import { BusinessModel } from "@/lib/db/models/Business";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let country = searchParams.get("country") || undefined;
    let city = searchParams.get("city") || undefined;
    const businessId = searchParams.get("businessId") || undefined;

    // If businessId is provided without explicit country/city, resolve from business
    if (businessId && (!country || !city)) {
      try {
        await connectToDatabase();
        const biz: any = await BusinessModel.findOne(
          { $or: [{ id: businessId }, { _id: businessId }] },
          { countryName: 1, cityName: 1 }
        ).lean();

        if (biz) {
          if (!country && biz.countryName) country = biz.countryName;
          if (!city && biz.cityName) city = biz.cityName;
        }
      } catch (err) {
        console.warn("[API /api/settings] Failed to lookup business geo:", err);
      }
    }

    const scope = city ? "city" : country ? "country" : "global";
    const settings = await getSystemSettings({
      scope,
      country: country && country !== "all" ? country : undefined,
      city: city && city !== "all" ? city : undefined,
    });

    return NextResponse.json({
      success: true,
      settings,
      effectiveJurisdiction: {
        scope,
        country: country || null,
        city: city || null,
      },
    });
  } catch (error: any) {
    console.error("[API /api/settings GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
