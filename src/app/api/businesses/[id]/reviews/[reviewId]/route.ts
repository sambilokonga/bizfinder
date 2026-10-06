import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getReviewById,
  postOwnerReply,
  flagReview,
  deleteReview,
} from "@/lib/db/queries/reviews";
import { getBusinessById } from "@/lib/db/queries/businesses";

interface Params {
  params: Promise<{ id: string; reviewId: string }>;
}

// PATCH: owner reply or flag action
export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: businessId, reviewId } = await params;
  const body = await request.json();
  const { action, comment, ownerName } = body;

  try {
    if (action === "reply") {
      const business = await getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return NextResponse.json({ error: "Forbidden — only the business owner can reply" }, { status: 403 });
      }
      const review = await postOwnerReply(reviewId, {
        ownerId: userId,
        ownerName: ownerName || business.name,
        comment,
      });
      return NextResponse.json({ review });
    }

    if (action === "flag") {
      const review = await flagReview(reviewId);
      return NextResponse.json({ review });
    }

    return NextResponse.json({ error: "Invalid action. Use 'reply' or 'flag'" }, { status: 400 });
  } catch (error: any) {
    console.error("[API /businesses/[id]/reviews/[reviewId] PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: remove a review (admin or review author)
export async function DELETE(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reviewId } = await params;

  try {
    const review = await getReviewById(reviewId);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Allow review author or business owner to delete
    if (review.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteReview(reviewId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
