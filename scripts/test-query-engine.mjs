// Direct JS verification script for Step 4 Query Engine & Utilities

// 1. Natural Language Query Parser logic
const KNOWN_LOCATIONS = [
  "bole", "kazanchis", "piassa", "mexico", "sarbet", "cmc", "gerji", "megenagna",
  "gotera", "lebu", "ayat", "summit", "saris", "kality", "akaky kaliti", "nifas silk",
  "lafto", "kolfe", "keranio", "lideta", "kirkos", "arada", "yeka", "gullele",
  "addis ketema", "old airport", "22 mazoria", "4 kilo", "6 kilo", "tor hailoch",
  "hayahulet", "addis ababa", "hawassa", "adama", "bahir dar", "dire dawa",
  "nairobi", "westlands", "kilimani", "karen", "kigali", "kampala",
];

const CATEGORY_ALIASES = {
  cafe: "cafe-coffee",
  cafes: "cafe-coffee",
  coffee: "cafe-coffee",
  "coffee shop": "cafe-coffee",
  "coffee shops": "cafe-coffee",
  restaurant: "restaurants-dining",
  restaurants: "restaurants-dining",
  hotel: "hotels-accommodations",
  hotels: "hotels-accommodations",
  doctor: "health-medical",
  dentist: "health-medical",
  pharmacy: "health-medical",
  mechanic: "automotive",
  gym: "fitness-recreation",
  salon: "beauty-spa",
  bar: "nightlife-entertainment",
};

const STOP_WORDS = new Set(["a", "an", "the", "in", "at", "on", "of", "to", "for", "from", "with", "near", "nearby", "around", "close", "find", "search", "looking", "show", "where", "is", "are", "and", "or", "please", "me", "some", "any", "good", "great"]);

function parseNaturalSearchQuery(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) {
    return { rawQuery: "", extractedModifiers: {}, remainingKeywords: [] };
  }
  const normalized = rawQuery.trim().toLowerCase();
  let text = normalized;
  let openNow = false;
  let nearMe = false;
  let radiusKm;
  let ratingMin;
  let verifiedOnly = false;
  let priceTier;

  if (/\b(open\s+now|open\s+late|open\s+24\/7|open\s+right\s+now|open\s+today|currently\s+open|24\/7|24\s*hours|is\s+open|open)\b/i.test(text)) {
    openNow = true;
    text = text.replace(/\b(open\s+now|open\s+late|open\s+24\/7|open\s+right\s+now|open\s+today|currently\s+open|24\/7|24\s*hours|is\s+open|\bopen\b)\b/gi, "").trim();
  }

  if (/\b(near\s+me|nearby|close\s+to\s+me|around\s+me|close\s+by|around\s+here)\b/i.test(text)) {
    nearMe = true;
    text = text.replace(/\b(near\s+me|nearby|close\s+to\s+me|around\s+me|close\s+by|around\s+here)\b/gi, "").trim();
  }

  const kmMatch = text.match(/\bwithin\s+(\d+(?:\.\d+)?)\s*(?:km|k|kilometers?)\b/i) || text.match(/\b(\d+(?:\.\d+)?)\s*(?:km|k|kilometers?)\s*(?:radius|away)?\b/i);
  if (kmMatch) {
    radiusKm = parseFloat(kmMatch[1]);
    text = text.replace(kmMatch[0], "").trim();
  } else {
    const milesMatch = text.match(/\bwithin\s+(\d+(?:\.\d+)?)\s*(?:miles?|mi)\b/i) || text.match(/\b(\d+(?:\.\d+)?)\s*(?:miles?|mi)\s*(?:radius|away)?\b/i);
    if (milesMatch) {
      radiusKm = Math.round(parseFloat(milesMatch[1]) * 1.60934);
      text = text.replace(milesMatch[0], "").trim();
    }
  }

  if (/\b(top\s*rated|best|highest\s*rated)\b/i.test(text)) {
    ratingMin = 4.5;
    text = text.replace(/\b(top\s*rated|best|highest\s*rated)\b/gi, "").trim();
  } else if (/\b(highly\s*rated|recommended)\b/i.test(text)) {
    ratingMin = 4.0;
    text = text.replace(/\b(highly\s*rated|recommended)\b/gi, "").trim();
  }

  if (/\b(cheap|budget|affordable|low\s*cost|\$)\b/i.test(text)) {
    priceTier = "$";
    text = text.replace(/\b(cheap|budget|affordable|low\s*cost|\$)\b/gi, "").trim();
  } else if (/\b(luxury|fine\s*dining|expensive|upscale|\$\$\$\$)\b/i.test(text)) {
    priceTier = "$$$$";
    text = text.replace(/\b(luxury|fine\s*dining|expensive|upscale|\$\$\$\$)\b/gi, "").trim();
  }

  let extractedLocation;
  for (const loc of KNOWN_LOCATIONS) {
    const locPattern = new RegExp(`\\b(?:in|near|around|at)?\\s*${loc}\\b`, "i");
    if (locPattern.test(text)) {
      extractedLocation = loc;
      text = text.replace(locPattern, "").trim();
      break;
    }
  }

  let extractedCategory;
  for (const [alias, canonicalSlug] of Object.entries(CATEGORY_ALIASES)) {
    const aliasPattern = new RegExp(`\\b${alias}\\b`, "i");
    if (aliasPattern.test(text)) {
      extractedCategory = canonicalSlug;
      text = text.replace(aliasPattern, "").trim();
      break;
    }
  }

  const rawRemainingWords = text.split(/\s+/).map((w) => w.replace(/^[^\w]+|[^\w]+$/g, "").trim()).filter(Boolean);
  const remainingKeywords = rawRemainingWords.filter((w) => !STOP_WORDS.has(w));

  return {
    rawQuery,
    extractedCategory,
    extractedLocation,
    extractedModifiers: { openNow: openNow || undefined, nearMe: nearMe || undefined, radiusKm, ratingMin },
    remainingKeywords,
  };
}

