import { ParsedSearchQuery } from "@/types/search";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";

// Comprehensive known locations (Addis Ababa sub-cities, neighborhoods & East Africa hubs)
const KNOWN_LOCATIONS = [
  // Addis Ababa Sub-cities & Neighborhoods
  "bole",
  "kazanchis",
  "piassa",
  "mexico",
  "sarbet",
  "cmc",
  "gerji",
  "megenagna",
  "gotera",
  "lebu",
  "ayat",
  "summit",
  "saris",
  "kality",
  "akaky kaliti",
  "nifas silk",
  "lafto",
  "kolfe",
  "keranio",
  "lideta",
  "kirkos",
  "arada",
  "yeka",
  "gullele",
  "addis ketema",
  "old airport",
  "22 mazoria",
  "4 kilo",
  "6 kilo",
  "tor hailoch",
  "hayahulet",
  "addis ababa",
  // Regional & International
  "hawassa",
  "adama",
  "bahir dar",
  "dire dawa",
  "nairobi",
  "westlands",
  "kilimani",
  "karen",
  "kigali",
  "kampala",
];

// Common category synonyms and alias mappings to canonical category slugs
const CATEGORY_ALIASES: Record<string, string> = {
  cafe: "cafe-coffee",
  cafes: "cafe-coffee",
  coffee: "cafe-coffee",
  "coffee shop": "cafe-coffee",
  "coffee shops": "cafe-coffee",
  restaurant: "restaurants-dining",
  restaurants: "restaurants-dining",
  food: "restaurants-dining",
  dining: "restaurants-dining",
  eatery: "restaurants-dining",
  hotel: "hotels-accommodations",
  hotels: "hotels-accommodations",
  motel: "hotels-accommodations",
  stay: "hotels-accommodations",
  resort: "hotels-accommodations",
  guest: "hotels-accommodations",
  guesthouse: "hotels-accommodations",
  doctor: "health-medical",
  doctors: "health-medical",
  clinic: "health-medical",
  clinics: "health-medical",
  hospital: "health-medical",
  hospitals: "health-medical",
  dentist: "health-medical",
  dentists: "health-medical",
  dental: "health-medical",
  pharmacy: "health-medical",
  pharmacies: "health-medical",
  drugstore: "health-medical",
  meds: "health-medical",
  mechanic: "automotive",
  mechanics: "automotive",
  auto: "automotive",
  garage: "automotive",
  car: "automotive",
  "car repair": "automotive",
  "car wash": "automotive",
  gym: "fitness-recreation",
  gyms: "fitness-recreation",
  fitness: "fitness-recreation",
  workout: "fitness-recreation",
  salon: "beauty-spa",
  salons: "beauty-spa",
  spa: "beauty-spa",
  spas: "beauty-spa",
  barber: "beauty-spa",
  barbers: "beauty-spa",
  hair: "beauty-spa",
  nails: "beauty-spa",
  massage: "beauty-spa",
  bank: "financial-services",
  banks: "financial-services",
  atm: "financial-services",
  accounting: "financial-services",
  school: "education-training",
  schools: "education-training",
  college: "education-training",
  university: "education-training",
  academy: "education-training",
  supermarket: "shopping-retail",
  supermarkets: "shopping-retail",
  grocery: "shopping-retail",
  groceries: "shopping-retail",
  mall: "shopping-retail",
  boutique: "shopping-retail",
  store: "shopping-retail",
  shop: "shopping-retail",
  plumber: "home-services",
  plumbers: "home-services",
  electrician: "home-services",
  electricians: "home-services",
  cleaning: "home-services",
  contractor: "home-services",
  lawyer: "legal-professional",
  lawyers: "legal-professional",
  attorney: "legal-professional",
  bar: "nightlife-entertainment",
  bars: "nightlife-entertainment",
  pub: "nightlife-entertainment",
  pubs: "nightlife-entertainment",
  club: "nightlife-entertainment",
  lounge: "nightlife-entertainment",
  cinema: "nightlife-entertainment",
  movie: "nightlife-entertainment",
};

// Common conversational / stop words to filter out from residual keywords
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "in",
  "at",
  "on",
  "of",
  "to",
  "for",
  "from",
  "with",
  "near",
  "nearby",
  "around",
  "close",
  "find",
  "search",
  "looking",
  "show",
  "where",
  "is",
  "are",
  "and",
  "or",
  "please",
  "me",
  "some",
  "any",
  "good",
  "great",
]);

/**
 * Natural-language query parser.
 * Extracts:
 * - category (from canonical taxonomy or synonym dictionary)
 * - location (known sub-cities / hubs with preposition handling)
 * - modifiers (openNow, nearMe, radiusKm, ratingMin, priceTier, verifiedOnly)
 * - remainingKeywords (cleaned search terms for full-text match)
 */
