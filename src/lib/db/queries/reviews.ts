import { connectToDatabase } from "@/lib/db/mongodb";
import { ReviewModel } from "@/lib/db/models/Review";
import { BusinessModel } from "@/lib/db/models/Business";
import { Review } from "@/types/review";
import { SEED_REVIEWS, SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { recalculateBusinessRating } from "@/lib/db/queries/businesses";

function docToReview(doc: any): Review {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    businessId: obj.businessId,
    businessName: obj.businessName,
    userId: obj.userId,
    userName: obj.userName,
    userAvatar: obj.userAvatar,
    rating: obj.rating,
    comment: obj.comment,
    photos: obj.photos ?? [],
    likesCount: obj.likesCount ?? 0,
    reply: obj.reply?.comment
      ? {
          ownerId: obj.reply.ownerId,
          ownerName: obj.reply.ownerName,
          comment: obj.reply.comment,
          createdAt: obj.reply.createdAt?.toISOString?.() ?? new Date().toISOString(),
        }
      : undefined,
    status: obj.status || (obj.isFlagged ? "reported" : "published"),
    isFlagged: obj.isFlagged ?? false,
    createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function ensureReviewsSeeded() {
  await connectToDatabase();
  const count = await ReviewModel.countDocuments();
  if (count < SEED_REVIEWS.length) {
    console.log("[Reviews Engine] Auto-seeding initial reviews into MongoDB...");
    const businessMap = new Map<string, string>();
    SEED_BUSINESSES.forEach((b) => businessMap.set(b.id, b.name));

    const docsToInsert = SEED_REVIEWS.map((rev) => ({
      id: rev.id,
      businessId: rev.businessId,
      businessName: businessMap.get(rev.businessId) || "Ethiopian Business",
      userId: rev.userId,
      userName: rev.userName,
      userAvatar: rev.userAvatar,
      rating: rev.rating,
      comment: rev.comment,
      photos: rev.photos || [],
      likesCount: rev.likesCount || 0,
      reply: rev.reply
        ? {
            ownerId: rev.reply.ownerId,
            ownerName: rev.reply.ownerName,
            comment: rev.reply.comment,
            createdAt: rev.reply.createdAt ? new Date(rev.reply.createdAt) : new Date(),
          }
        : undefined,
      status: "published",
      isFlagged: false,
      createdAt: rev.createdAt ? new Date(rev.createdAt) : new Date(),
    }));

    try {
      await ReviewModel.insertMany(docsToInsert, { ordered: false });
      console.log(`[Reviews Engine] Seeded ${docsToInsert.length} reviews.`);
    } catch (e) {
      console.warn("[Reviews Engine] Seed note:", e);
    }
  }
}

export interface GetAllReviewsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  businessId?: string;
  rating?: number;
}

export async function getAllReviews(params: GetAllReviewsParams = {}) {
  await connectToDatabase();
  await ensureReviewsSeeded();

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 20);
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};

  if (params.businessId) {
    query.businessId = params.businessId;
  }

  if (params.rating && params.rating >= 1 && params.rating <= 5) {
    query.rating = params.rating;
  }

  if (params.status && params.status !== "all") {
    if (params.status === "pending") {
      query.status = "pending";
    } else if (params.status === "reported") {
      query.$or = [{ status: "reported" }, { isFlagged: true }];
    } else if (params.status === "removed") {
      query.status = "removed";
    } else if (params.status === "published") {
      query.status = "published";
      query.isFlagged = { $ne: true };
    } else if (params.status === "replies") {
      query["reply.comment"] = { $exists: true, $ne: "" };
    }
  }

  if (params.search && params.search.trim()) {
    const sRegex = new RegExp(params.search.trim(), "i");
    const searchConditions = [
      { userName: sRegex },
      { comment: sRegex },
      { businessName: sRegex },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchConditions }];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  const baseScope = params.businessId ? { businessId: params.businessId } : {};

  const [docs, total, countAll, countPublished, countPending, countReported, countRemoved, countReplies] =
    await Promise.all([
      ReviewModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReviewModel.countDocuments(query),
      ReviewModel.countDocuments(baseScope),
      ReviewModel.countDocuments({ ...baseScope, status: "published", isFlagged: { $ne: true } }),
      ReviewModel.countDocuments({ ...baseScope, status: "pending" }),
      ReviewModel.countDocuments({ ...baseScope, $or: [{ status: "reported" }, { isFlagged: true }] }),
      ReviewModel.countDocuments({ ...baseScope, status: "removed" }),
      ReviewModel.countDocuments({ ...baseScope, "reply.comment": { $exists: true, $ne: "" } }),
    ]);

  // If any documents miss businessName, resolve it
  const missingBizIds = docs
    .filter((d: any) => !d.businessName && d.businessId)
    .map((d: any) => d.businessId);

  if (missingBizIds.length > 0) {
    const bizDocs = await BusinessModel.find({ id: { $in: missingBizIds } }, "id name").lean();
    const bMap = new Map<string, string>();
    bizDocs.forEach((b: any) => bMap.set(b.id, b.name));
    docs.forEach((d: any) => {
      if (!d.businessName && bMap.has(d.businessId)) {
        d.businessName = bMap.get(d.businessId);
      }
    });
  }

  return {
    reviews: docs.map(docToReview),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    limit,
    counts: {
      all: countAll,
      published: countPublished,
      pending: countPending,
      reported: countReported,
      removed: countRemoved,
      replies: countReplies,
    },
  };
}

