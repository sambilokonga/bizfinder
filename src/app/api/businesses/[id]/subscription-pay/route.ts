import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordBusinessSubscriptionPayment } from "@/lib/audit/four-month-engine";
import { createPayment } from "@/lib/db/queries/payments";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getBusinessById } from "@/lib/db/queries/businesses";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let clerkUserId: string | null = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult?.userId ?? null;
  } catch {
    clerkUserId = null;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const business = await getBusinessById(id);
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found." }, { status: 404 });
    }

    let payerName = body.payerName || "Business Owner";
    let payerEmail = body.payerEmail || business.email;
    let payerPhone = body.payerPhone || business.telephone || business.mobile;

    if (clerkUserId) {
      const dbUser = await getUserByClerkId(clerkUserId).catch(() => null);
      if (dbUser) {
        payerName = dbUser.name || payerName;
        payerEmail = dbUser.email || payerEmail;
        payerPhone = dbUser.phone || payerPhone;
      }
    }

    const amount = Number(body.amount || 1499);
    const currency = body.currency || "ETB";
    const provider = body.provider || "telebirr";
    const reference = body.reference || `SUB-4M-${Date.now().toString().slice(-6)}`;

    // Create payment ledger record
    await createPayment({
      id: `TX-SUB-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId: business.id,
      businessName: business.name,
      cityName: business.cityName,
      countryName: business.countryName,
      payerName,
      payerEmail,
      payerPhone,
      amount,
      currency: currency as any,
      provider: provider as any,
      paymentType: "subscription",
      status: "completed",
      reference,
      description: `4-Month Subscription Fee - "${business.name}"`,
      metadata: {
        cycle: "4-month",
        businessId: business.id,
        businessName: business.name,
        processedAt: new Date().toISOString(),
      },
      registeredBy: clerkUserId ? `User (${clerkUserId})` : "Self-Serve Portal",
    });

    const result = await recordBusinessSubscriptionPayment(id, {
      payerName,
      amount,
      currency,
      provider,
      reference,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      business: result.business,
    });
  } catch (error: any) {
    console.error("[API /businesses/[id]/subscription-pay POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process subscription payment." },
      { status: 500 }
    );
  }
}
