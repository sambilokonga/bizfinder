import { Business } from "@/types/business";
import {
  getCountryByName,
  getRegionForCity,
} from "@/lib/data/world-locations";
import { getSubcitiesForCity } from "@/lib/data/subcities-database";
import { getCitiesForCountry } from "@/lib/data/countries-cities";

// Known Addis Ababa-only subcities / districts
const ADDIS_ABABA_DISTRICTS = new Set([
  "bole",
  "yeka",
  "kirkos",
  "arada",
  "lideta",
  "nifas silk",
  "nifas silk-lafto",
  "akaky kaliti",
  "akaki kality",
  "gulele",
  "kolfe keranio",
  "addis ketema",
  "lemi kura",
  "bole medhanialem",
  "bole rwanda",
  "bole atlas",
  "bole bulbula",
  "kazanchis",
  "sarbet",
  "piassa",
  "mexico",
  "megenagna",
]);

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DetectedLocationResult {
  country: string;
  region: string;
  city: string;
  subcity?: string;
  distanceKm: number;
}

/**
 * Detect the nearest city from GPS coordinates (lat, lng).
 * Uses world-locations city centers.
 */
export function detectLocationFromCoordinates(
  lat: number,
  lng: number,
  countryName: string = "Ethiopia",
  maxDistanceKm: number = 45
): DetectedLocationResult | undefined {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return undefined;

  // Protect against 0,0
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return undefined;

  const config = getCountryByName(countryName || "Ethiopia");
  let bestMatch: DetectedLocationResult | undefined;
  let minDistance = Infinity;

  if (config && config.regions) {
    for (const reg of config.regions) {
      for (const city of reg.cities) {
        if (city.center) {
          const [cLat, cLng] = city.center;
          const dist = calculateDistanceKm(lat, lng, cLat, cLng);
          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = {
              country: config.name,
              region: reg.name,
              city: city.name,
              subcity: city.subcities?.[0],
              distanceKm: dist,
            };
          }
        }
      }
    }
  }

  if (bestMatch && minDistance <= maxDistanceKm) {
    return bestMatch;
  }
  return undefined;
}

/**
 * Detect city mentioned in text (addressLine, name, etc.).
 */
export function detectCityFromText(
  text: string,
  countryName: string = "Ethiopia"
): { city: string; region: string } | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();

  // Special aliases & common variations
  if (
    lower.includes("wolaita sodo") ||
    lower.includes("wolayta sodo") ||
    lower.includes("wolaita") ||
    lower.includes("wolayta")
  ) {
    return { city: "Wolaita Sodo", region: "South Ethiopia" };
  }

  // Check all cities for this country
  const allCities = getCitiesForCountry(countryName) || [];
  for (const c of allCities) {
    const cLower = c.toLowerCase();
    // Exclude generic short words
    if (cLower.length >= 4 && lower.includes(cLower)) {
      const reg = getRegionForCity(countryName, c, true) || "Central";
      return { city: c, region: reg };
    }
  }

  return undefined;
}

/**
 * Resolves and normalizes business location, fixing mismatches where a business
 * located in Wolaita Sodo (or other cities) accidentally inherited default "Addis Ababa"
 * or default "Bole" district.
 */
