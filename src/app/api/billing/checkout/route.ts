import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createPayment } from "@/lib/db/queries/payments";
import { createBusiness, updateBusiness, getBusinessById } from "@/lib/db/queries/businesses";
import { upsertAdPlan } from "@/lib/db/queries/ads";
import { CheckoutRequestPayload } from "@/types/billing";

export async function POST(request: Request) {
  try {
    let userId: string | null = null;
    try {
      const authObj = await auth();
      userId = authObj?.userId || null;
    } catch (_) {
      userId = null;
    }

    const body: CheckoutRequestPayload = await request.json();

    const {
      businessId,
      businessName,
      newBusiness,
      planId,
      tier,
      billingCycle,
      currency,
      amount,
      paymentMethod,
      payerName,
      payerPhone,
      payerEmail,
      telebirrPhone,
      cbeAccountNumber,
      mpesaPhone,
      cardDetails,
      receiptUrl,
      bankReference,
      depositedAccount,
    } = body;

    if (!planId || !tier || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Missing required plan or payment information." },
        { status: 400 }
      );
    }

    let activeBusinessId = businessId;
    let activeBusinessName = businessName || "My Business";
    let createdBusiness = null;

    // 1. Generate transaction reference and IDs
    const providerPrefixMap: Record<string, string> = {
      telebirr: "TEL",
      cbebirr: "CBE",
      mpesa: "MPE",
      card: "CRD",
      bank_transfer: "BNK",
    };
    const prefix = providerPrefixMap[paymentMethod] || "PAY";
    const randomTx = Math.floor(100000 + Math.random() * 900000);
    const txId = `TX-${prefix}-${randomTx}`;

    const isManualBank = paymentMethod === "bank_transfer";
    const paymentStatus = isManualBank ? "pending" : "completed";

    // 2. If registering a new business upon payment completion
    if (newBusiness && newBusiness.name) {
      const businessData = {
        name: newBusiness.name.trim(),
        categoryId: newBusiness.categoryId || "cat-general",
        categoryName: newBusiness.categoryName || "General Services",
        countryName: newBusiness.countryName || "Ethiopia",
        cityName: newBusiness.cityName || "Addis Ababa",
        subcityName: newBusiness.subcityName,
        addressLine: newBusiness.addressLine || "Main Road",
        telephone: newBusiness.telephone,
        mobile: newBusiness.mobile || payerPhone,
        email: newBusiness.email || payerEmail,
        description: newBusiness.description || `Registered on ${new Date().toLocaleDateString()}`,
        status: "open" as const,
        isVerified: tier === "pro" || tier === "enterprise",
        isFeatured: tier === "enterprise",
        ownerId: userId || `owner_${Date.now()}`,
        registrationDate: new Date().toISOString(),
        validationDate: new Date().toISOString(),
        subscriptionStatus: paymentStatus === "completed" ? "active" : "pending",
        lastSubscriptionPaidAt: paymentStatus === "completed" ? new Date().toISOString() : undefined,
        nextAuditDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      };

      createdBusiness = await createBusiness(businessData as any);
      if (createdBusiness) {
        activeBusinessId = createdBusiness.id;
        activeBusinessName = createdBusiness.name;
      }
    } else if (activeBusinessId) {
      // 3. Existing business upgrade
      const existing = await getBusinessById(activeBusinessId);
      if (existing) {
        activeBusinessName = existing.name;
        await updateBusiness(activeBusinessId, {
          isVerified: tier === "pro" || tier === "enterprise" ? true : existing.isVerified,
          isFeatured: tier === "enterprise" ? true : existing.isFeatured,
          status: "open",
          subscriptionStatus: paymentStatus === "completed" ? "active" : "due",
          lastSubscriptionPaidAt: paymentStatus === "completed" ? new Date().toISOString() : existing.lastSubscriptionPaidAt,
          nextAuditDate: paymentStatus === "completed"
            ? new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
            : existing.nextAuditDate,
        });
      }
    }

    // 4. Create Payment Record in Database
    const payment = await createPayment({
      id: txId,
      businessId: activeBusinessId,
      businessName: activeBusinessName,
      payerName: payerName || "Business Owner",
      payerPhone: payerPhone || telebirrPhone || mpesaPhone,
      payerEmail: payerEmail,
      amount: Number(amount || 0),
      currency: currency || "ETB",
      provider: paymentMethod as any,
      paymentType: "subscription",
      status: paymentStatus,
      reference:
        bankReference ||
        `${prefix}-REF-${Date.now().toString().slice(-8)}`,
      description: `${tier.toUpperCase()} Plan Subscription (${billingCycle || "monthly"}) - ${activeBusinessName}`,
      metadata: {
        planId,
        tier,
        billingCycle,
        depositedAccount: depositedAccount || (isManualBank ? "1000377050917" : undefined),
        receiptUrl,
        telebirrPhone,
        cbeAccountNumber,
        mpesaPhone,
        cardLast4: cardDetails?.last4,
        cardBrand: cardDetails?.brand,
        processedAt: new Date().toISOString(),
      },
      registeredBy: userId ? `Owner (${userId})` : "Portal Checkout",
    });

    // 5. Update Ad/Subscription Plan
    if (activeBusinessId) {
      try {
        await upsertAdPlan({
          id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          businessId: activeBusinessId,
          ownerId: userId || "anonymous_owner",
          tier: tier === "enterprise" ? "spotlight" : tier === "pro" ? "pro" : "starter",
          billingCycle: (billingCycle as any) || "monthly",
          amountETB: currency === "ETB" ? amount : amount * 120,
          amountUSD: currency === "USD" ? amount : Math.round(amount / 120),
          txId,
          provider: paymentMethod === "bank_transfer" ? "card" : (paymentMethod as any),
        });
      } catch (planErr) {
        console.warn("[Checkout] Error upserting ad plan:", planErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isManualBank
        ? "Transfer receipt received! Your payment and registration are under review and will be verified."
        : "Payment completed successfully and your business has been registered/upgraded!",
      payment,
      businessId: activeBusinessId,
      businessName: activeBusinessName,
      business: createdBusiness,
    });
  } catch (error: any) {
    console.error("[API /billing/checkout POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
