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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: businessId } = await params;

  try {
    const clerkUser = await currentUser();
    const body = await request.json();
    const { rating, comment, photos } = body;

    if (!rating || !comment) {
      return NextResponse.json({ error: "rating and comment are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
    }
    if (comment.trim().length < 20) {
      return NextResponse.json({ error: "comment must be at least 20 characters" }, { status: 400 });
    }

    const alreadyReviewed = await hasUserReviewedBusiness(userId, businessId);
    if (alreadyReviewed) {
      return NextResponse.json({ error: "You have already reviewed this business" }, { status: 409 });
    }

    const review = await createReview({
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      businessId,
      userId,
      userName: clerkUser?.fullName || clerkUser?.emailAddresses[0]?.emailAddress || "Anonymous",
      userAvatar: clerkUser?.imageUrl,
      rating: Number(rating),
      comment: comment.trim(),
      photos: photos ?? [],
    });

    // Recalculate business rating aggregate
    await recalculateBusinessRating(businessId);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("[API /businesses/[id]/reviews POST]", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
