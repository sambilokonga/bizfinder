import { connectToDatabase } from "@/lib/db/mongodb";
import { ReviewModel } from "@/lib/db/models/Review";
import { BusinessModel } from "@/lib/db/models/Business";
import { Review } from "@/types/review";
import { SEED_REVIEWS, SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { recalculateBusinessRating } from "@/lib/db/queries/businesses";

import { createNotification } from "@/lib/db/queries/notifications";
import { globalCityRegistry } from "@/lib/data/city-business-registry";

function docToReview(doc: any): Review {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    businessId: obj.businessId,
    businessName: obj.businessName,
    cityName: obj.cityName,
    countryName: obj.countryName,
    timeframeType: obj.timeframeType || "recent",
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
    const businessMap = new Map<string, { name: string; cityName: string; countryName: string }>();
    SEED_BUSINESSES.forEach((b) =>
      businessMap.set(b.id, {
        name: b.name,
        cityName: b.cityName || (b as any).city || "Addis Ababa",
        countryName: b.countryName || (b as any).country || "Ethiopia",
      })
    );

    const docsToInsert = SEED_REVIEWS.map((rev) => {
      const bizInfo = businessMap.get(rev.businessId);
      return {
        id: rev.id,
        businessId: rev.businessId,
        businessName: bizInfo?.name || "Ethiopian Business",
        cityName: bizInfo?.cityName || "Addis Ababa",
        countryName: bizInfo?.countryName || "Ethiopia",
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
        timeframeType: "recent",
        isFlagged: false,
        createdAt: rev.createdAt ? new Date(rev.createdAt) : new Date(),
      };
    });

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
  country?: string;
  city?: string;
}

export async function getAllReviews(params: GetAllReviewsParams = {}) {
  const conn = await connectToDatabase();
  if (!conn) {
    let regList = [];
    if (params.city && params.city !== "all") {
      regList = globalCityRegistry.getReviewsForCity(params.city, params.country || "");
    } else if (params.country && params.country !== "all") {
      regList = globalCityRegistry.getReviewsForCountry(params.country);
    } else {
      regList = globalCityRegistry.getAllReviewsGlobal();
    }
    if (params.businessId) {
      regList = regList.filter((r) => r.businessId === params.businessId);
    }
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 20);
    const skip = (page - 1) * limit;
    return {
      reviews: regList.slice(skip, skip + limit) as any,
      total: regList.length,
      page,
      totalPages: Math.max(1, Math.ceil(regList.length / limit)),
      limit,
      counts: {
        all: regList.length,
        published: regList.filter((r) => r.status === "published").length,
        pending: regList.filter((r) => r.status === "pending").length,
        reported: regList.filter((r) => r.status === "reported").length,
        removed: regList.filter((r) => r.status === "removed").length,
        replies: 0,
      },
    };
  }
  await ensureReviewsSeeded();

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 20);
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};

  const cleanCity = params.city && params.city !== "all" ? params.city.trim() : undefined;
  const cleanCountry = params.country && params.country !== "all" ? params.country.trim() : undefined;

  // Geo-scope: resolve business IDs by city/country so city and country admins only see their territory's reviews
  if (cleanCity || cleanCountry) {
    const geoConditions: any[] = [];
    if (cleanCity) {
      geoConditions.push({
        $or: [
          { cityName: new RegExp(`^${cleanCity}$`, "i") },
          { city: new RegExp(`^${cleanCity}$`, "i") },
        ],
      });
    }
    if (cleanCountry) {
      geoConditions.push({
        $or: [
          { countryName: new RegExp(`^${cleanCountry}$`, "i") },
          { country: new RegExp(`^${cleanCountry}$`, "i") },
        ],
      });
    }

    const bizQuery = geoConditions.length > 1 ? { $and: geoConditions } : geoConditions[0];
    const bizDocs = (await BusinessModel.find(bizQuery, "id cityName city countryName country").lean()) as any[];
    const bizIds = bizDocs.map((b: any) => b.id);

    // Also collect businesses from in-memory registry
    let registryBizIds: string[] = [];
    try {
      if (cleanCity) {
        registryBizIds = globalCityRegistry
          .getBusinessesForCity(cleanCity, cleanCountry || "")
          .map((b) => b.id);
      } else if (cleanCountry) {
        registryBizIds = globalCityRegistry
          .getBusinessesForCountry(cleanCountry)
          .map((b) => b.id);
      }
    } catch (e) {}

    const allMatchingBizIds = Array.from(new Set([...bizIds, ...registryBizIds]));

    const cityRegex = cleanCity ? new RegExp(`^${cleanCity}$`, "i") : null;
    const countryRegex = cleanCountry ? new RegExp(`^${cleanCountry}$`, "i") : null;

    const reviewGeoOr: any[] = [];
    if (allMatchingBizIds.length > 0) {
      if (params.businessId) {
        if (allMatchingBizIds.includes(params.businessId)) {
          reviewGeoOr.push({ businessId: params.businessId });
        }
      } else {
        reviewGeoOr.push({ businessId: { $in: allMatchingBizIds } });
      }
    }

    const directGeo: any = {};
    if (cityRegex) directGeo.cityName = cityRegex;
    if (countryRegex) directGeo.countryName = countryRegex;
    if (params.businessId) directGeo.businessId = params.businessId;

    if (Object.keys(directGeo).length > 0) {
      reviewGeoOr.push(directGeo);
    }

    if (reviewGeoOr.length > 0) {
      query.$or = reviewGeoOr;
    } else {
      query.businessId = "__NO_MATCHING_BIZ_IN_TERRITORY__";
    }
  } else if (params.businessId) {
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

  // baseScope for tab counts must also reflect the geo-scoped filter
  const baseScope: Record<string, any> = query.$or
    ? { $or: query.$or }
    : query.businessId
    ? { businessId: query.businessId }
    : {};

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
    const bizDocs = await BusinessModel.find({ id: { $in: missingBizIds } }, "id name cityName countryName").lean();
    const bMap = new Map<string, any>();
    bizDocs.forEach((b: any) => bMap.set(b.id, b));
    docs.forEach((d: any) => {
      const bInfo = bMap.get(d.businessId);
      if (bInfo) {
        if (!d.businessName) d.businessName = bInfo.name;
        if (!d.cityName) d.cityName = bInfo.cityName || bInfo.city;
        if (!d.countryName) d.countryName = bInfo.countryName || bInfo.country;
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
  const doc = (await ReviewModel.findOne({ id }).lean()) as any;
  if (!doc) return null;
  return docToReview(doc);
}

export async function createReview(data: {
  id: string;
  businessId: string;
  businessName?: string;
  cityName?: string;
  countryName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  photos?: string[];
  status?: "published" | "pending" | "reported" | "removed";
  timeframeType?: "historical" | "recent" | "future_scheduled";
  createdAt?: string;
  dateFormatted?: string;
  isVerifiedCitizen?: boolean;
}): Promise<Review> {
  const conn = await connectToDatabase();

  let businessName = data.businessName;
  let cityName = data.cityName;
  let countryName = data.countryName;

  if (!businessName || !cityName || !countryName) {
    try {
      const biz = (await BusinessModel.findOne(
        { id: data.businessId },
        "name cityName city countryName country"
      ).lean()) as any;
      if (biz) {
        if (!businessName) businessName = biz.name;
        if (!cityName) cityName = biz.cityName || biz.city;
        if (!countryName) countryName = biz.countryName || biz.country;
      }
    } catch (e) {}
  }

  if (!businessName || !cityName || !countryName) {
    try {
      const regBiz = globalCityRegistry.getBusinessById(data.businessId);
      if (regBiz) {
        if (!businessName) businessName = regBiz.name;
        if (!cityName) cityName = regBiz.cityName || (regBiz as any).city;
        if (!countryName) countryName = regBiz.countryName || (regBiz as any).country;
      }
    } catch (e) {}
  }

  cityName = cityName || "Addis Ababa";
  countryName = countryName || "Ethiopia";
  businessName = businessName || "Registered Business";

  let doc: any = null;
  if (conn) {
    try {
      doc = await ReviewModel.create({
        ...data,
        businessName,
        cityName,
        countryName,
        status: data.status || "published",
        timeframeType: data.timeframeType || "recent",
        isVerifiedCitizen: data.isVerifiedCitizen !== undefined ? data.isVerifiedCitizen : true,
        isFlagged: false,
        likesCount: 0,
      });

      // Automatically recalculate aggregate rating and review count
      await recalculateBusinessRating(data.businessId).catch(() => {});
    } catch (err) {
      console.warn("[createReview] Rating recalculation / DB note:", err);
    }
  }

  const reviewResult: Review = doc
    ? docToReview(doc)
    : {
        id: data.id,
        businessId: data.businessId,
        businessName,
        cityName,
        countryName,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        rating: data.rating,
        comment: data.comment,
        photos: data.photos || [],
        likesCount: 0,
        status: data.status || "published",
        timeframeType: data.timeframeType || "recent",
        isVerifiedCitizen: data.isVerifiedCitizen !== undefined ? data.isVerifiedCitizen : true,
        isFlagged: false,
        createdAt: data.createdAt || new Date().toISOString(),
      };

  // Register in globalCityRegistry so it's instantly available for city & country admins
  try {
    globalCityRegistry.registerReview({
      id: reviewResult.id,
      businessId: reviewResult.businessId,
      businessName,
      cityName,
      countryName,
      userId: reviewResult.userId,
      userName: reviewResult.userName,
      userAvatar: reviewResult.userAvatar,
      rating: reviewResult.rating,
      comment: reviewResult.comment,
      photos: reviewResult.photos || [],
      status: reviewResult.status || "published",
      timeframeType: reviewResult.timeframeType || "recent",
      isVerifiedCitizen: reviewResult.isVerifiedCitizen !== undefined ? reviewResult.isVerifiedCitizen : true,
      createdAt: reviewResult.createdAt,
    });
  } catch (regErr) {
    console.warn("[createReview] globalCityRegistry sync note:", regErr);
  }

  // Multi-Tier Real-Time Notifications (Owner, City Admin, Country Admin, Super Admin)
  try {
    const stars = "⭐".repeat(Math.min(5, Math.max(1, data.rating)));
    const preview = data.comment.trim().slice(0, 80) + (data.comment.length > 80 ? "..." : "");
    const title = `${stars} New Review in ${cityName}: ${businessName}`;
    const bodyText = `${data.userName || "A customer"} left a ${data.rating}-star review on "${businessName}": "${preview}"`;

    // 1. Business Owner Notification
    await createNotification({
      title: `${stars} New Review: ${businessName}`,
      body: bodyText,
      target: "business",
      targetBusinessId: data.businessId,
      type: "review" as any,
      priority: data.rating <= 2 ? "high" : "medium",
      sentBy: data.userName || "Customer",
      link: "/dashboard?tab=reviews",
    }).catch(() => {});

    // 2. City Admin Notification for this specific city
    await createNotification({
      title,
      body: bodyText,
      target: "admin",
      targetRole: "city_admin",
      targetCity: cityName,
      targetCountry: countryName,
      type: "review" as any,
      actionType: "review",
      priority: data.rating <= 2 ? "high" : "medium",
      sentBy: data.userName || "Citizen Review",
      link: "/city-admin",
    }).catch(() => {});

    // 3. Country Admin Notification for this specific country
    await createNotification({
      title,
      body: bodyText,
      target: "admin",
      targetRole: "country_admin",
      targetCountry: countryName,
      type: "review" as any,
      actionType: "review",
      priority: "medium",
      sentBy: data.userName || "Citizen Review",
      link: "/admin",
    }).catch(() => {});

    // 4. Super Admin Notification
    await createNotification({
      title,
      body: bodyText,
      target: "admin",
      targetRole: "super_admin",
      type: "review" as any,
      actionType: "review",
      priority: "medium",
      sentBy: data.userName || "Citizen Review",
      link: "/admin",
    }).catch(() => {});
  } catch (notifErr) {
    console.warn("[createReview] Failed to dispatch multi-tier review notifications:", notifErr);
  }

  return reviewResult;
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
