import { NextResponse } from "next/server";
import {
  getAllReviews,
  createReview,
  updateReviewStatus,
  postOwnerReply,
  deleteReview,
} from "@/lib/db/queries/reviews";
import { createNotification } from "@/lib/db/queries/notifications";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/reviews GET]", error);
    // Graceful in-memory fallback with full pagination support
    const { SEED_REVIEWS, SEED_BUSINESSES } = await import("@/lib/db/seed-data/businesses");
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "20"));
    const status = searchParams.get("status") || "all";
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    let filtered = [...SEED_REVIEWS];
    if (status === "pending") filtered = filtered.filter((r) => r.status === "pending");
    else if (status === "reported") filtered = filtered.filter((r) => r.status === "reported" || r.isFlagged);
    else if (status === "removed") filtered = filtered.filter((r) => r.status === "removed");

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.userName?.toLowerCase().includes(search) ||
          r.comment?.toLowerCase().includes(search) ||
          (r as any).businessName?.toLowerCase().includes(search)
      );
    }

    const bMap = new Map<string, string>();
    SEED_BUSINESSES.forEach((b) => bMap.set(b.id, b.name));

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit).map((r) => ({
      ...r,
      businessName: (r as any).businessName || bMap.get(r.businessId) || "Verified Business",
    }));

    return NextResponse.json({
      success: true,
      reviews: paginated,
      total,
      page,
      totalPages,
      limit,
      counts: {
        all: SEED_REVIEWS.length,
        published: SEED_REVIEWS.filter((r) => r.status !== "removed" && !r.isFlagged).length,
        pending: SEED_REVIEWS.filter((r) => r.status === "pending").length,
        reported: SEED_REVIEWS.filter((r) => r.status === "reported" || r.isFlagged).length,
        removed: SEED_REVIEWS.filter((r) => r.status === "removed").length,
        replies: SEED_REVIEWS.filter((r) => Boolean(r.reply?.comment)).length,
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessId,
      businessName,
      userName,
      userAvatar,
      rating,
      comment,
      photos,
      status,
      userId,
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

    const newId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const review = await createReview({
      id: newId,
      businessId,
      businessName,
      userId: userId || `user-${Date.now()}`,
      userName: userName?.trim() || "Verified Customer",
      userAvatar:
        userAvatar ||
        `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&w=120&q=80`,
      rating: numRating,
      comment: comment.trim(),
      photos: Array.isArray(photos) ? photos : [],
      status: status || "published",
    });

    // Auto-create real notification for the business owner
    try {
      const stars = "⭐".repeat(numRating);
      await createNotification({
        title: `${stars} New Review: ${businessName || "Your Business"}`,
        body: `${userName?.trim() || "A customer"} left a ${numRating}-star rating: "${comment.trim().slice(0, 100)}${comment.length > 100 ? "..." : ""}"`,
        target: "business",
        targetBusinessId: businessId,
        type: "review",
        priority: numRating <= 2 ? "high" : "medium",
        sentBy: userName?.trim() || "Customer Review",
        link: `/dashboard?tab=reviews`,
      });
    } catch (notifErr) {
      console.warn("[Reviews] Failed to dispatch review notification:", notifErr);
    }

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

    let updatedReview = null;

    if (reply && typeof reply.comment === "string") {
      updatedReview = await postOwnerReply(id, {
        ownerId: reply.ownerId,
        ownerName: reply.ownerName || "Business Management",
        comment: reply.comment.trim(),
      });
    } else if (status) {
      updatedReview = await updateReviewStatus(id, status);
    } else if (action) {
      if (action === "approve" || action === "publish" || action === "restore") {
        updatedReview = await updateReviewStatus(id, "published");
      } else if (action === "report" || action === "flag") {
        updatedReview = await updateReviewStatus(id, "reported");
      } else if (action === "hide" || action === "remove") {
        updatedReview = await updateReviewStatus(id, "removed");
      } else {
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
      }
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

    const success = await deleteReview(id);
    return NextResponse.json({ success, deleted: success });
  } catch (error: any) {
    console.error("[API /api/reviews DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
