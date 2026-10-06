import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPayments, createPayment } from "@/lib/db/queries/payments";
import { createNotification } from "@/lib/db/queries/notifications";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "20"));
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const status = searchParams.get("status") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const businessId = searchParams.get("businessId") || undefined;
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;
    const sort = (searchParams.get("sort") as "asc" | "desc") || "desc";

    const result = await getPayments({
      page,
      limit,
      search,
      status,
      provider,
      businessId,
      country,
      city,
      sort,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /payments GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      businessId,
      businessName,
      cityName,
      countryName,
      payerName,
      payerEmail,
      payerPhone,
      amount,
      currency,
      provider,
      paymentType,
      status,
      reference,
      description,
      metadata,
      registeredBy,
    } = body;

    if (!businessName || !amount || !provider) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment fields: businessName, amount, provider are required.",
        },
        { status: 400 }
      );
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    // Optional clerk user context
    let clerkUser = null;
    try {
      const { userId } = await auth();
      clerkUser = userId;
    } catch (_) {}

    const newPayment = await createPayment({
      id,
      businessId,
      businessName: businessName.trim(),
      cityName: cityName?.trim(),
      countryName: countryName?.trim(),
      payerName: (payerName || "Business Owner").trim(),
      payerEmail: payerEmail?.trim(),
      payerPhone: payerPhone?.trim(),
      amount: Number(amount),
      currency: currency || "ETB",
      provider,
      paymentType: paymentType || "subscription",
      status: status || "completed",
      reference: reference?.trim(),
      description: description?.trim(),
      metadata,
      registeredBy: registeredBy || (clerkUser ? `User (${clerkUser})` : "Super Admin"),
    });

    // Auto-create billing notification for the business
    try {
      await createNotification({
        title: `💳 Payment Processed: ${Number(amount).toLocaleString()} ${currency || "ETB"}`,
        body: `Your payment of ${Number(amount).toLocaleString()} ${currency || "ETB"} via ${provider.toUpperCase()} (${paymentType || "subscription"}) has been confirmed. Ref: ${reference || "Verified"}.`,
        target: "business",
        targetBusinessId: businessId,
        type: "payment",
        priority: "medium",
        sentBy: "Billing System",
        link: `/dashboard?tab=billing`,
      });
    } catch (notifErr) {
      console.warn("[Payments] Failed to dispatch billing notification:", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment registered successfully.",
        payment: newPayment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /payments POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register payment" },
      { status: 500 }
    );
  }
}
