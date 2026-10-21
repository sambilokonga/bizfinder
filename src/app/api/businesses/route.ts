import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchBusinesses, createBusiness } from "@/lib/db/queries/businesses";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { processBusinessImagesForCloudinary } from "@/lib/cloudinary";

import { globalCityRegistry } from "@/lib/data/city-business-registry";

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

    if (result && Array.isArray(result.businesses)) {
      if (result.businesses.length > 0 || (result.counts && result.counts.all > 0) || result.total > 0) {
        return NextResponse.json({ ...result, success: true });
      }
    }
    // Database has no businesses for this query, fall through to shared global city registry
  } catch (error) {
    console.error("[API /businesses GET] Fallback to globalCityRegistry:", error);
  }

  // Strict territorial isolation fallback & shared global city registry
  let results: any[] = [];
  if (city && city !== "all") {
    results = globalCityRegistry.getBusinessesForCity(city, country || "Ethiopia");
  } else if (country && country !== "all") {
    results = globalCityRegistry.getBusinessesForCountry(country, city);
  } else {
    results = globalCityRegistry.getAllBusinessesGlobal(country, city);
  }

  if (q) {
    const qLower = q.toLowerCase();
    results = results.filter(
      (b) =>
        b.name.toLowerCase().includes(qLower) ||
        b.categoryName?.toLowerCase().includes(qLower) ||
        b.description?.toLowerCase().includes(qLower) ||
        b.districtName?.toLowerCase().includes(qLower)
    );
  }
  if (category && category !== "all") {
    results = results.filter((b) => b.categoryId === category || b.categoryName === category);
  }
  if (featured) results = results.filter((b) => b.isFeatured);
  if (verified) results = results.filter((b) => b.isVerified);

  // Compute counts for all queues before status filtering
  const allScopedResults = [...results];
  const counts = {
    all: allScopedResults.length,
    confirmations: allScopedResults.filter((b) => b.approvalStatus === "pending_city" || (b as any).existenceStatus === "pending_confirmation").length,
    pending: allScopedResults.filter((b) => !b.isVerified && b.approvalStatus !== "rejected" && b.approvalStatus !== "suspended" && b.approvalStatus !== "pending_city").length,
    verified: allScopedResults.filter((b) => b.isVerified && b.approvalStatus === "approved").length,
    suspended: allScopedResults.filter((b) => b.approvalStatus === "suspended").length,
    rejected: allScopedResults.filter((b) => b.approvalStatus === "rejected").length,
    claimed: allScopedResults.filter((b) => Boolean(b.ownerId)).length,
  };

  if (status === "confirmations" || status === "pending_city" || status === "pending_confirmations") {
    results = results.filter((b) => b.approvalStatus === "pending_city" || (b as any).existenceStatus === "pending_confirmation");
  } else if (status === "pending") {
    results = results.filter((b) => !b.isVerified && b.approvalStatus !== "rejected" && b.approvalStatus !== "suspended" && b.approvalStatus !== "pending_city");
  } else if (status === "verified") {
    results = results.filter((b) => b.isVerified && b.approvalStatus === "approved");
  } else if (status === "rejected") {
    results = results.filter((b) => b.approvalStatus === "rejected");
  } else if (status === "suspended") {
    results = results.filter((b) => b.approvalStatus === "suspended");
  } else if (status === "claims" || status === "claimed") {
    results = results.filter((b) => Boolean(b.ownerId));
  }

  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(results.length / limit));
  return NextResponse.json({
    total: results.length,
    page,
    limit,
    totalPages,
    businesses: paginated,
    counts,
    success: true,
  });
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

    // Also register in shared global city registry
    globalCityRegistry.registerBusiness(business);

    // Immediately register and associate user with business city and country in UserModel
    try {
      const { UserModel } = await import("@/lib/db/models/User");
      const targetCountry = business.countryName || body.countryName || body.country;
      const targetCity = business.cityName || body.cityName || body.city;
      if (ownerId && (targetCountry || targetCity)) {
        await UserModel.findOneAndUpdate(
          { $or: [{ id: ownerId }, { clerkId: ownerId }] },
          {
            $set: {
              ...(targetCountry && { country: targetCountry, assignedCountry: targetCountry }),
              ...(targetCity && { city: targetCity, assignedCity: targetCity }),
              role: "owner",
              updatedAt: new Date(),
            },
            $addToSet: { claimedBusinessIds: business.id },
          }
        );
      }
    } catch (uErr) {
      console.warn("[API /businesses POST] User geo-update warning:", uErr);
    }

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
