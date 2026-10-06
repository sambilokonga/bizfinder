/**
 * Typed API client for BizFinder.
 * Used by client components (browser) and can also be used server-side with absolute URLs.
 */
import {
  BusinessSearchParams,
  BusinessSearchResponse,
  BusinessDetailResponse,
  ReviewsResponse,
  CategoryListResponse,
  LocationListResponse,
  DbStatusResponse,
} from "@/types/api";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return ""; // browser: relative URLs
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await res.json().catch(() => ({ error: res.statusText })) : { error: res.statusText };
    throw new Error(body.error || `API error ${res.status}`);
  }
  const isJson = res.headers.get("content-type")?.includes("application/json");
  if (!isJson) {
    return {} as T;
  }
  return res.json().catch(() => ({} as T));
}

// ─── Businesses ────────────────────────────────────────────────────────────

export async function fetchBusinesses(
  params: BusinessSearchParams = {}
): Promise<BusinessSearchResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<BusinessSearchResponse>(`/api/businesses${query}`, {
    next: { revalidate: 60 },
  });
}

export async function fetchBusiness(idOrSlug: string): Promise<BusinessDetailResponse> {
  return apiFetch<BusinessDetailResponse>(`/api/businesses/${idOrSlug}`, {
    next: { revalidate: 60 },
  });
}

export async function incrementViewCount(id: string): Promise<void> {
  await apiFetch(`/api/businesses/${id}/views`, { method: "POST" });
}

// ─── Reviews ───────────────────────────────────────────────────────────────

export async function fetchReviews(
  businessId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> {
  return apiFetch<ReviewsResponse>(
    `/api/businesses/${businessId}/reviews?page=${page}&limit=${limit}`,
    { next: { revalidate: 30 } }
  );
}

export async function submitReview(
  businessId: string,
  body: { rating: number; comment: string; photos?: string[] }
): Promise<void> {
  await apiFetch(`/api/businesses/${businessId}/reviews`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function fetchCategories(opts: {
  featured?: boolean;
  level?: number;
} = {}): Promise<CategoryListResponse> {
  const qs = new URLSearchParams();
  if (opts.featured) qs.set("featured", "true");
  if (opts.level !== undefined) qs.set("level", String(opts.level));
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<CategoryListResponse>(`/api/categories${query}`, {
    next: { revalidate: 3600 },
  });
}

// ─── Locations ─────────────────────────────────────────────────────────────

export async function fetchLocations(type?: string): Promise<LocationListResponse> {
  const query = type ? `?type=${type}` : "";
  return apiFetch<LocationListResponse>(`/api/locations${query}`, {
    next: { revalidate: 3600 },
  });
}

// ─── DB Status ─────────────────────────────────────────────────────────────

export async function fetchDbStatus(): Promise<DbStatusResponse> {
  return apiFetch<DbStatusResponse>("/api/seed");
}
