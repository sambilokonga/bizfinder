import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { upsertAdPlan, getAdPlanByBusiness } from "@/lib/db/queries/ads";
import { updateBusiness } from "@/lib/db/queries/businesses";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  try {
    const plan = await getAdPlanByBusiness(businessId);
    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("[API /ads/plans GET]", error);
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
      tier,
      billingCycle,
      amountETB,
      amountUSD,
      txId,
      provider,
    } = body;

    if (!businessId || !tier || !txId || !provider) {
      return NextResponse.json(
        { error: "Missing plan subscription details" },
        { status: 400 }
      );
    }

    const plan = await upsertAdPlan({
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      businessId,
      ownerId: userId,
      tier,
      billingCycle: billingCycle || "monthly",
      amountETB: Number(amountETB || 0),
      amountUSD: Number(amountUSD || 0),
      txId,
      provider,
    });

    // Update business verified / featured status based on plan tier
    if (tier === "pro" || tier === "spotlight") {
      await updateBusiness(businessId, {
        isVerified: true,
        ...(tier === "spotlight" ? { isFeatured: true } : {}),
      });
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error: any) {
    console.error("[API /ads/plans POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
