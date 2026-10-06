import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAdCampaignById,
  updateCampaignStatus,
  incrementAdMetrics,
  deleteAdCampaign,
} from "@/lib/db/queries/ads";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { status, action } = body;

  try {
    // If public action is click/impression tracking
    if (action === "impression" || action === "click") {
      await incrementAdMetrics(id, action === "impression" ? "impressions" : "clicks");
      return NextResponse.json({ success: true });
    }

    // Owner action (pause/resume)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaign = await getAdCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) {
      const updated = await updateCampaignStatus(id, status);
      return NextResponse.json({ campaign: updated });
    }

    return NextResponse.json({ error: "No valid update provided" }, { status: 400 });
  } catch (error: any) {
    console.error("[API /ads/campaigns/[id] PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaign = await getAdCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteAdCampaign(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /ads/campaigns/[id] DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

