import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getReviewsForBusiness,
  createReview,
  hasUserReviewedBusiness,
} from "@/lib/db/queries/reviews";
import { recalculateBusinessRating } from "@/lib/db/queries/businesses";
import { SEED_REVIEWS } from "@/lib/db/seed-data/businesses";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  try {
    const result = await getReviewsForBusiness(id, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    // Fallback to seed reviews
    const seedReviews = SEED_REVIEWS.filter((r) => r.businessId === id);
    return NextResponse.json({ total: seedReviews.length, page: 1, limit: 10, reviews: seedReviews });
  }
}

export async function POST(request: Request, { params }: Params) {
  let clerkUserId: string | null = null;
  let clerkUser: any = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
    if (clerkUserId) {
      clerkUser = await currentUser().catch(() => null);
    }
  } catch (e) {
    clerkUserId = null;
  }

  const { id: businessId } = await params;

  try {
    const body = await request.json();
    const { rating, comment, photos, userName, userAvatar, cityName, countryName, businessName } = body;

    const effectiveUserId = clerkUserId || body.userId || `user-citizen-${Date.now().toString(36)}`;

    if (!rating || !comment) {
      return NextResponse.json({ error: "rating and comment are required" }, { status: 400 });
    }
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
    }
    if (comment.trim().length < 5) {
      return NextResponse.json({ error: "comment must be at least 5 characters" }, { status: 400 });
    }

    if (clerkUserId) {
      const alreadyReviewed = await hasUserReviewedBusiness(clerkUserId, businessId);
      if (alreadyReviewed) {
        return NextResponse.json({ error: "You have already reviewed this business" }, { status: 409 });
      }
    }

    // Resolve business name and location
    let resolvedName = businessName;
    let resolvedCity = cityName;
    let resolvedCountry = countryName;

    if (!resolvedName || !resolvedCity || !resolvedCountry) {
      try {
        const { BusinessModel } = await import("@/lib/db/models/Business");
        const bizDoc = (await BusinessModel.findOne(
          { id: businessId },
          "name cityName city countryName country"
        ).lean()) as any;
        if (bizDoc) {
          if (!resolvedName) resolvedName = bizDoc.name;
          if (!resolvedCity) resolvedCity = bizDoc.cityName || bizDoc.city;
          if (!resolvedCountry) resolvedCountry = bizDoc.countryName || bizDoc.country;
        }
      } catch (e) {}
    }

    if (!resolvedName || !resolvedCity || !resolvedCountry) {
      try {
        const { globalCityRegistry } = await import("@/lib/data/city-business-registry");
        const regBiz = globalCityRegistry.getBusinessById(businessId);
        if (regBiz) {
          if (!resolvedName) resolvedName = regBiz.name;
          if (!resolvedCity) resolvedCity = regBiz.cityName || (regBiz as any).city;
          if (!resolvedCountry) resolvedCountry = regBiz.countryName || (regBiz as any).country;
        }
      } catch (e) {}
    }

    const cleanCity = resolvedCity || "Addis Ababa";
    const cleanCountry = resolvedCountry || "Ethiopia";

    const review = await createReview({
      id: `rev-${cleanCity.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      businessId,
      businessName: resolvedName || "Registered Business",
      cityName: cleanCity,
      countryName: cleanCountry,
      userId: effectiveUserId,
      userName:
        clerkUser?.fullName ||
        clerkUser?.emailAddresses?.[0]?.emailAddress ||
        userName?.trim() ||
        "Verified Citizen",
      userAvatar: clerkUser?.imageUrl || userAvatar,
      rating: numRating,
      comment: comment.trim(),
      photos: photos ?? [],
      status: "published",
      timeframeType: "recent",
      isVerifiedCitizen: true,
    });

    // Recalculate business rating aggregate
    await recalculateBusinessRating(businessId).catch(() => {});

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error("[API /businesses/[id]/reviews POST]", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