export function parseNaturalSearchQuery(rawQuery: string): ParsedSearchQuery {
  if (!rawQuery || !rawQuery.trim()) {
    return {
      rawQuery: "",
      extractedModifiers: {},
      remainingKeywords: [],
    };
  }

  const normalized = rawQuery.trim().toLowerCase();
  let text = normalized;

  let openNow = false;
  let nearMe = false;
  let radiusKm: number | undefined;
  let ratingMin: number | undefined;
  let verifiedOnly = false;
  let priceTier: string | undefined;

  // 1. Detect open now / open late / 24/7 / open prefix modifiers
  if (
    /\b(open\s+now|open\s+late|open\s+24\/7|open\s+right\s+now|open\s+today|currently\s+open|24\/7|24\s*hours|is\s+open|open)\b/i.test(
      text
    )
  ) {
    openNow = true;
    text = text
      .replace(
        /\b(open\s+now|open\s+late|open\s+24\/7|open\s+right\s+now|open\s+today|currently\s+open|24\/7|24\s*hours|is\s+open|\bopen\b)\b/gi,
        ""
      )
      .trim();
  }

  // 2. Detect "near me", "nearby", "close to me", "around me"
  if (/\b(near\s+me|nearby|close\s+to\s+me|around\s+me|close\s+by|around\s+here)\b/i.test(text)) {
    nearMe = true;
    text = text
      .replace(/\b(near\s+me|nearby|close\s+to\s+me|around\s+me|close\s+by|around\s+here)\b/gi, "")
      .trim();
  }

  // 3. Detect radius (e.g., "within 5km", "within 10 km", "5km radius", "within 3 miles")
  const kmMatch =
    text.match(/\bwithin\s+(\d+(?:\.\d+)?)\s*(?:km|k|kilometers?)\b/i) ||
    text.match(/\b(\d+(?:\.\d+)?)\s*(?:km|k|kilometers?)\s*(?:radius|away)?\b/i);
  if (kmMatch) {
    radiusKm = parseFloat(kmMatch[1]);
    text = text.replace(kmMatch[0], "").trim();
  } else {
    const milesMatch =
      text.match(/\bwithin\s+(\d+(?:\.\d+)?)\s*(?:miles?|mi)\b/i) ||
      text.match(/\b(\d+(?:\.\d+)?)\s*(?:miles?|mi)\s*(?:radius|away)?\b/i);
    if (milesMatch) {
      radiusKm = Math.round(parseFloat(milesMatch[1]) * 1.60934);
      text = text.replace(milesMatch[0], "").trim();
    }
  }

  // 4. Detect ratings modifiers (e.g. "top rated", "best", "5 star", "4+ stars", "highly rated")
  if (/\b(top\s*rated|best|highest\s*rated)\b/i.test(text)) {
    ratingMin = 4.5;
    text = text.replace(/\b(top\s*rated|best|highest\s*rated)\b/gi, "").trim();
  } else if (/\b(highly\s*rated|recommended)\b/i.test(text)) {
    ratingMin = 4.0;
    text = text.replace(/\b(highly\s*rated|recommended)\b/gi, "").trim();
  } else {
    const starMatch =
      text.match(/\b([3-5](?:\.[0-9])?)\s*\+?\s*stars?\b/i) ||
      text.match(/\brated\s*([3-5](?:\.[0-9])?)\b/i);
    if (starMatch) {
      ratingMin = parseFloat(starMatch[1]);
      text = text.replace(starMatch[0], "").trim();
    }
  }

  // 5. Detect Price modifiers (e.g., "cheap", "affordable", "budget", "luxury", "expensive")
  if (/\b(cheap|budget|affordable|low\s*cost|\$)\b/i.test(text)) {
    priceTier = "$";
    text = text.replace(/\b(cheap|budget|affordable|low\s*cost|\$)\b/gi, "").trim();
  } else if (/\b(luxury|fine\s*dining|expensive|upscale|\$\$\$\$)\b/i.test(text)) {
    priceTier = "$$$$";
    text = text.replace(/\b(luxury|fine\s*dining|expensive|upscale|\$\$\$\$)\b/gi, "").trim();
  }

  // 6. Detect verified modifier
  if (/\b(verified|verified\s*only|certified)\b/i.test(text)) {
    verifiedOnly = true;
    text = text.replace(/\b(verified|verified\s*only|certified)\b/gi, "").trim();
  }

  // 7. Extract Location
  let extractedLocation: string | undefined;
  for (const loc of KNOWN_LOCATIONS) {
    const locPattern = new RegExp(`\\b(?:in|near|around|at)?\\s*${loc}\\b`, "i");
    if (locPattern.test(text)) {
      extractedLocation = loc;
      text = text.replace(locPattern, "").trim();
      break;
    }
  }

  // 8. Extract Category keyword (from taxonomy or alias map)
  let extractedCategory: string | undefined;

  // First check alias phrases / exact matches in dictionary
  for (const [alias, canonicalSlug] of Object.entries(CATEGORY_ALIASES)) {
    const aliasPattern = new RegExp(`\\b${alias}\\b`, "i");
    if (aliasPattern.test(text)) {
      extractedCategory = canonicalSlug;
      text = text.replace(aliasPattern, "").trim();
      break;
    }
  }

  // Next check exact phrase matches with taxonomy names
  if (!extractedCategory) {
    for (const cat of SEED_CATEGORIES) {
      const catName = cat.name.toLowerCase();
      if (text.includes(catName)) {
        extractedCategory = cat.slug;
        text = text.replace(catName, "").trim();
        break;
      }
    }
  }

  // Next check single words against category slugs
  if (!extractedCategory) {
    const words = text.split(/\s+/).filter(Boolean);
    for (const word of words) {
      if (word.length < 3) continue;
      const found = SEED_CATEGORIES.find(
        (c) =>
          c.slug.toLowerCase().includes(word) ||
          c.name.toLowerCase().includes(word)
      );
      if (found) {
        extractedCategory = found.slug;
        text = text.replace(new RegExp(`\\b${word}\\b`, "i"), "").trim();
        break;
      }
    }
  }

  // 9. Extract and sanitize remaining keywords
  const rawRemainingWords = text
    .split(/\s+/)
    .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, "").trim())
    .filter(Boolean);

  const remainingKeywords = rawRemainingWords.filter((w) => !STOP_WORDS.has(w));

  return {
    rawQuery,
    extractedCategory,
    extractedLocation,
    extractedModifiers: {
      openNow: openNow || undefined,
      nearMe: nearMe || undefined,
      radiusKm,
      ratingMin,
    },
    remainingKeywords,
  };
}

