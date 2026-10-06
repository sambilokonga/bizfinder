import { NextResponse } from "next/server";
import { getPaymentById, updatePaymentStatus } from "@/lib/db/queries/payments";
import { PaymentStatus } from "@/types/payment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await getPaymentById(id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error("[API /payments/[id] GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve payment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await updatePaymentStatus(id, status as PaymentStatus, notes);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Payment record not found to update" },
        { status: 404 }
      );
    }

    // If status became completed, activate the business and apply verified perks
    if (status === "completed" && updated.businessId) {
      try {
        const { updateBusiness } = await import("@/lib/db/queries/businesses");
        const tier = updated.metadata?.tier || "pro";
        await updateBusiness(updated.businessId, {
          status: "open",
          isVerified: tier === "pro" || tier === "enterprise",
          isFeatured: tier === "enterprise",
        });

        const { upsertAdPlan } = await import("@/lib/db/queries/ads");
        await upsertAdPlan({
          id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          businessId: updated.businessId,
          ownerId: updated.registeredBy || "owner",
          tier: tier === "enterprise" ? "spotlight" : tier === "pro" ? "pro" : "starter",
          billingCycle: updated.metadata?.billingCycle || "monthly",
          amountETB: updated.amount,
          amountUSD: Math.round(updated.amount / 120),
          txId: updated.id,
          provider: (updated.provider === "bank_transfer" ? "card" : updated.provider) as any,
        });
      } catch (bizErr) {
        console.warn("[Payments PATCH] Error auto-activating business:", bizErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment: updated,
    });
  } catch (error: any) {
    console.error("[API /payments/[id] PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update payment" },
      { status: 500 }
    );
  }
}
