import { SEED_CATEGORIES } from "../src/lib/db/seed-data/categories";

console.log("-----------------------------------------");
console.log("   SHOPS & RETAIL VERIFICATION SCRIPT");
console.log("-----------------------------------------");

// 1. Find Shops & Retail main category
const mainCategory = SEED_CATEGORIES.find((c) => c.id === "cat-shops-retail");
console.log("Main Category:", mainCategory);

if (!mainCategory) {
  console.error("FAILED: 'cat-shops-retail' not found!");
  process.exit(1);
}

// 2. Find subcategories under cat-shops-retail
const subcategories = SEED_CATEGORIES.filter((c) => c.parentId === "cat-shops-retail");
console.log(`Subcategories found under 'Shops & Retail': ${subcategories.length}`);

if (subcategories.length !== 128) {
  console.error(`FAILED: Expected 128 subcategories, found ${subcategories.length}`);
  process.exit(1);
}

// 3. Verify all 128 subcategories have options
let totalOptionsCount = 0;
const subcatMissingOptions: string[] = [];

subcategories.forEach((sc, idx) => {
  const options = SEED_CATEGORIES.filter((c) => c.parentId === sc.id);
  if (options.length === 0) {
    subcatMissingOptions.push(sc.name);
  }
  totalOptionsCount += options.length;
});

console.log(`Total listing options / specialties across 128 subcategories: ${totalOptionsCount}`);

if (subcatMissingOptions.length > 0) {
  console.error("FAILED: Subcategories missing options:", subcatMissingOptions);
  process.exit(1);
}

// 4. Check for duplicate category IDs
const allIds = SEED_CATEGORIES.map((c) => c.id);
const uniqueIds = new Set(allIds);
if (allIds.length !== uniqueIds.size) {
  console.error(`FAILED: Found ${allIds.length - uniqueIds.size} duplicate IDs!`);
  process.exit(1);
}

// 5. Test specific requested entries
const samples = [
  { no: 1, name: "Food & Grocery Stores", sampleOption: "Supermarkets" },
  { no: 10, name: "Coffee & Tea Stores", sampleOption: "Yirgacheffe Coffee Shops" },
  { no: 12, name: "Traditional Clothing Stores", sampleOption: "Habesha Kemis" },
  { no: 58, name: "Automotive Parts Stores", sampleOption: "Automobile seller" },
  { no: 69, name: "Books Stores", sampleOption: "Amharic Books" },
  { no: 126, name: "Online & E-Commerce", sampleOption: "Online Marketplace Stores" },
  { no: 127, name: "Car and Track", sampleOption: "Heavy track" },
  { no: 128, name: "Ethiopian Products", sampleOption: "Teff White" },
];

for (const sample of samples) {
  const sub = subcategories.find((s) => s.name.toLowerCase() === sample.name.toLowerCase());
  if (!sub) {
    console.error(`FAILED: Could not find subcategory '${sample.name}'!`);
    process.exit(1);
  }
  const opts = SEED_CATEGORIES.filter((c) => c.parentId === sub.id);
  const foundOpt = opts.find((o) => o.name.toLowerCase() === sample.sampleOption.toLowerCase());
  if (!foundOpt) {
    console.error(`FAILED: Could not find option '${sample.sampleOption}' under '${sample.name}'! Available:`, opts.map(o => o.name));
    process.exit(1);
  }
  console.log(`[PASS] Verified Subcategory #${sample.no} "${sub.name}" -> Option "${foundOpt.name}"`);
}

console.log("-----------------------------------------");
console.log("ALL 128 SUBCATEGORIES & OPTIONS VERIFIED!");
console.log("-----------------------------------------");
