// ─── Shared API Response Types ───────────────────────────────────────────────

import { Business } from "./business";
import { Review } from "./review";

export interface ApiError {
  error: string;
  code?: string;
}

// Business search / list
export interface BusinessSearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  country?: string;
  countryName?: string;
  city?: string;
  cityName?: string;
  cityId?: string;
  subcityId?: string;
  ownerId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  featured?: boolean;
  verified?: boolean;
  openNow?: boolean;
  minRating?: number;
  priceTier?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: "relevance" | "rating" | "reviews" | "distance" | "newest";
}

export interface BusinessSearchResponse {
  total: number;
  page: number;
  limit: number;
  businesses: Business[];
}

// Single business
export interface BusinessDetailResponse {
  business: Business;
}

// Reviews
export interface ReviewsResponse {
  total: number;
  page: number;
  limit: number;
  reviews: Review[];
}

export interface SubmitReviewBody {
  rating: number;
  comment: string;
  photos?: string[];
}

// Categories
export interface CategoryItem {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  icon?: string;
  level: number;
  featured?: boolean;
}

export interface CategoryListResponse {
  total: number;
  categories: CategoryItem[];
}

// Locations
export interface LocationItem {
  id: string;
  parentId?: string | null;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
}

export interface LocationListResponse {
  total: number;
  locations: LocationItem[];
}

// DB status (seed endpoint)
export interface DbStatusResponse {
  success: boolean;
  database: string;
  counts: {
    categories: number;
    locations: number;
    businesses: number;
    reviews: number;
    users: number;
    claims: number;
  };
}
