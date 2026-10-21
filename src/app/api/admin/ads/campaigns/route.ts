import { NextResponse } from "next/server";
import {
  getAllAdCampaigns,
  createAdCampaign,
  updateCampaignStatusAdmin,
  deleteAdCampaign,
} from "@/lib/db/queries/ads";

// GET all campaigns (admin, paginated, filterable by status)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "all";
  const city = searchParams.get("city") || undefined;
  const country = searchParams.get("country") || undefined;

  try {
    const result = await getAllAdCampaigns({ page, limit, status, city, country });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[API /admin/ads/campaigns GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — admin creates a campaign directly (no auth restriction for super admin flow)
export async function POST(request: Request) {
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
      cityName,
      countryName,
    } = body;

    if (!businessName || !name || !placement || !dailyBudgetETB || !durationDays) {
      return NextResponse.json(
        { error: "Missing required campaign fields" },
        { status: 400 }
      );
    }

    const campaign = await createAdCampaign({
      id: `camp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ownerId: businessId || "admin-created",
      businessId: businessId || `biz-${Date.now()}`,
      businessName: businessName.trim(),
      name: name.trim(),
      placement,
      targetLocation: targetLocation || "All Locations",
      dailyBudgetETB: Number(dailyBudgetETB),
      durationDays: Number(durationDays),
      startDate: startDate || new Date().toISOString().split("T")[0],
      cityName: cityName || "",
      countryName: countryName || "",
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
      console.warn("[API /admin/ads/campaigns POST] Failed to dispatch ad notifications:", notifErr);
    }

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error: any) {
    console.error("[API /admin/ads/campaigns POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update campaign status (active/paused/completed)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }
    const updated = await updateCampaignStatusAdmin(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error("[API /admin/ads/campaigns PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — permanently remove a campaign
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    const deleted = await deleteAdCampaign(id);
    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /admin/ads/campaigns DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
