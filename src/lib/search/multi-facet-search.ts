import { Business } from "@/types/business";
import {
  SearchAutocompleteResult,
  SearchOptionScope,
  AutocompleteResultType,
} from "@/types/search";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";
import { SEED_LOCATIONS } from "@/lib/db/seed-data/locations";
import { COUNTRIES_WITH_CITIES } from "@/lib/data/countries-cities";
import {
  CBE_CITY_DISTRIBUTION,
  ETHIOPIA_CITY_COORDINATES,
} from "@/lib/data/cbe-branches-generator";

// Famous and recognized landmark buildings & commercial centers
export const KNOWN_BUILDINGS: Array<{
  name: string;
  area: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  businessesInside?: string[];
}> = [
  {
    name: "Kategna Building",
    area: "Cameroon Street, Bole Medhanialem",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.9972,
    lng: 38.7865,
    businessesInside: ["Kategna Ethiopian Restaurant", "Kategna Coffee Roastery"],
  },
  {
    name: "Edna Mall & Cinema Center",
    area: "Bole Medhanialem",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.998,
    lng: 38.787,
    businessesInside: ["Edna Cinema", "Fun City Kids Zone", "Bole Cafe Lounge"],
  },
  {
    name: "Morning Star Mall",
    area: "Bole Medhanialem",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.9965,
    lng: 38.785,
    businessesInside: ["Morning Star Supermarket", "Allure Beauty Spa", "First Bank ATM"],
  },
  {
    name: "CBE Head Office Tower (Commercial Bank HQ)",
    area: "Ras Desta Damtew Street, Churchill Ave",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.0185,
    lng: 38.7512,
    businessesInside: ["Commercial Bank of Ethiopia HQ", "CBE International Banking Centre"],
  },
  {
    name: "Dembel City Center",
    area: "Africa Avenue, Bole Road, Olympia",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.0065,
    lng: 38.7672,
    businessesInside: ["Dembel Electronics Plaza", "Skyline Cafe & Bar", "DHL Express"],
  },
  {
    name: "Friendship Business Center",
    area: "Bole Road, Near Airport",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.9912,
    lng: 38.7895,
    businessesInside: ["Friendship Supermarket", "Samsonite Store", "Ethiopian Airlines Ticketing"],
  },
  {
    name: "Century Mall",
    area: "Gurd Shola, Yeka",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.0225,
    lng: 38.8095,
    businessesInside: ["Century Cinema", "Mega Book Store", "Food Court International"],
  },
  {
    name: "Getu Commercial Center",
    area: "Africa Avenue (Bole Road), Peacock",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.0015,
    lng: 38.775,
    businessesInside: ["Getu Medical Clinics", "Apple Authorized Reseller", "Dashen Bank"],
  },
  {
    name: "Mega Building",
    area: "Bole Road, Near Olympia",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.009,
    lng: 38.765,
    businessesInside: ["Mega Publishing", "Law Partners Chambers", "Creative Hub"],
  },
  {
    name: "Tracon Tower",
    area: "Churchill Avenue, Black Lion Area",
    city: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.021,
    lng: 38.748,
    businessesInside: ["Tracon Real Estate HQ", "Finserve Microfinance", "Panoramic Bistro"],
  },
];