// 2. Haversine Geo-distance
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm) {
  if (!isFinite(distanceKm) || distanceKm < 0) return "--";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

// 3. Opening Hours
function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function getLiveOpeningStatus(openingHours, referenceDate = new Date()) {
  if (!openingHours || openingHours.length === 0) {
    return { isOpen: true, statusText: "Hours not specified", statusColor: "amber", todayHoursText: "Hours not specified" };
  }
  const currentDay = referenceDate.getDay();
  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const todaySlot = openingHours.find((slot) => slot.dayOfWeek === currentDay);
  const yesterdaySlot = openingHours.find((slot) => slot.dayOfWeek === (currentDay + 6) % 7);

  if (yesterdaySlot && !yesterdaySlot.isClosed && !yesterdaySlot.is24h && yesterdaySlot.openTime && yesterdaySlot.closeTime) {
    const [yOpenH, yOpenM] = yesterdaySlot.openTime.split(":").map(Number);
    const [yCloseH, yCloseM] = yesterdaySlot.closeTime.split(":").map(Number);
    const yOpenMins = yOpenH * 60 + yOpenM;
    const yCloseMins = yCloseH * 60 + yCloseM;
    if (yCloseMins < yOpenMins && currentMinutes < yCloseMins) {
      const minsUntilClose = yCloseMins - currentMinutes;
      if (minsUntilClose <= 45) {
        return { isOpen: true, statusText: `Closing soon (${formatTime12h(yesterdaySlot.closeTime)})`, statusColor: "amber", nextChangeText: `Closes in ${minsUntilClose} mins` };
      }
      return { isOpen: true, statusText: `Open until ${formatTime12h(yesterdaySlot.closeTime)}`, statusColor: "emerald" };
    }
  }

  if (!todaySlot || todaySlot.isClosed) {
    return { isOpen: false, statusText: "Closed Today", statusColor: "rose", todayHoursText: "Closed" };
  }

  if (todaySlot.is24h) {
    return { isOpen: true, statusText: "Open 24 Hours", statusColor: "emerald", todayHoursText: "Open 24 Hours" };
  }

  const [openHour, openMin] = (todaySlot.openTime || "00:00").split(":").map(Number);
  const [closeHour, closeMin] = (todaySlot.closeTime || "00:00").split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const todayHoursFormatted = `${formatTime12h(todaySlot.openTime)} - ${formatTime12h(todaySlot.closeTime)}`;

  if (closeMinutes > openMinutes) {
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      const minsUntilClose = closeMinutes - currentMinutes;
      if (minsUntilClose <= 45) {
        return { isOpen: true, statusText: `Closing soon (${formatTime12h(todaySlot.closeTime)})`, statusColor: "amber", nextChangeText: `Closes in ${minsUntilClose} mins`, todayHoursText: todayHoursFormatted };
      }
      return { isOpen: true, statusText: `Open until ${formatTime12h(todaySlot.closeTime)}`, statusColor: "emerald", todayHoursText: todayHoursFormatted };
    } else if (currentMinutes < openMinutes) {
      const minsUntilOpen = openMinutes - currentMinutes;
      if (minsUntilOpen <= 60) {
        return { isOpen: false, statusText: `Opens soon (${formatTime12h(todaySlot.openTime)})`, statusColor: "amber", nextChangeText: `Opens in ${minsUntilOpen} mins`, todayHoursText: todayHoursFormatted };
      }
      return { isOpen: false, statusText: `Closed • Opens at ${formatTime12h(todaySlot.openTime)}`, statusColor: "rose", todayHoursText: todayHoursFormatted };
    } else {
      return { isOpen: false, statusText: "Closed", statusColor: "rose", todayHoursText: todayHoursFormatted };
    }
  } else {
    if (currentMinutes >= openMinutes) {
      return { isOpen: true, statusText: `Open until ${formatTime12h(todaySlot.closeTime)}`, statusColor: "emerald", todayHoursText: todayHoursFormatted };
    } else {
      return { isOpen: false, statusText: `Closed • Opens at ${formatTime12h(todaySlot.openTime)}`, statusColor: "rose", todayHoursText: todayHoursFormatted };
    }
  }
}

