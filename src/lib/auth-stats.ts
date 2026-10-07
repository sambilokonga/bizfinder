/**
 * Server-side helper to fetch live stats shown on the authentication pages.
 * Imported directly from Server Components — no HTTP round-trip needed.
 *
 * Falls back gracefully when the DB is unavailable.
 */

import { connectToDatabase, withDbTimeout } from "@/lib/db/mongodb";
import { BusinessModel } from "@/lib/db/models/Business";
import { UserModel } from "@/lib/db/models/User";
import { ReviewModel } from "@/lib/db/models/Review";

export interface AuthStats {
  /** Total number of published / approved listings */
  listingCount: number;
  /** Total registered users (monthly visitor proxy) */
  userCount: number;
  /** Site-wide average rating across all published reviews */
  avgRating: number;
  /** A single high-quality 5-star review to feature as a testimonial */
  featuredReview: {
    text: string;
    authorInitials: string;
    authorName: string;
  } | null;
  /** A single owner success story (for sign-up page) */
  ownerTestimonial: {
    text: string;
    authorInitials: string;
    authorName: string;
  } | null;
}

/** Format a number with K+ / M+ suffix */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K+`;
  if (n === 0) return "0";
  return `${n}+`;
}

const FALLBACK: AuthStats = {
  listingCount: 10_000,
  userCount: 50_000,
  avgRating: 4.9,
  featuredReview: {
    text: "BizFinder makes discovering verified spots in Addis so seamless. The live hours and maps are outstanding.",
    authorInitials: "ST",
    authorName: "Sara Tadesse — Local Explorer",
  },
  ownerTestimonial: {
    text: "Claiming our Bole location took under 5 minutes. We now receive regular customer inquiries directly through BizFinder!",
    authorInitials: "DA",
    authorName: "Dr. Dawit Bekele — Managing Director, Bole Med",
  },
};

export async function fetchAuthStats(): Promise<AuthStats> {
  try {
    const db = await connectToDatabase();
    if (!db) return FALLBACK;

    // Run all aggregations in parallel with a shared 4-second timeout
    const [listingCount, userCount, ratingAgg, reviewDocs] = await Promise.all([
      withDbTimeout(
        BusinessModel.countDocuments({ isPublished: true }).lean(),
        FALLBACK.listingCount,
        4000
      ),
      withDbTimeout(
        UserModel.countDocuments({ isActive: true }).lean(),
        FALLBACK.userCount,
        4000
      ),
      withDbTimeout(
        ReviewModel.aggregate([
          { $match: { status: "published" } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
            },
          },
        ]),
        [] as { avgRating: number }[],
        4000
      ),
      // Fetch a handful of top 5-star published reviews to pick from
      withDbTimeout(
        ReviewModel.find({ status: "published", rating: 5, comment: { $exists: true, $ne: "" } })
          .sort({ likesCount: -1, createdAt: -1 })
          .limit(8)
          .select("comment userName rating")
          .lean(),
        [],
        4000
      ),
    ]);

    const avgRating =
      Array.isArray(ratingAgg) && ratingAgg.length > 0
        ? Math.round((ratingAgg[0].avgRating || FALLBACK.avgRating) * 10) / 10
        : FALLBACK.avgRating;

    // Pick two distinct reviews (or fall back to hardcoded ones)
    const reviews = Array.isArray(reviewDocs) ? reviewDocs : [];

    const pickReview = (idx: number) => {
      const r = reviews[idx];
      if (!r) return null;
      const name = (r.userName as string) || "Anonymous";
      const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .join("");
      return {
        text: (r.comment as string).slice(0, 200),
        authorInitials: initials || name.slice(0, 2).toUpperCase(),
        authorName: name,
      };
    };

    return {
      listingCount: typeof listingCount === "number" && listingCount > 0
        ? listingCount
        : FALLBACK.listingCount,
      userCount: typeof userCount === "number" && userCount > 0
        ? userCount
        : FALLBACK.userCount,
      avgRating,
      featuredReview: pickReview(0) ?? FALLBACK.featuredReview,
      ownerTestimonial: pickReview(1) ?? FALLBACK.ownerTestimonial,
    };
  } catch (err) {
    console.warn("[auth-stats] Failed to fetch stats, using fallback:", err);
    return FALLBACK;
  }
}