// Representative branch dataset for quick search indexing
const SAMPLE_CBE_BRANCH_NAMES = [
  { name: "CBE Bole Medhanialem Branch", code: "CBE-001", city: "Addis Ababa", subcity: "Bole", address: "Cameroon St, Near Edna Mall", lat: 8.9975, lng: 38.7868 },
  { name: "CBE Finfine Main Branch", code: "CBE-002", city: "Addis Ababa", subcity: "Arada", address: "Churchill Ave, Central District", lat: 9.0305, lng: 38.752 },
  { name: "CBE Kazanchis Super Branch", code: "CBE-003", city: "Addis Ababa", subcity: "Kirkos", address: "Menelik II Ave, Kazanchis", lat: 9.0195, lng: 38.768 },
  { name: "CBE Sarbet Branch", code: "CBE-004", city: "Addis Ababa", subcity: "Kirkos", address: "Old Airport Road, Sarbet", lat: 8.992, lng: 38.742 },
  { name: "CBE Piassa Gold Branch", code: "CBE-005", city: "Addis Ababa", subcity: "Arada", address: "Piazza Central, De Gaulle Square", lat: 9.035, lng: 38.751 },
  { name: "CBE CMC Village Branch", code: "CBE-006", city: "Addis Ababa", subcity: "Yeka", address: "CMC Square, Main Boulevard", lat: 9.028, lng: 38.831 },
  { name: "CBE Hawassa Menaharia Branch", code: "CBE-021", city: "Hawassa", subcity: "Menaharia", address: "Main Avenue, Near Central Bus Terminal", lat: 7.0621, lng: 38.4764 },
  { name: "CBE Bahir Dar Gish Abay Branch", code: "CBE-045", city: "Bahir Dar", subcity: "Gish Abay", address: "Lake Tana Boulevard", lat: 11.5936, lng: 37.3908 },
  { name: "CBE Dire Dawa Sabian Branch", code: "CBE-068", city: "Dire Dawa", subcity: "Sabian", address: "Sabian Highway Commercial Zone", lat: 9.5931, lng: 41.8661 },
  { name: "CBE Gondar Fasil Branch", code: "CBE-089", city: "Gondar", subcity: "Fasil", address: "Castle Roundabout Commercial Center", lat: 12.6075, lng: 37.4521 },
  { name: "CBE Adama Posta Branch", code: "CBE-110", city: "Adama", subcity: "Posta", address: "Adama Expressway Road, Posta Square", lat: 8.5414, lng: 39.2689 },
];

export interface MultiFacetSearchOptions {
  query: string;
  scope?: SearchOptionScope;
  limit?: number;
  customBusinesses?: Business[];
}

/**
 * Text highlighter utility that breaks a string into segments of matched and non-matched tokens.
 */
