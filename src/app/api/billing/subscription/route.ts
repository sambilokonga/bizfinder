import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdPlanByBusiness } from "@/lib/db/queries/ads";
import { getPayments } from "@/lib/db/queries/payments";
import { GLOBALBIZ_SUBSCRIPTION_PLANS } from "@/types/billing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  try {
    let activePlanTier = "starter";
    let planDoc = null;
    let lastPayment = null;

    if (businessId) {
      planDoc = await getAdPlanByBusiness(businessId);
      if (planDoc && planDoc.isActive) {
        activePlanTier = planDoc.tier === "spotlight" ? "enterprise" : planDoc.tier;
      }

      // Fetch latest payment for this business
      const paymentsRes = await getPayments({
        businessId,
        limit: 5,
      });
      if (paymentsRes.payments && paymentsRes.payments.length > 0) {
        lastPayment = paymentsRes.payments[0];
        // If payment was completed for pro or enterprise, ensure tier reflects it
        if (
          lastPayment.status === "completed" &&
          lastPayment.metadata?.tier
        ) {
          activePlanTier = lastPayment.metadata.tier;
        }
      }
    }

    const matchedPlan =
      GLOBALBIZ_SUBSCRIPTION_PLANS.find((p) => p.tier === activePlanTier) ||
      GLOBALBIZ_SUBSCRIPTION_PLANS[0];

    return NextResponse.json({
      success: true,
      currentPlan: matchedPlan,
      planDoc,
      lastPayment,
      renewalDate: planDoc?.expiresAt
        ? new Date(planDoc.expiresAt).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error("[API /billing/subscription GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
