import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchBusinesses, createBusiness } from "@/lib/db/queries/businesses";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { processBusinessImagesForCloudinary } from "@/lib/cloudinary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse all query params
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const subcategory = searchParams.get("subcategory") || undefined;
  const country = searchParams.get("country") || searchParams.get("countryName") || undefined;
  const city = searchParams.get("city") || searchParams.get("cityName") || undefined;
  const cityId = searchParams.get("cityId") || undefined;
  const subcityId = searchParams.get("subcityId") || undefined;
  const ownerId = searchParams.get("ownerId") || undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  const verified = searchParams.get("verified") === "true" ? true : undefined;
  const status = searchParams.get("status") || undefined;
  const minRating = searchParams.get("minRating")
    ? Number(searchParams.get("minRating"))
    : undefined;
  const priceTier = searchParams.get("priceTier") || undefined;
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined;
  const radiusKm = searchParams.get("radiusKm")
    ? Number(searchParams.get("radiusKm"))
    : undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const sort = searchParams.get("sort") || "relevance";
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;
  const exportMode = searchParams.get("export") === "true";
  const effectiveLimit = exportMode ? 5000 : limit;

  try {
    const result = await searchBusinesses({
      q,
      category,
      subcategory,
      country,
      city,
      cityId,
      subcityId,
      featured,
      verified,
      minRating,
      priceTier,
      status,
      lat,
      lng,
      radiusKm,
      page: exportMode ? 1 : page,
      limit: effectiveLimit,
      sort,
      ids,
      ownerId,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /businesses GET]", error);
    // Graceful fallback to seed data during development
    let results = [...SEED_BUSINESSES];
    if (featured) results = results.filter((b) => b.isFeatured);
    if (ownerId) results = results.filter((b) => b.ownerId === ownerId);
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);
    const totalPages = Math.max(1, Math.ceil(results.length / limit));
    return NextResponse.json({
      total: results.length,
      page,
      limit,
      totalPages,
      businesses: paginated,
      success: true,
    });
  }
}

export async function POST(request: Request) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch (e) {
    userId = null;
  }

  try {
    const rawBody = await request.json();
    const ownerId = userId || rawBody.ownerId || `user_biz_${Date.now()}`;
    const isSubmitAdmin = Boolean(rawBody.isAdmin);

    // Process any base64 images through Cloudinary before saving
    const body = await processBusinessImagesForCloudinary(rawBody);

    const business = await createBusiness({
      ...body,
      ownerId,
      approvalStatus: body.approvalStatus || (isSubmitAdmin ? "approved" : "pending_city"),
      isApproved: body.isApproved !== undefined ? body.isApproved : (isSubmitAdmin ? true : false),
      isPublished: body.isPublished !== undefined ? body.isPublished : (isSubmitAdmin ? true : false),
      isVerified: body.isVerified !== undefined ? body.isVerified : (isSubmitAdmin ? true : false),
    });

    // Dispatch Multi-Tier Confirmation Alerts for Super Admin, Country Admin & City Admin
    try {
      const { dispatchBusinessConfirmationNotifications } = await import(
        "@/lib/notifications/business-confirmation"
      );
      const { getUserByClerkId } = await import("@/lib/db/queries/users");

      let ownerProfile: any = null;
      if (userId) {
        ownerProfile = await getUserByClerkId(userId).catch(() => null);
      }

      await dispatchBusinessConfirmationNotifications({
        business,
        ownerInfo: {
          id: ownerId,
          name: ownerProfile?.name || body.ownerName || body.name + " Submitter",
          email: ownerProfile?.email || body.email,
          phone: ownerProfile?.phone || body.telephone || body.mobile,
        },
        submissionType: body.submissionType || "wizard",
      });
    } catch (e) {
      console.error("Failed to dispatch confirmation notifications:", e);
    }

    const response = NextResponse.json({ business, success: true }, { status: 201 });
    // Fast-upgrade cookie so user is recognized as owner immediately
    response.cookies.set("bizfinder_role", "owner", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[API /businesses POST]", error);
    return NextResponse.json({ error: error.message || "Failed to create business in MongoDB" }, { status: 500 });
  }
}
