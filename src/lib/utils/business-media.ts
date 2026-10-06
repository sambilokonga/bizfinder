export const DEFAULT_BUSINESS_COVER =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "cat-hotels": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  "cafe-coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  "cat-dining": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  "food-dining": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  "shopping-retail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  "shops-retail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  automotive: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80",
  health: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
  electronics: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Return a safe, valid cover image URL for a business.
 * Never returns empty string ("") or undefined to prevent browser refetches and Next.js console errors.
 */
export function getBusinessCoverUrl(
  biz?: {
    coverUrl?: string | null;
    media?: Array<{ url?: string; type?: string; thumbnailUrl?: string }>;
    categoryId?: string;
    categoryName?: string;
  } | null
): string {
  if (!biz) return DEFAULT_BUSINESS_COVER;

  if (typeof biz.coverUrl === "string" && biz.coverUrl.trim().length > 0) {
    return biz.coverUrl.trim();
  }

  if (Array.isArray(biz.media) && biz.media.length > 0) {
    const firstMedia = biz.media[0];
    if (firstMedia) {
      if (firstMedia.type === "video") {
        const thumb = firstMedia.thumbnailUrl || (firstMedia.url?.includes("youtube") || firstMedia.url?.includes("youtu.be")
          ? `https://img.youtube.com/vi/${firstMedia.url.match(/(?:youtu\.be\/|watch\?v=)([\w-]{11})/)?.[1] || ""}/hqdefault.jpg`
          : null);
        if (thumb && !thumb.includes("/undefined/")) return thumb;
      } else if (typeof firstMedia.url === "string" && firstMedia.url.trim().length > 0) {
        return firstMedia.url.trim();
      }
    }
  }

  const catKey = (biz.categoryId || biz.categoryName || "").toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (catKey.includes(key)) {
      return url;
    }
  }

  return DEFAULT_BUSINESS_COVER;
}