// ================= ASSERTIONS =================
function assert(cond, msg) {
  if (!cond) {
    console.error("❌ FAILED:", msg);
    process.exit(1);
  } else {
    console.log("✅ PASSED:", msg);
  }
}

console.log("=== Query Engine Verification ===");
const q1 = parseNaturalSearchQuery("open cafe in bole within 5km");
assert(q1.extractedCategory === "cafe-coffee", "Category: cafe-coffee");
assert(q1.extractedLocation === "bole", "Location: bole");
assert(q1.extractedModifiers.openNow === true, "Modifier: openNow");
assert(q1.extractedModifiers.radiusKm === 5, "Modifier: radiusKm 5");

const q2 = parseNaturalSearchQuery("top rated Italian restaurants near me");
assert(q2.extractedCategory === "restaurants-dining", "Category: restaurants-dining");
assert(q2.extractedModifiers.ratingMin === 4.5, "Modifier: ratingMin 4.5");
assert(q2.extractedModifiers.nearMe === true, "Modifier: nearMe");
assert(q2.remainingKeywords.includes("italian"), "Remaining keywords: italian");

console.log("\n=== Geo Distance Verification ===");
const dist = calculateDistanceKm(8.9954, 38.7891, 9.0182, 38.7678);
assert(dist > 3.0 && dist < 4.0, `Bole to Kazanchis: ${dist.toFixed(2)} km`);
assert(formatDistance(0.4) === "400 m", "Distance format 400 m");
assert(formatDistance(3.45) === "3.5 km", "Distance format 3.5 km");

console.log("\n=== Opening Hours Verification ===");
const slots = [
  { dayOfWeek: 1, openTime: "08:00", closeTime: "20:00", isClosed: false },
];
// Monday 14:00 (2026-08-24 is Monday)
const st1 = getLiveOpeningStatus(slots, new Date("2026-08-24T14:00:00"));
assert(st1.isOpen === true, "Monday 14:00 is Open");
assert(st1.statusColor === "emerald", "Status color is emerald");

// Monday 19:40 (closing soon)
const st2 = getLiveOpeningStatus(slots, new Date("2026-08-24T19:40:00"));
assert(st2.isOpen === true, "Monday 19:40 is Open (closing soon)");
assert(st2.statusColor === "amber", "Status color is amber");

// 24/7
const st24 = getLiveOpeningStatus([{ dayOfWeek: 1, is24h: true }], new Date("2026-08-24T03:00:00"));
assert(st24.isOpen === true && st24.statusText === "Open 24 Hours", "24/7 Status verified");

console.log("\n🎉 ALL STEP 4 CHECKS PASSED!");
