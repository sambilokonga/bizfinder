import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAnalytics, createAnalyticsEvent } from "@/lib/db/queries/analytics";
import { AnalyticsEventType, AnalyticsDeviceType } from "@/types/analytics";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "20")); // 20 per page default
    const eventType = searchParams.get("type") || searchParams.get("eventType") || undefined;
    const businessId = searchParams.get("businessId") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const city = searchParams.get("city") || undefined;
    const country = searchParams.get("country") || undefined;
    const sort = (searchParams.get("sort") as "asc" | "desc") || "desc";

    const result = await getAnalytics({
      page,
      limit,
      eventType,
      businessId,
      search,
      city,
      country,
      sort,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /analytics GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      eventType = "view",
      businessId,
      businessName,
      userId,
      userName,
      userRole,
      city = "Addis Ababa",
      country = "Ethiopia",
      searchTerm,
      device = "mobile",
      browser,
      os,
      ip,
      duration,
      metadata,
      registeredBy,
      batchCount = 1,
    } = body;

    const validTypes: AnalyticsEventType[] = [
      "view",
      "search",
      "click_phone",
      "click_direction",
      "click_website",
      "favorite",
      "share",
      "ad_click",
      "review",
    ];

    if (!validTypes.includes(eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid eventType '${eventType}'. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Optional clerk user context
    let clerkUser: string | null = null;
    try {
      const authObj = await auth();
      clerkUser = authObj?.userId || null;
    } catch (_) {}

    const result = await createAnalyticsEvent({
      id,
      eventType,
      businessId,
      businessName: businessName?.trim(),
      userId: userId || clerkUser || undefined,
      userName: userName?.trim(),
      userRole,
      city: city.trim(),
      country: country.trim(),
      searchTerm: searchTerm?.trim(),
      device: device as AnalyticsDeviceType,
      browser,
      os,
      ip,
      duration: duration ? Number(duration) : undefined,
      metadata,
      registeredBy: registeredBy || (clerkUser ? `User (${clerkUser})` : "client_telemetry"),
      batchCount: Number(batchCount) || 1,
    });

    return NextResponse.json({
      success: true,
      data: result,
      count: Array.isArray(result) ? result.length : 1,
      message: "Analytics event successfully registered",
    });
  } catch (error: any) {
    console.error("[API /analytics POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register analytics event" },
      { status: 500 }
    );
  }
}
