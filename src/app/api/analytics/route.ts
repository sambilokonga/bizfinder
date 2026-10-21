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
      city,
      country,
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

    // Resolve true business city and country
    let resolvedCity = (city || "").trim();
    let resolvedCountry = (country || "").trim();
    let resolvedBizName = (businessName || "").trim();
    let resolvedBizId = (businessId || "").trim();

    try {
      const { getBusinessById } = await import("@/lib/db/queries/businesses");
      const { BusinessModel } = await import("@/lib/db/models/Business");
      let foundBiz: any = null;

      if (resolvedBizId) {
        foundBiz = await getBusinessById(resolvedBizId);
        if (!foundBiz) {
          foundBiz = await BusinessModel.findOne({
            $or: [{ id: resolvedBizId }, { slug: resolvedBizId }],
          }).lean().catch(() => null);
        }
        if (!foundBiz) {
          const { SEED_BUSINESSES } = await import("@/lib/db/seed-data/businesses");
          foundBiz = SEED_BUSINESSES.find(
            (b) => b.id === resolvedBizId || b.slug === resolvedBizId
          );
        }
      } else if (resolvedBizName) {
        // If no businessId was given but businessName was provided, match business by name
        const escaped = resolvedBizName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        foundBiz = await BusinessModel.findOne({
          name: { $regex: new RegExp(`^${escaped}$`, "i") },
        }).lean().catch(() => null);
        if (!foundBiz) {
          const { SEED_BUSINESSES } = await import("@/lib/db/seed-data/businesses");
          foundBiz = SEED_BUSINESSES.find(
            (b) => b.name.toLowerCase() === resolvedBizName.toLowerCase()
          );
        }
      }

      if (foundBiz) {
        if (!resolvedBizId && foundBiz.id) resolvedBizId = foundBiz.id;
        if (!resolvedBizName && foundBiz.name) resolvedBizName = foundBiz.name;
        // Business location is the canonical ground truth for listing telemetry
        if (foundBiz.cityName) resolvedCity = foundBiz.cityName;
        else if (foundBiz.city) resolvedCity = foundBiz.city;
        if (foundBiz.countryName) resolvedCountry = foundBiz.countryName;
        else if (foundBiz.country) resolvedCountry = foundBiz.country;
      }
    } catch (e) {
      console.warn("[Analytics API] Error resolving business territory:", e);
    }

    if (!resolvedCity) resolvedCity = (city || "").trim() || "Addis Ababa";
    if (!resolvedCountry) resolvedCountry = (country || "").trim() || "Ethiopia";

    const result = await createAnalyticsEvent({
      id,
      eventType,
      businessId: resolvedBizId || undefined,
      businessName: resolvedBizName || undefined,
      userId: userId || clerkUser || undefined,
      userName: userName?.trim(),
      userRole,
      city: resolvedCity,
      country: resolvedCountry,
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

    // Auto-register actual global visitor telemetry if business interaction
    try {
      const actionMap: Record<string, any> = {
        view: "view",
        click_phone: "call",
        click_direction: "direction",
        click_website: "website",
        favorite: "saved",
        share: "share",
      };
      if (businessName && actionMap[eventType]) {
        const { registerGlobalVisitor } = await import("@/lib/analytics/globalVisitors");
        const forwardedFor = request.headers.get("x-forwarded-for");
        const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : ip || "198.51.100.45";

        await registerGlobalVisitor({
          visitorType: "actual",
          visitorName: userName?.trim() || (clerkUser ? `Customer (${clerkUser.slice(0, 8)})` : "Global Web Visitor"),
          visitorCountry: country?.trim() || "United States",
          visitorCity: city?.trim() || "Washington, D.C.",
          visitorDevice: device === "desktop" ? "Chrome Desktop (macOS)" : "Mobile Safari (iOS 18)",
          visitorIp: clientIp,
          targetBusinessId: businessId,
          targetBusinessName: businessName.trim(),
          targetBusinessCity: city?.trim() || "Addis Ababa",
          targetBusinessCountry: country?.trim() || "Ethiopia",
          action: actionMap[eventType] || "view",
          purpose: `Live user interaction (${eventType}) on ${businessName}`,
          status: "active",
          registeredBy: "Live Telemetry Tracker",
          referrer: request.headers.get("referer") || "Direct Web Navigation",
        });
      }
    } catch (trackErr) {
      console.warn("[Analytics POST] Auto-global-visitor registration error:", trackErr);
    }

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
