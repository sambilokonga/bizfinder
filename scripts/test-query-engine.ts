import { parseNaturalSearchQuery } from "../src/lib/search/query-parser";
import {
  calculateDistanceKm,
  formatDistance,
  isWithinBounds,
  getBoundingBox,
  sortByDistance,
  filterWithinRadius,
  estimateWalkingMinutes,
  estimateDrivingMinutes,
} from "../src/lib/search/geo-distance";
import {
  getLiveOpeningStatus,
  formatTime12h,
  getFormattedWeekSchedule,
  isBusinessOpen,
} from "../src/lib/utils/opening-hours";
import { OpeningHourSlot } from "../src/types/business";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("\n=========================================");
console.log("TEST SUITE 1: Natural-Language Query Parser");
console.log("=========================================");

// Test 1: Category + Location + Open Now + Radius
{
  const q = parseNaturalSearchQuery("open cafe in bole within 5km");
  assert(q.extractedCategory === "cafe-coffee", `Extracted category was ${q.extractedCategory}, expected cafe-coffee`);
  assert(q.extractedLocation === "bole", `Extracted location was ${q.extractedLocation}, expected bole`);
  assert(q.extractedModifiers.openNow === true, `Open now should be true`);
  assert(q.extractedModifiers.radiusKm === 5, `Radius should be 5km`);
}

// Test 2: Ratings + Category alias + Near me
{
  const q = parseNaturalSearchQuery("top rated Italian restaurants near me");
  assert(q.extractedCategory === "restaurants-dining", `Extracted category was ${q.extractedCategory}, expected restaurants-dining`);
  assert(q.extractedModifiers.ratingMin === 4.5, `Rating min should be 4.5 for top rated`);
  assert(q.extractedModifiers.nearMe === true, `Near me should be true`);
  assert(q.remainingKeywords.includes("italian"), `Italian should be in remaining keywords: ${q.remainingKeywords}`);
}

// Test 3: 24/7 + Price Tier + Location
{
  const q = parseNaturalSearchQuery("cheap 24/7 pharmacy in kazanchis");
  assert(q.extractedCategory === "health-medical", `Extracted category was ${q.extractedCategory}, expected health-medical`);
  assert(q.extractedLocation === "kazanchis", `Extracted location was ${q.extractedLocation}, expected kazanchis`);
  assert(q.extractedModifiers.openNow === true, `24/7 pharmacy should set openNow`);
}

// Test 4: Miles conversion & subcity
{
  const q = parseNaturalSearchQuery("mechanic in westlands within 3 miles");
  assert(q.extractedCategory === "automotive", `Extracted category was ${q.extractedCategory}, expected automotive`);
  assert(q.extractedLocation === "westlands", `Extracted location was ${q.extractedLocation}, expected westlands`);
  assert(q.extractedModifiers.radiusKm === 5, `3 miles should convert to approx 5km (got ${q.extractedModifiers.radiusKm})`);
}

console.log("\n=========================================");
console.log("TEST SUITE 2: Haversine Geo-Distance Calculator");
console.log("=========================================");

// Test Addis Ababa Bole (8.9954, 38.7891) to Kazanchis (9.0182, 38.7678)
{
  const dist = calculateDistanceKm(8.9954, 38.7891, 9.0182, 38.7678);
  assert(dist > 3.0 && dist < 4.0, `Bole to Kazanchis should be ~3.4km, got ${dist.toFixed(2)} km`);
  assert(formatDistance(dist) === `${dist.toFixed(1)} km`, `Formatted distance should be in km`);
}

// Test short distance formatting in meters
{
  const shortDist = calculateDistanceKm(8.9954, 38.7891, 8.9960, 38.7895);
  const formatted = formatDistance(shortDist);
  assert(formatted.endsWith(" m"), `Short distance should be formatted in meters, got ${formatted}`);
}

// Test Bounding Box
{
  const bbox = getBoundingBox(9.0182, 38.7678, 5);
  assert(bbox.north > 9.0182 && bbox.south < 9.0182, "Bounding box latitude correct");
  assert(bbox.east > 38.7678 && bbox.west < 38.7678, "Bounding box longitude correct");
  assert(isWithinBounds(9.0182, 38.7678, bbox), "Center should be within bounding box");
}

// Test Sorting & Radius Filtering
{
  const places = [
    { name: "Far", lat: 9.1000, lng: 38.8000 },
    { name: "Close", lat: 8.9960, lng: 38.7895 },
    { name: "Medium", lat: 9.0200, lng: 38.7700 },
  ];
  const sorted = sortByDistance(places, 8.9954, 38.7891, (p) => ({ lat: p.lat, lng: p.lng }));
  assert(sorted[0].name === "Close", "Closest place should be first");
  assert(sorted[2].name === "Far", "Farthest place should be last");

  const within2Km = filterWithinRadius(places, 8.9954, 38.7891, 2, (p) => ({ lat: p.lat, lng: p.lng }));
  assert(within2Km.length === 1 && within2Km[0].name === "Close", "Radius filtering works properly");
}

// Test Travel Time estimates
{
  const walkMins = estimateWalkingMinutes(2.4);
  const driveMins = estimateDrivingMinutes(2.4);
  assert(walkMins > 20 && walkMins < 40, `Walking time estimate reasonable (${walkMins} min)`);
  assert(driveMins >= 1 && driveMins < walkMins, `Driving time estimate reasonable (${driveMins} min)`);
}

console.log("\n=========================================");
console.log("TEST SUITE 3: Real-Time Opening Hours Evaluator");
console.log("=========================================");

