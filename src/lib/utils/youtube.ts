/**
 * Universal YouTube Utility Functions
 * Handles robust extraction, thumbnail generation, and embed URLs for all YouTube formats.
 */

const YOUTUBE_REGEX =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*?(?:&|\?)v=|watch\?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i;

/**
 * Extracts the 11-character YouTube video ID from any valid YouTube URL or raw ID.
 * Works with watch?v=, youtu.be/, shorts/, embed/, live/, mobile URLs, and raw IDs.
 */
export function extractYoutubeVideoId(input: string | null | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-char ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex pattern matching
  const match = trimmed.match(YOUTUBE_REGEX);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  // URL query parameter fallback
  try {
    const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const vParam = urlObj.searchParams.get("v");
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      return vParam;
    }
    // Handle youtu.be/VIDEO_ID pathname
    if (urlObj.hostname.includes("youtu.be")) {
      const pathId = urlObj.pathname.replace(/^\//, "").split("/")[0];
      if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        return pathId;
      }
    }
  } catch {
    // invalid URL format, ignore
  }

  return null;
}

/**
 * Checks if a string or URL represents a YouTube video
 */
export function isYoutubeUrl(input: string | null | undefined): boolean {
  return extractYoutubeVideoId(input) !== null;
}

export type YoutubeThumbnailQuality = "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault";

/**
 * Returns the public YouTube thumbnail URL for a given video URL or ID.
 */
export function getYoutubeThumbnail(
  urlOrId: string | null | undefined,
  quality: YoutubeThumbnailQuality = "hqdefault"
): string {
  const videoId = extractYoutubeVideoId(urlOrId);
  if (!videoId) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
  }
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Returns the embed URL formatted for iframes.
 */
export function getYoutubeEmbedUrl(
  urlOrId: string | null | undefined,
  options?: { autoplay?: boolean; mute?: boolean; rel?: number }
): string | null {
  const videoId = extractYoutubeVideoId(urlOrId);
  if (!videoId) return null;

  const params = new URLSearchParams();
  if (options?.autoplay) {
    params.set("autoplay", "1");
  }
  if (options?.mute) {
    params.set("mute", "1");
  }
  params.set("rel", options?.rel !== undefined ? String(options.rel) : "0");
  params.set("modestbranding", "1");

  const query = params.toString();
  return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ""}`;
}

/**
 * Returns standard watch URL
 */
export function getYoutubeWatchUrl(urlOrId: string | null | undefined): string | null {
  const videoId = extractYoutubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}
