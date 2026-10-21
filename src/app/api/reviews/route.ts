import { NextResponse } from "next/server";
import {
  getAllReviews,
  createReview,
  updateReviewStatus,
  postOwnerReply,
  deleteReview,
} from "@/lib/db/queries/reviews";
import { createNotification } from "@/lib/db/queries/notifications";
import { globalCityRegistry, CityReviewItem } from "@/lib/data/city-business-registry";

function getRegistryFallbackResponse(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") || "20"));
  const status = searchParams.get("status") || "all";
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const city = searchParams.get("city") || undefined;
  const country = searchParams.get("country") || undefined;
  const timeframeType = searchParams.get("timeframeType") || undefined;

  let allItems: CityReviewItem[] = [];
  if (city && city !== "all") {
    allItems = globalCityRegistry.getReviewsForCity(city, country || "all");
  } else if (country && country !== "all") {
    allItems = globalCityRegistry.getReviewsForCountry(country);
  } else {
    allItems = globalCityRegistry.getAllReviewsGlobal();
  }

  // Base scope for counting
  const baseList = [...allItems];

  // Apply filters
  let filtered = [...allItems];

  if (timeframeType && timeframeType !== "all") {
    filtered = filtered.filter((r) => r.timeframeType === timeframeType);
  }

  if (status && status !== "all") {
    if (status === "pending") filtered = filtered.filter((r) => r.status === "pending");
    else if (status === "reported") filtered = filtered.filter((r) => r.status === "reported");
    else if (status === "removed") filtered = filtered.filter((r) => r.status === "removed");
    else if (status === "published") filtered = filtered.filter((r) => r.status === "published");
    else if (status === "replies") filtered = filtered.filter((r) => Boolean(r.reply?.comment));
    else if (status === "historical") filtered = filtered.filter((r) => r.timeframeType === "historical");
    else if (status === "recent") filtered = filtered.filter((r) => r.timeframeType === "recent");
    else if (status === "future_scheduled") filtered = filtered.filter((r) => r.timeframeType === "future_scheduled");
  }

  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.userName?.toLowerCase().includes(search) ||
        r.comment?.toLowerCase().includes(search) ||
        r.businessName?.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    success: true,
    reviews: paginated,
    total,
    page,
    totalPages,
    limit,
    counts: {
      all: baseList.length,
      published: baseList.filter((r) => r.status === "published").length,
      pending: baseList.filter((r) => r.status === "pending").length,
      reported: baseList.filter((r) => r.status === "reported").length,
      removed: baseList.filter((r) => r.status === "removed").length,
      replies: baseList.filter((r) => Boolean(r.reply?.comment)).length,
      historical: baseList.filter((r) => r.timeframeType === "historical").length,
      recent: baseList.filter((r) => r.timeframeType === "recent").length,
      future_scheduled: baseList.filter((r) => r.timeframeType === "future_scheduled").length,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || undefined;
  const country = searchParams.get("country") || undefined;

  try {
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const businessId = searchParams.get("businessId") || undefined;
    const ratingParam = searchParams.get("rating");
    const rating = ratingParam ? Number(ratingParam) : undefined;

    const result = await getAllReviews({
      page,
      limit,
      status,
      search,
      businessId,
      rating,
      city,
      country,
    });

    const fallback = getRegistryFallbackResponse(searchParams);
    const dbReviews = result && Array.isArray(result.reviews) ? result.reviews : [];

    // Merge fallback registry reviews and live DB reviews (live DB reviews take precedence)
    const reviewMap = new Map<string, any>();
    (fallback.reviews || []).forEach((r: any) => reviewMap.set(r.id, r));
    dbReviews.forEach((r: any) => reviewMap.set(r.id, r));

    const combinedList = Array.from(reviewMap.values());
    const total = Math.max(result?.total || 0, fallback.total, combinedList.length);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;
    const paginated = combinedList.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      reviews: paginated,
      total,
      page,
      totalPages,
      limit,
      counts: {
        all: Math.max(result?.counts?.all || 0, fallback.counts.all),
        published: Math.max(result?.counts?.published || 0, fallback.counts.published),
        pending: Math.max(result?.counts?.pending || 0, fallback.counts.pending),
        reported: Math.max(result?.counts?.reported || 0, fallback.counts.reported),
        removed: Math.max(result?.counts?.removed || 0, fallback.counts.removed),
        replies: Math.max(result?.counts?.replies || 0, fallback.counts.replies),
        historical: fallback.counts.historical,
        recent: Math.max(result?.counts?.published || 0, fallback.counts.recent),
        future_scheduled: fallback.counts.future_scheduled,
      },
    });
  } catch (error: any) {
    console.error("[API /api/reviews GET]", error);
    const fallback = getRegistryFallbackResponse(searchParams);
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessId,
      businessName,
      cityName,
      countryName,
      userName,
      userAvatar,
      rating,
      comment,
      photos,
      status,
      userId,
      timeframeType,
      createdAt,
      dateFormatted,
      isVerifiedCitizen,
    } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: "Business ID is required" },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Comment must be at least 5 characters long" },
        { status: 400 }
      );
    }

    const cleanCity = cityName || "Addis Ababa";
    const cleanCountry = countryName || "Ethiopia";
    const newId = `rev-${cleanCity.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    // createReview persists to MongoDB, syncs with globalCityRegistry, and dispatches multi-tier notifications
    const review = await createReview({
      id: newId,
      businessId,
      businessName: businessName || `${cleanCity} Business`,
      cityName: cleanCity,
      countryName: cleanCountry,
      userId: userId || `user-${Date.now()}`,
      userName: userName?.trim() || "Verified Citizen",
      userAvatar:
        userAvatar ||
        `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
      rating: numRating,
      comment: comment.trim(),
      photos: Array.isArray(photos) ? photos : [],
      status: status || "published",
      timeframeType,
      createdAt: createdAt || new Date().toISOString(),
      dateFormatted,
      isVerifiedCitizen: isVerifiedCitizen !== undefined ? Boolean(isVerifiedCitizen) : true,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error("[API /api/reviews POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register review" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.reviewId;
    const { action, status, reply } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    let updatedReview: any = null;

    if (reply && typeof reply.comment === "string") {
      updatedReview = globalCityRegistry.addReviewReply(id, {
        ownerName: reply.ownerName || "Business Management",
        comment: reply.comment.trim(),
      });
      try {
        await postOwnerReply(id, {
          ownerId: reply.ownerId,
          ownerName: reply.ownerName || "Business Management",
          comment: reply.comment.trim(),
        });
      } catch (dbErr) {}
    } else if (status) {
      updatedReview = globalCityRegistry.updateReviewStatus(id, status);
      try {
        await updateReviewStatus(id, status);
      } catch (dbErr) {}
    } else if (action) {
      let mappedStatus: "published" | "reported" | "removed" = "published";
      if (action === "approve" || action === "publish" || action === "restore") {
        mappedStatus = "published";
      } else if (action === "report" || action === "flag") {
        mappedStatus = "reported";
      } else if (action === "hide" || action === "remove") {
        mappedStatus = "removed";
      } else {
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
      }
      updatedReview = globalCityRegistry.updateReviewStatus(id, mappedStatus);
      try {
        await updateReviewStatus(id, mappedStatus);
      } catch (dbErr) {}
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error: any) {
    console.error("[API /api/reviews PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id || body.reviewId;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    const regDeleted = globalCityRegistry.deleteReview(id);
    let dbDeleted = false;
    try {
      dbDeleted = await deleteReview(id);
    } catch (e) {}

    const success = regDeleted || dbDeleted;
    return NextResponse.json({ success, deleted: success });
  } catch (error: any) {
    console.error("[API /api/reviews DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