export async function getReviewsForBusiness(
  businessId: string,
  page = 1,
  limit = 20
) {
  return getAllReviews({ businessId, page, limit });
}

export async function getReviewById(id: string): Promise<Review | null> {
  await connectToDatabase();
  const doc = await ReviewModel.findOne({ id }).lean() as any;
  if (!doc) return null;
  return docToReview(doc);
}

export async function createReview(data: {
  id: string;
  businessId: string;
  businessName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  photos?: string[];
  status?: "published" | "pending" | "reported" | "removed";
}): Promise<Review> {
  await connectToDatabase();

  let businessName = data.businessName;
  if (!businessName) {
    const biz = await BusinessModel.findOne({ id: data.businessId }, "name").lean();
    if (biz) businessName = (biz as any).name;
  }

  const doc = await ReviewModel.create({
    ...data,
    businessName,
    status: data.status || "published",
    isFlagged: false,
    likesCount: 0,
  });

  // Automatically recalculate aggregate rating and review count
  try {
    await recalculateBusinessRating(data.businessId);
  } catch (err) {
    console.warn("[createReview] Rating recalculation warning:", err);
  }

  return docToReview(doc);
}

export async function hasUserReviewedBusiness(
  userId: string,
  businessId: string
): Promise<boolean> {
  await connectToDatabase();
  const count = await ReviewModel.countDocuments({ userId, businessId });
  return count > 0;
}

export async function updateReviewStatus(
  id: string,
  status: "published" | "pending" | "reported" | "removed"
): Promise<Review | null> {
  await connectToDatabase();
  const isFlagged = status === "reported";
  const doc = await ReviewModel.findOneAndUpdate(
    { id },
    { $set: { status, isFlagged } },
    { new: true }
  ).lean() as any;
  if (!doc) return null;

  if (doc.businessId) {
    try {
      await recalculateBusinessRating(doc.businessId);
    } catch (e) {}
  }

  return docToReview(doc);
}

export async function postOwnerReply(
  reviewId: string,
  reply: {
    ownerId?: string;
    ownerName: string;
    comment: string;
  }
): Promise<Review | null> {
  await connectToDatabase();
  const doc = await ReviewModel.findOneAndUpdate(
    { id: reviewId },
    {
      $set: {
        reply: {
          ownerId: reply.ownerId || "owner-1",
          ownerName: reply.ownerName,
          comment: reply.comment,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  ).lean() as any;
  if (!doc) return null;
  return docToReview(doc);
}

export async function flagReview(id: string): Promise<Review | null> {
  return updateReviewStatus(id, "reported");
}

export async function unflagReview(id: string): Promise<Review | null> {
  return updateReviewStatus(id, "published");
}

export async function deleteReview(id: string): Promise<boolean> {
  await connectToDatabase();
  const existing = await ReviewModel.findOne({ id }, "businessId").lean();
  const result = await ReviewModel.deleteOne({ id });
  if (result.deletedCount > 0 && existing && (existing as any).businessId) {
    try {
      await recalculateBusinessRating((existing as any).businessId);
    } catch (e) {}
  }
  return result.deletedCount > 0;
}

export async function getFlaggedReviews(page = 1, limit = 20) {
  return getAllReviews({ status: "reported", page, limit });
}
