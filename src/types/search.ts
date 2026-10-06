import { PriceTier } from "./business";

export type SearchOptionScope =
  | "all"
  | "business"
  | "branch"
  | "product"
  | "building"
  | "location"
  | "city_country"
  | "business_type"
  | "map";

export type AutocompleteResultType =
  | "business"
  | "branch"
  | "product"
  | "building"
  | "location"
  | "city"
  | "country"
  | "category"
  | "map";

export interface SearchFilters {
  query?: string;
  scope?: SearchOptionScope;
  categoryId?: string;
  subcategoryId?: string;
  locationId?: string;
  locationName?: string;
  buildingName?: string;
  branchName?: string;
  productName?: string;
  cityName?: string;
  countryName?: string;
  userLat?: number;
  userLng?: number;
  radiusKm?: number; // e.g. 5km, 10km, 25km
  openNow?: boolean;
  minRating?: number; // e.g. 4.0
  priceTiers?: PriceTier[];
  verifiedOnly?: boolean;
  delivery?: boolean;
  parking?: boolean;
  wifi?: boolean;
  accessible?: boolean;
  reservation?: boolean;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  sortBy?: "relevance" | "distance" | "rating" | "reviews" | "newest";
  page?: number;
  limit?: number;
}

export interface ParsedSearchQuery {
  rawQuery: string;
  extractedCategory?: string;
  extractedLocation?: string;
  extractedModifiers: {
    openNow?: boolean;
    radiusKm?: number;
    nearMe?: boolean;
    ratingMin?: number;
  };
  remainingKeywords: string[];
}

export interface SearchAutocompleteResult {
  type: AutocompleteResultType;
  id: string;
  title: string;
  subtitle?: string;
  extraInfo?: string;
  badge?: string;
  icon?: string;
  slug?: string;
  // Specific reference IDs and metadata
  businessId?: string;
  businessName?: string;
  branchId?: string;
  branchCode?: string;
  price?: string;
  building?: string;
  cityName?: string;
  countryName?: string;
  countryFlag?: string;
  categorySlug?: string;
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  logoUrl?: string;
  // Matched attribute description for search explanation
  matchedField?: string;
}

