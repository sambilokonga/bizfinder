import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAdCampaignsByOwner,
  createAdCampaign,
} from "@/lib/db/queries/ads";
import { getBusinessById } from "@/lib/db/queries/businesses";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const result = await getAdCampaignsByOwner(userId, { page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /ads/campaigns GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      businessId,
      businessName,
      name,
      placement,
      targetLocation,
      dailyBudgetETB,
      durationDays,
      startDate,
      // Caller can supply these directly; if absent we resolve from the business
      cityName: bodyCity,
      countryName: bodyCountry,
    } = body;

    if (!businessId || !name || !placement || !dailyBudgetETB || !durationDays) {
      return NextResponse.json(
        { error: "Missing required campaign fields" },
        { status: 400 }
      );
    }

    // Resolve geo fields — prefer caller-supplied, otherwise look up from business
    let resolvedCity = bodyCity || "";
    let resolvedCountry = bodyCountry || "";
    if ((!resolvedCity || !resolvedCountry) && businessId) {
      try {
        const biz = await getBusinessById(businessId);
        if (biz) {
          resolvedCity = resolvedCity || biz.cityName || "";
          resolvedCountry = resolvedCountry || biz.countryName || "";
        }
      } catch (_) {
        // non-fatal — geo fields will remain empty string
      }
    }

    const campaign = await createAdCampaign({
      id: `camp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ownerId: userId,
      businessId,
      businessName: businessName || "My Business",
      name,
      placement,
      targetLocation: targetLocation || "All Sub-Cities",
      dailyBudgetETB: Number(dailyBudgetETB),
      durationDays: Number(durationDays),
      startDate: startDate || new Date().toISOString().split("T")[0],
      cityName: resolvedCity,
      countryName: resolvedCountry,
    });

    // Dispatch multi-tier ad notifications across Super Admin, Country Admin, City Admin, and Owner
    try {
      const { dispatchAdCampaignNotifications } = await import(
        "@/lib/notifications/ad-campaign"
      );
      await dispatchAdCampaignNotifications({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          businessName: campaign.businessName,
          businessId: campaign.businessId,
          ownerId: campaign.ownerId,
          placement: campaign.placement,
          dailyBudgetETB: campaign.dailyBudgetETB,
          cityName: campaign.cityName,
          countryName: campaign.countryName,
          targetLocation: campaign.targetLocation,
        },
      });
    } catch (notifErr) {
      console.warn("[API /ads/campaigns POST] Failed to dispatch ad notifications:", notifErr);
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("[API /ads/campaigns POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