// Test 1: 12h time formatting
{
  assert(formatTime12h("08:30") === "8:30 AM", "08:30 formatted to 8:30 AM");
  assert(formatTime12h("18:00") === "6:00 PM", "18:00 formatted to 6:00 PM");
  assert(formatTime12h("00:00") === "12:00 AM", "00:00 formatted to 12:00 AM");
  assert(formatTime12h("12:00") === "12:00 PM", "12:00 formatted to 12:00 PM");
}

// Test 2: Standard Day Slot (Monday 08:00 - 20:00)
{
  const slots: OpeningHourSlot[] = [
    { dayOfWeek: 1, openTime: "08:00", closeTime: "20:00", isClosed: false }, // Mon
    { dayOfWeek: 2, openTime: "08:00", closeTime: "20:00", isClosed: false }, // Tue
  ];

  // Mon at 14:00 (Open)
  const monAfternoon = new Date("2026-08-24T14:00:00"); // 2026-08-24 is a Monday
  const status1 = getLiveOpeningStatus(slots, monAfternoon);
  assert(status1.isOpen === true, "Should be open at 14:00 on Monday");
  assert(status1.statusColor === "emerald", "Status color should be emerald");

  // Mon at 19:35 (Closing soon, 25 mins left)
  const monClosingSoon = new Date("2026-08-24T19:35:00");
  const status2 = getLiveOpeningStatus(slots, monClosingSoon);
  assert(status2.isOpen === true, "Should still be open during closing soon window");
  assert(status2.statusColor === "amber", "Status color should be amber when closing soon");
  assert(Boolean(status2.nextChangeText?.includes("25 min")), `Should indicate closes in 25 mins: ${status2.nextChangeText}`);

  // Mon at 07:30 (Opening soon, 30 mins left)
  const monOpeningSoon = new Date("2026-08-24T07:30:00");
  const status3 = getLiveOpeningStatus(slots, monOpeningSoon);
  assert(status3.isOpen === false, "Should not be open before 08:00");
  assert(status3.statusColor === "amber", "Status color should be amber when opening soon");

  // Mon at 21:00 (Closed, opens tomorrow at 8:00 AM)
  const monNight = new Date("2026-08-24T21:00:00");
  const status4 = getLiveOpeningStatus(slots, monNight);
  assert(status4.isOpen === false, "Should be closed at 21:00");
  assert(status4.statusText.includes("Opens tomorrow at 8:00 AM"), `Should project tomorrow opening: ${status4.statusText}`);
}

// Test 3: Overnight Slot (e.g. Club/Bar: Mon 18:00 - 03:00)
{
  const slots: OpeningHourSlot[] = [
    { dayOfWeek: 1, openTime: "18:00", closeTime: "03:00", isClosed: false }, // Mon night to Tue 3am
    { dayOfWeek: 2, openTime: "18:00", closeTime: "03:00", isClosed: false }, // Tue night to Wed 3am
  ];

  // Mon 23:30 (Open)
  const monNight = new Date("2026-08-24T23:30:00");
  const status1 = getLiveOpeningStatus(slots, monNight);
  assert(status1.isOpen === true, "Overnight bar should be open at 23:30 on Monday");

  // Tue 01:30 (Still open from Monday overnight shift!)
  const tueEarlyMorning = new Date("2026-08-25T01:30:00");
  const status2 = getLiveOpeningStatus(slots, tueEarlyMorning);
  assert(status2.isOpen === true, "Overnight bar should be open at 01:30 AM Tuesday from Monday's shift");
  assert(status2.statusText.includes("Open until 3:00 AM"), `Status text should show 3:00 AM closing: ${status2.statusText}`);

  // Tue 04:00 (Closed)
  const tueMorning = new Date("2026-08-25T04:00:00");
  const status3 = getLiveOpeningStatus(slots, tueMorning);
  assert(status3.isOpen === false, "Bar should be closed at 04:00 AM Tuesday");
}

// Test 4: 24/7 business
{
  const slots: OpeningHourSlot[] = [
    { dayOfWeek: 0, is24h: true },
    { dayOfWeek: 1, is24h: true },
    { dayOfWeek: 2, is24h: true },
    { dayOfWeek: 3, is24h: true },
    { dayOfWeek: 4, is24h: true },
    { dayOfWeek: 5, is24h: true },
    { dayOfWeek: 6, is24h: true },
  ];
  const status = getLiveOpeningStatus(slots, new Date("2026-08-24T03:30:00"));
  assert(status.isOpen === true, "24/7 business should be open");
  assert(status.statusText === "Open 24 Hours", "Status text should be Open 24 Hours");
}

// Test 5: Formatted Week Schedule
{
  const slots: OpeningHourSlot[] = [
    { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00", isClosed: false },
    { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00", isClosed: false },
    { dayOfWeek: 0, isClosed: true },
  ];
  const schedule = getFormattedWeekSchedule(slots, new Date("2026-08-24T12:00:00")); // Monday
  assert(schedule.length === 7, "Should have 7 days in schedule");
  const monday = schedule.find((s) => s.day === "Monday");
  const sunday = schedule.find((s) => s.day === "Sunday");
  assert(monday?.isToday === true, "Monday should be marked as today");
  assert(monday?.hours === "8:00 AM - 5:00 PM", `Monday hours formatted: ${monday?.hours}`);
  assert(sunday?.hours === "Closed", "Sunday should be closed");
}

console.log("\n=========================================");
console.log("🎉 ALL STEP 4 TESTS PASSED SUCCESSFULLY!");
console.log("=========================================\n");
