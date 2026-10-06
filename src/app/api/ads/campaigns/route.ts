import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAdCampaignsByOwner,
  createAdCampaign,
} from "@/lib/db/queries/ads";

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
    } = body;

    if (!businessId || !name || !placement || !dailyBudgetETB || !durationDays) {
      return NextResponse.json(
        { error: "Missing required campaign fields" },
        { status: 400 }
      );
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
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("[API /ads/campaigns POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