export function resolveBusinessLocation(params: {
  cityName?: string;
  districtName?: string;
  regionName?: string;
  addressLine?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  countryName?: string;
}): {
  cityName: string;
  districtName: string;
  regionName?: string;
  countryName: string;
} {
  const countryName = (params.countryName || "Ethiopia").trim();
  let cityName = (params.cityName || "").trim();
  let districtName = (params.districtName || "").trim();
  let regionName = (params.regionName || "").trim();
  const addressLine = (params.addressLine || "").trim();
  const name = (params.name || "").trim();
  const lat = params.latitude;
  const lng = params.longitude;

  // 1. Text-based detection from address or business name
  const textMatch = detectCityFromText(`${name} ${addressLine}`, countryName);

  // 2. Coordinate-based detection
  const coordMatch =
    lat !== undefined && lng !== undefined
      ? detectLocationFromCoordinates(lat, lng, countryName, 40)
      : undefined;

  // Determine if this business is actually in another city despite default "Addis Ababa"
  const isDefaultAddis =
    !cityName ||
    cityName.toLowerCase() === "addis ababa" ||
    cityName.toLowerCase() === "default";

  if (isDefaultAddis) {
    // If coordinates firmly indicate a different city (e.g. Wolaita Sodo coords [6.85, 37.76])
    if (coordMatch && coordMatch.city.toLowerCase() !== "addis ababa") {
      cityName = coordMatch.city;
      regionName = coordMatch.region;
      if (!districtName || ADDIS_ABABA_DISTRICTS.has(districtName.toLowerCase())) {
        districtName = coordMatch.subcity || coordMatch.city;
      }
    } else if (textMatch && textMatch.city.toLowerCase() !== "addis ababa") {
      cityName = textMatch.city;
      regionName = textMatch.region;
      if (!districtName || ADDIS_ABABA_DISTRICTS.has(districtName.toLowerCase())) {
        districtName = textMatch.city;
      }
    }
  }

  // 3. Clean up invalid district if cityName is not Addis Ababa but district is "Bole"
  if (
    cityName &&
    cityName.toLowerCase() !== "addis ababa" &&
    districtName &&
    ADDIS_ABABA_DISTRICTS.has(districtName.toLowerCase())
  ) {
    const validSubs = getSubcitiesForCity(countryName, cityName);
    districtName = validSubs[0] || cityName;
  }

  // 4. Default fallbacks if empty
  if (!cityName) cityName = "Addis Ababa";
  if (!districtName) districtName = cityName;
  if (!regionName) {
    regionName = getRegionForCity(countryName, cityName, true) || "Central";
  }

  return {
    cityName,
    districtName,
    regionName,
    countryName,
  };
}

/**
 * Returns the human-friendly location string to display on cards and badges.
 * Ensures businesses in Wolaita Sodo (and all non-Addis Ababa cities) clearly
 * display their true city name and not erroneous "Bole" defaults.
 */
export function getBusinessCardLocation(biz: Partial<Business> | any): string {
  if (!biz) return "Local Business";

  let city = (biz.cityName || biz.city || "").trim();
  let district = (biz.districtName || biz.district || biz.subcity || "").trim();
  const address = (biz.addressLine || biz.address || "").trim();
  const name = (biz.name || "").trim();

  // Special guard for Wolaita Sodo / Wolayta Sodo
  const isWolaita =
    /wolaita\s*sodo|wolayta\s*sodo|\bwolaita\b|\bwolayta\b/i.test(name) ||
    /wolaita\s*sodo|wolayta\s*sodo|\bwolaita\b|\bwolayta\b/i.test(address) ||
    /wolaita\s*sodo|wolayta\s*sodo|\bwolaita\b|\bwolayta\b/i.test(city);

  if (isWolaita) {
    city = "Wolaita Sodo";
    if (
      !district ||
      ADDIS_ABABA_DISTRICTS.has(district.toLowerCase()) ||
      district.toLowerCase() === "addis ababa"
    ) {
      district = "Wolaita Sodo";
    }
    return "Wolaita Sodo";
  }

  // Check coordinates if available
  const lat = biz.latitude ?? (biz.location?.coordinates ? biz.location.coordinates[1] : undefined);
  const lng = biz.longitude ?? (biz.location?.coordinates ? biz.location.coordinates[0] : undefined);
  if (lat && lng) {
    const coordMatch = detectLocationFromCoordinates(lat, lng, biz.countryName || "Ethiopia", 35);
    if (coordMatch && coordMatch.city.toLowerCase() !== "addis ababa") {
      city = coordMatch.city;
      if (ADDIS_ABABA_DISTRICTS.has(district.toLowerCase())) {
        district = coordMatch.subcity || coordMatch.city;
      }
    }
  }

  // If city is not Addis Ababa but district was accidentally set to an Addis Ababa district (like "Bole")
  if (city && city.toLowerCase() !== "addis ababa" && district && ADDIS_ABABA_DISTRICTS.has(district.toLowerCase())) {
    return city;
  }

  // For any city other than Addis Ababa, always prioritize showing the city name
  // so visitors know which municipality / regional center the business belongs to
  if (city && city.toLowerCase() !== "addis ababa") {
    if (district && district.toLowerCase() !== city.toLowerCase() && !district.toLowerCase().includes("central")) {
      return `${district}, ${city}`;
    }
    return city;
  }

  // For Addis Ababa or general listings, return district if available, otherwise city
  return district || city || "Addis Ababa";
}
