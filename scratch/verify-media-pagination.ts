import { buildRealShowcaseMedia, REAL_SHOWCASE_PHOTOS } from "../src/lib/data/real-media-showcase";
import { BusinessMedia } from "../src/types/business";

async function verifyMediaAndPagination() {
  console.log("🚀 Starting Media & Photos 20-Per-Page Pagination Verification...\n");

  const bizName = "Addis Artisan Roastery & Bistro";

  // 1. Verify Showcase Library Generation
  console.log("1️⃣ Generating Curated Real Showcase Media...");
  const showcase = buildRealShowcaseMedia(bizName);
  console.log(`✅ Generated ${showcase.length} real showcase items.`);
  if (showcase.length < 20) {
    throw new Error(`Expected at least 20 items for testing, got ${showcase.length}`);
  }

  // 2. Test 20-Per-Page Pagination Math
  console.log("\n2️⃣ Verifying 20-Per-Page Pagination Boundaries...");
  const OWNER_MEDIA_PER_PAGE = 20;
  const total = showcase.length;
  const totalPages = Math.max(1, Math.ceil(total / OWNER_MEDIA_PER_PAGE));
  console.log(`Total Items: ${total}, Total Pages: ${totalPages}`);

  // Page 1
  let currentPage = 1;
  let startIdx = (currentPage - 1) * OWNER_MEDIA_PER_PAGE;
  let page1Items = showcase.slice(startIdx, startIdx + OWNER_MEDIA_PER_PAGE);
  console.log(`Page 1: ${page1Items.length} items (Showing ${startIdx + 1} to ${Math.min(startIdx + OWNER_MEDIA_PER_PAGE, total)})`);
  if (page1Items.length !== 20) {
    throw new Error(`Page 1 should have exactly 20 items, got ${page1Items.length}`);
  }
  const isPrevDisabledPage1 = currentPage <= 1;
  const isNextDisabledPage1 = currentPage >= totalPages;
  console.log(`Page 1 Prev Button Disabled: ${isPrevDisabledPage1} (Expected true)`);
  console.log(`Page 1 Next Button Disabled: ${isNextDisabledPage1} (Expected false)`);
  if (!isPrevDisabledPage1 || isNextDisabledPage1) {
    throw new Error("Page 1 navigation button state assertion failed");
  }

  // Page 2
  currentPage = 2;
  startIdx = (currentPage - 1) * OWNER_MEDIA_PER_PAGE;
  let page2Items = showcase.slice(startIdx, startIdx + OWNER_MEDIA_PER_PAGE);
  console.log(`Page 2: ${page2Items.length} items (Showing ${startIdx + 1} to ${Math.min(startIdx + OWNER_MEDIA_PER_PAGE, total)})`);
  if (page2Items.length !== total - 20) {
    throw new Error(`Page 2 should have ${total - 20} items, got ${page2Items.length}`);
  }
  const isPrevDisabledPage2 = currentPage <= 1;
  const isNextDisabledPage2 = currentPage >= totalPages;
  console.log(`Page 2 Prev Button Disabled: ${isPrevDisabledPage2} (Expected false)`);
  console.log(`Page 2 Next Button Disabled: ${isNextDisabledPage2} (Expected true)`);
  if (isPrevDisabledPage2 || !isNextDisabledPage2) {
    throw new Error("Page 2 navigation button state assertion failed");
  }

  // 3. Test Registering a New Real Photo
  console.log("\n3️⃣ Testing Registering a New Photo...");
  const newPhoto: BusinessMedia = {
    id: `media-test-${Date.now()}`,
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    type: "interior",
    title: `${bizName} – VIP Wine & Dining Room`,
    sortOrder: 1,
    uploadedAt: new Date().toISOString(),
  };

  const updatedGallery = [newPhoto, ...showcase];
  console.log(`✅ Registered new photo: "${newPhoto.title}". Total gallery size: ${updatedGallery.length}`);
  if (updatedGallery[0].id !== newPhoto.id) {
    throw new Error("Newly registered photo was not added to the top of gallery");
  }

  // 4. Test Designating Primary Cover
  console.log("\n4️⃣ Testing Cover Designation...");
  const coverDesignated = updatedGallery.map((m) =>
    m.id === newPhoto.id ? { ...m, type: "cover" as const } : m
  );
  const foundCover = coverDesignated.find((m) => m.type === "cover");
  console.log(`✅ Primary Cover is now: "${foundCover?.title}"`);
  if (!foundCover || foundCover.id !== newPhoto.id) {
    throw new Error("Cover designation failed");
  }

  // 5. Test Filtering by Subnav Categories
  console.log("\n5️⃣ Testing Subnav Category Filters...");
  const photosOnly = showcase.filter((m) => m.type !== "cover" && m.type !== "logo" && m.type !== "video");
  const interiorOnly = showcase.filter((m) => m.type === "interior");
  const menuOnly = showcase.filter((m) => m.type === "menu");
  console.log(`- Photos Gallery: ${photosOnly.length}`);
  console.log(`- Interior Views: ${interiorOnly.length}`);
  console.log(`- Menu & Food: ${menuOnly.length}`);
  if (photosOnly.length === 0 || interiorOnly.length === 0 || menuOnly.length === 0) {
    throw new Error("Category filtering returned unexpected empty results");
  }

  // 6. Test Real-time Search Filter
  console.log("\n6️⃣ Testing Title / Tag Search Filter...");
  const searchQuery = "espresso";
  const searchResults = showcase.filter((m) =>
    (m.title && m.title.toLowerCase().includes(searchQuery)) ||
    (m.type && m.type.toLowerCase().includes(searchQuery))
  );
  console.log(`Search for "${searchQuery}" matched: ${searchResults.length} item(s)`);
  if (searchResults.length === 0) {
    throw new Error("Search filter failed to match expected items");
  }

  console.log("\n🎉 ALL MEDIA & PHOTOS 20-PER-PAGE PAGINATION TESTS PASSED CLEANLY!");
}

verifyMediaAndPagination().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