export function highlightMatch(
  text: string,
  query: string
): Array<{ text: string; isMatch: boolean }> {
  if (!query || !query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const q = query.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(q);

  if (index === -1) {
    return [{ text, isMatch: false }];
  }

  const result: Array<{ text: string; isMatch: boolean }> = [];
  if (index > 0) {
    result.push({ text: text.slice(0, index), isMatch: false });
  }
  result.push({ text: text.slice(index, index + q.length), isMatch: true });
  if (index + q.length < text.length) {
    result.push({ text: text.slice(index + q.length), isMatch: false });
  }
  return result;
}

/**
 * Executes multi-facet search across businesses, branches, products, buildings,
 * locations, cities, countries, business types, and map pinpoints.
 */
export function performMultiFacetSearch({
  query,
  scope = "all",
  limit = 12,
  customBusinesses,
}: MultiFacetSearchOptions): SearchAutocompleteResult[] {
  if (!query || !query.trim()) {
    return [];
  }

  const q = query.trim().toLowerCase();
  const results: SearchAutocompleteResult[] = [];
  const businesses = customBusinesses && customBusinesses.length > 0 ? customBusinesses : SEED_BUSINESSES;

  const shouldSearch = (category: AutocompleteResultType) => {
    if (scope === "all") return true;
    if (scope === "business" && category === "business") return true;
    if (scope === "branch" && category === "branch") return true;
    if (scope === "product" && category === "product") return true;
    if (scope === "building" && category === "building") return true;
    if (scope === "location" && category === "location") return true;
    if (scope === "city_country" && (category === "city" || category === "country")) return true;
    if (scope === "business_type" && category === "category") return true;
    if (scope === "map" && (category === "map" || category === "building" || category === "location")) return true;
    return false;
  };

  // 1. BUSINESSES (Registered company names, brands, stores)
  if (shouldSearch("business")) {
    for (const biz of businesses) {
      const nameMatch = biz.name.toLowerCase().includes(q);
      const descMatch = biz.description?.toLowerCase().includes(q);
      const tagMatch = biz.categoryName?.toLowerCase().includes(q);

      if (nameMatch || descMatch || tagMatch) {
        results.push({
          type: "business",
          id: `biz-${biz.id}`,
          businessId: biz.id,
          businessName: biz.name,
          title: biz.name,
          subtitle: `${biz.categoryName} • ${biz.cityName || biz.addressLine}`,
          extraInfo: biz.addressLine,
          badge: biz.isVerified ? "Verified" : undefined,
          rating: biz.ratingAvg,
          reviewCount: biz.reviewCount,
          isOpen: biz.status === "open",
          isVerified: biz.isVerified,
          lat: biz.latitude,
          lng: biz.longitude,
          logoUrl: biz.logoUrl,
          categorySlug: biz.slug,
          matchedField: nameMatch ? "Business Name" : "Description / Category",
        });
      }
    }
  }

  // 2. BRANCHES (Chain outlets, CBE branches, regional offices)
  if (shouldSearch("branch")) {
    // Check CBE sample branches
    for (const cbe of SAMPLE_CBE_BRANCH_NAMES) {
      if (
        cbe.name.toLowerCase().includes(q) ||
        cbe.code.toLowerCase().includes(q) ||
        cbe.city.toLowerCase().includes(q) ||
        cbe.subcity.toLowerCase().includes(q)
      ) {
        results.push({
          type: "branch",
          id: `cbe-${cbe.code}`,
          title: cbe.name,
          subtitle: `Commercial Bank of Ethiopia • ${cbe.code}`,
          extraInfo: `${cbe.subcity}, ${cbe.city} (${cbe.address})`,
          badge: "Branch",
          branchCode: cbe.code,
          cityName: cbe.city,
          countryName: "Ethiopia",
          lat: cbe.lat,
          lng: cbe.lng,
          matchedField: "Branch Name & Code",
        });
      }
    }

    // Check custom business branches
    for (const biz of businesses) {
      if (biz.branches && Array.isArray(biz.branches)) {
        for (const branch of biz.branches) {
          if (
            branch.name.toLowerCase().includes(q) ||
            branch.branchCode?.toLowerCase().includes(q) ||
            branch.addressLine.toLowerCase().includes(q)
          ) {
            results.push({
              type: "branch",
              id: `branch-${branch.id}`,
              businessId: biz.id,
              businessName: biz.name,
              branchId: branch.id,
              branchCode: branch.branchCode,
              title: branch.name,
              subtitle: `${biz.name} Branch • ${branch.cityName}`,
              extraInfo: branch.addressLine,
              badge: "Branch",
              lat: branch.latitude || biz.latitude,
              lng: branch.longitude || biz.longitude,
              matchedField: "Branch Network",
            });
          }
        }
      }
    }
  }

  // 3. PRODUCTS & SERVICES (Menu dishes, retail items, specialized services)
  if (shouldSearch("product")) {
    for (const biz of businesses) {
      if (biz.services && Array.isArray(biz.services)) {
        for (const s of biz.services) {
          if (
            s.name.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.category?.toLowerCase().includes(q)
          ) {
            results.push({
              type: "product",
              id: `prod-${biz.id}-${s.id}`,
              businessId: biz.id,
              businessName: biz.name,
              title: s.name,
              subtitle: `Offered by ${biz.name}`,
              extraInfo: s.description || biz.addressLine,
              price: s.price,
              badge: s.price ? s.price : "Product/Service",
              lat: biz.latitude,
              lng: biz.longitude,
              matchedField: "Product / Menu Item",
            });
          }
        }
      }
    }
  }

  // 4. BUILDINGS & LANDMARKS (Commercial plazas, malls, corporate towers)
  if (shouldSearch("building")) {
    // Check known landmarks
    for (const bld of KNOWN_BUILDINGS) {
      if (
        bld.name.toLowerCase().includes(q) ||
        bld.area.toLowerCase().includes(q) ||
        bld.businessesInside?.some((b) => b.toLowerCase().includes(q))
      ) {
        results.push({
          type: "building",
          id: `bld-${bld.name.toLowerCase().replace(/\s+/g, "-")}`,
          title: bld.name,
          subtitle: `${bld.area} • ${bld.city}`,
          extraInfo: bld.businessesInside ? `Inside: ${bld.businessesInside.join(", ")}` : undefined,
          building: bld.name,
          cityName: bld.city,
          countryName: bld.country,
          badge: "Building / Mall",
          lat: bld.lat,
          lng: bld.lng,
          matchedField: "Building & Complex",
        });
      }
    }

    // Check buildings listed in businesses
    for (const biz of businesses) {
      if (biz.building && biz.building.toLowerCase().includes(q)) {
        const buildingId = `biz-bld-${biz.building.toLowerCase().replace(/\s+/g, "-")}`;
        if (!results.some((r) => r.id === buildingId)) {
          results.push({
            type: "building",
            id: buildingId,
            title: biz.building,
            subtitle: `${biz.districtName || biz.cityName || "Commercial Building"}`,
            extraInfo: `Location of ${biz.name}`,
            building: biz.building,
            cityName: biz.cityName,
            badge: "Building",
            lat: biz.latitude,
            lng: biz.longitude,
            matchedField: "Building Location",
          });
        }
      }
    }
  }

  // 5. LOCATIONS & NEIGHBORHOODS (Subcities, districts, zones)
  if (shouldSearch("location")) {
    for (const loc of SEED_LOCATIONS) {
      if (loc.name.toLowerCase().includes(q) || loc.type.toLowerCase().includes(q)) {
        results.push({
          type: "location",
          id: `loc-${loc.id}`,
          title: loc.name,
          subtitle: `${loc.type.toUpperCase()} • Neighborhood / Zone`,
          badge: loc.type,
          lat: loc.latitude,
          lng: loc.longitude,
          matchedField: "District / Subcity",
        });
      }
    }

    // Also match subcities in CBE city distribution
    for (const [city, dist] of Object.entries(CBE_CITY_DISTRIBUTION)) {
      for (const sub of dist.subcities) {
        if (sub.toLowerCase().includes(q)) {
          const locKey = `subcity-${city}-${sub}`.toLowerCase().replace(/\s+/g, "-");
          if (!results.some((r) => r.id === locKey)) {
            const coords = ETHIOPIA_CITY_COORDINATES[city] || { lat: 9.03, lng: 38.74 };
            results.push({
              type: "location",
              id: locKey,
              title: `${sub}, ${city}`,
              subtitle: `Sub-city / Municipality Zone in ${city}`,
              cityName: city,
              countryName: "Ethiopia",
              badge: "Sub-city",
              lat: coords.lat,
              lng: coords.lng,
              matchedField: "Sub-city Area",
            });
          }
        }
      }
    }
  }

  // 6. CITIES & COUNTRIES (Worldwide destinations with flags)
  if (shouldSearch("city") || shouldSearch("country")) {
    for (const entry of COUNTRIES_WITH_CITIES) {
      const countryMatch = entry.name.toLowerCase().includes(q);
      if (countryMatch && shouldSearch("country")) {
        results.push({
          type: "country",
          id: `country-${entry.name.toLowerCase().replace(/\s+/g, "-")}`,
          title: `${entry.flag} ${entry.name}`,
          subtitle: `Country • 30+ Major Cities Listed`,
          countryName: entry.name,
          countryFlag: entry.flag,
          badge: "Country",
          matchedField: "Country Directory",
        });
      }

      if (shouldSearch("city")) {
        for (const city of entry.cities) {
          if (city.toLowerCase().includes(q)) {
            results.push({
              type: "city",
              id: `city-${entry.name}-${city}`.toLowerCase().replace(/\s+/g, "-"),
              title: `${city}, ${entry.name}`,
              subtitle: `${entry.flag} Municipality in ${entry.name}`,
              cityName: city,
              countryName: entry.name,
              countryFlag: entry.flag,
              badge: "City",
              matchedField: "City / Municipality",
            });
          }
        }
      }
    }
  }

  // 7. BUSINESS TYPES & CATEGORIES (70+ taxonomy classifications)
  if (shouldSearch("category")) {
    for (const cat of SEED_CATEGORIES) {
      if (
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q)
      ) {
        results.push({
          type: "category",
          id: `cat-${cat.id}`,
          title: cat.name,
          subtitle: cat.level === 1 ? "Top-Level Industry" : "Specialized Category",
          slug: cat.slug,
          categorySlug: cat.slug,
          categoryName: cat.name,
          badge: cat.level === 1 ? "Industry" : "Category",
          matchedField: "Business Category",
        });
      }
    }
  }

  // 8. MAP SEARCH PINPOINTS (Direct geographic discovery)
  if (scope === "map" || scope === "all") {
    // If user types terms like "map", "near", or coordinates, provide explicit map search options
    if (q.includes("map") || q.includes("near") || q.includes("center") || q.includes("gps")) {
      results.unshift({
        type: "map",
        id: "map-live-interactive",
        title: `Explore "${query.trim()}" on Interactive Map`,
        subtitle: `View synchronized pins, radius boundary & real-time GPS locations`,
        badge: "Interactive Map",
        matchedField: "Live Map View",
      });
    }
  }

  // Deduplicate results by ID
  const seenIds = new Set<string>();
  const uniqueResults: SearchAutocompleteResult[] = [];
  for (const item of results) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueResults.push(item);
    }
  }

  // Return within requested limit (or top 12 for rich experience)
  return uniqueResults.slice(0, Math.max(limit, 12));
}
