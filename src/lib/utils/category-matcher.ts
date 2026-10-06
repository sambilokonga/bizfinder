import { SEED_CATEGORIES, getCategoryBySlug } from "@/lib/db/seed-data/categories";
import { Category } from "@/types/category";

/**
 * Common legacy/alias mappings between database category keys and canonical SEED_CATEGORIES IDs.
 * Both directions are supported.
 */
export const CATEGORY_ALIASES: Record<string, string[]> = {
  // Hotels & Accommodation (cat-31)
  "cat-31": [
    "cat-31",
    "hotels-accommodation",
    "hotels",
    "hotel",
    "cat-lodging",
    "cat-lodging-luxury",
    "lodging-stays",
    "cat-31-1",
    "luxury-hotel",
    "cat-31-1-1",
    "business-boutique-hotel",
    "cat-31-1-2",
  ],
  "hotels-accommodation": [
    "cat-31",
    "hotels-accommodation",
    "hotels",
    "hotel",
    "cat-lodging",
    "cat-lodging-luxury",
    "lodging-stays",
    "cat-31-1",
  ],
  "hotels": ["cat-31", "hotels-accommodation", "cat-lodging", "lodging-stays", "cat-31-1"],
  "cat-lodging": ["cat-31", "hotels-accommodation", "hotels", "lodging-stays", "cat-31-1"],
  "lodging-stays": ["cat-31-1", "cat-31", "hotels-accommodation", "hotels", "cat-lodging"],

  // Banking & Financial Services (cat-17)
  "cat-17": [
    "cat-17",
    "banking-financial-services",
    "banking-finance",
    "banks-atms",
    "commercial-bank",
    "banks",
    "bank",
    "cat-17-1",
    "cat-17-1-1",
  ],
  "banking-financial-services": [
    "cat-17",
    "banking-financial-services",
    "banking-finance",
    "banks-atms",
    "commercial-bank",
    "banks",
    "bank",
    "cat-17-1",
  ],
  "banking-finance": [
    "cat-17",
    "banking-financial-services",
    "banking-finance",
    "banks-atms",
    "commercial-bank",
    "banks",
    "bank",
    "cat-17-1",
  ],
  "banks-atms": [
    "cat-17-1",
    "cat-17",
    "banking-financial-services",
    "banking-finance",
    "commercial-bank",
    "banks",
    "bank",
  ],

  // Restaurants & Food Services (cat-1)
  "cat-1": [
    "cat-1",
    "restaurants-food-services",
    "restaurants",
    "cat-dining",
    "cat-dining-restaurants",
    "cat-dining-cafes",
    "food-dining",
    "dining",
    "cat-1-1",
  ],
  "restaurants-food-services": [
    "cat-1",
    "restaurants-food-services",
    "restaurants",
    "cat-dining",
    "cat-dining-restaurants",
    "cat-dining-cafes",
    "food-dining",
    "dining",
  ],
  "cat-dining": [
    "cat-1",
    "restaurants-food-services",
    "restaurants",
    "cat-dining",
    "cat-dining-restaurants",
    "cat-dining-cafes",
    "food-dining",
    "dining",
  ],
  "restaurants": [
    "cat-1",
    "cat-1-1",
    "restaurants-food-services",
    "cat-dining",
    "cat-dining-restaurants",
  ],

  // Health & Medical (cat-8)
  "cat-8": [
    "cat-8",
    "health-medical",
    "cat-health",
    "cat-health-pharmacy",
    "pharmacy",
    "medical",
  ],
  "health-medical": [
    "cat-8",
    "health-medical",
    "cat-health",
    "cat-health-pharmacy",
    "pharmacy",
    "medical",
  ],
  "cat-health": [
    "cat-8",
    "health-medical",
    "cat-health",
    "cat-health-pharmacy",
    "pharmacy",
    "medical",
  ],

  // Automotive & Vehicles (cat-27)
  "cat-27": [
    "cat-27",
    "automotive-vehicles",
    "cat-automotive",
    "cat-auto-repair",
    "automotive",
    "auto-repair",
  ],
  "automotive-vehicles": [
    "cat-27",
    "automotive-vehicles",
    "cat-automotive",
    "cat-auto-repair",
    "automotive",
    "auto-repair",
  ],
  "cat-automotive": [
    "cat-27",
    "automotive-vehicles",
    "cat-automotive",
    "cat-auto-repair",
    "automotive",
    "auto-repair",
  ],

  // Shopping & Retail (cat-shops-retail)
  "cat-shops-retail": [
    "cat-shops-retail",
    "shops-retail",
    "cat-shopping",
    "cat-shopping-electronics",
    "shopping",
    "retail",
  ],
  "shops-retail": [
    "cat-shops-retail",
    "shops-retail",
    "cat-shopping",
    "cat-shopping-electronics",
    "shopping",
    "retail",
  ],
  "cat-shopping": [
    "cat-shops-retail",
    "shops-retail",
    "cat-shopping",
    "cat-shopping-electronics",
    "shopping",
    "retail",
  ],
};

/**
 * Keyword hints for category name matching
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "cat-31": ["hotel", "lodging", "accommodation", "resort", "motel", "stay", "guest house"],
  "hotels-accommodation": ["hotel", "lodging", "accommodation", "resort", "motel", "stay", "guest house"],
  "cat-17": ["bank", "banking", "finance", "financial", "atm"],
  "banking-financial-services": ["bank", "banking", "finance", "financial", "atm"],
  "banking-finance": ["bank", "banking", "finance", "financial", "atm"],
  "cat-1": ["restaurant", "food", "dining", "cuisine", "cafe", "bites", "eatery"],
  "restaurants-food-services": ["restaurant", "food", "dining", "cuisine", "cafe", "bites", "eatery"],
  "cat-8": ["health", "medical", "hospital", "clinic", "pharmacy", "doctor"],
  "health-medical": ["health", "medical", "hospital", "clinic", "pharmacy", "doctor"],
  "cat-27": ["automotive", "vehicle", "car", "auto", "repair", "dealership"],
  "automotive-vehicles": ["automotive", "vehicle", "car", "auto", "repair", "dealership"],
  "cat-shops-retail": ["shop", "retail", "store", "mall", "market", "boutique", "shopping"],
  "shops-retail": ["shop", "retail", "store", "mall", "market", "boutique", "shopping"],
};

/**
 * Recursively retrieves all descendant IDs and slugs for a given category ID in SEED_CATEGORIES
 */
function getDescendants(catId: string): { ids: string[]; slugs: string[] } {
  const ids: string[] = [];
  const slugs: string[] = [];

  const children = SEED_CATEGORIES.filter((c) => c.parentId === catId);
  for (const child of children) {
    ids.push(child.id);
    slugs.push(child.slug);
    const sub = getDescendants(child.id);
    ids.push(...sub.ids);
    slugs.push(...sub.slugs);
  }

  return { ids, slugs };
}

/**
 * Resolves any category input (ID, slug, alias, or name) into all related IDs, slugs, and keywords.
 */
export function getCategoryRelatedTokens(categoryInput: string): {
  targetCategory?: Category;
  allIds: string[];
  allSlugs: string[];
  keywords: string[];
} {
  if (!categoryInput || categoryInput === "all") {
    return { allIds: [], allSlugs: [], keywords: [] };
  }

  const normalized = categoryInput.trim().toLowerCase();
  const allIds = new Set<string>();
  const allSlugs = new Set<string>();
  const keywords = new Set<string>();

  // Add the input itself
  allIds.add(categoryInput);
  allSlugs.add(normalized);

  // 1. Check known aliases
  const aliasList = CATEGORY_ALIASES[categoryInput] || CATEGORY_ALIASES[normalized];
  if (aliasList) {
    for (const a of aliasList) {
      if (a.startsWith("cat-")) allIds.add(a);
      allSlugs.add(a.toLowerCase());
    }
  }

  // Check if any alias key matches
  for (const [key, list] of Object.entries(CATEGORY_ALIASES)) {
    if (key.toLowerCase() === normalized || list.includes(categoryInput) || list.includes(normalized)) {
      if (key.startsWith("cat-")) allIds.add(key);
      allSlugs.add(key.toLowerCase());
      for (const a of list) {
        if (a.startsWith("cat-")) allIds.add(a);
        allSlugs.add(a.toLowerCase());
      }
    }
  }

  // 2. Find matching Category object in SEED_CATEGORIES
  let targetCategory = getCategoryBySlug(categoryInput);
  if (!targetCategory) {
    // Try finding by slug or id case-insensitively
    targetCategory = SEED_CATEGORIES.find(
      (c) =>
        c.slug.toLowerCase() === normalized ||
        c.id.toLowerCase() === normalized ||
        c.name.toLowerCase() === normalized
    );
  }

  // If still not found, check if an alias mapped to a canonical ID in SEED_CATEGORIES
  if (!targetCategory) {
    for (const id of allIds) {
      const found = SEED_CATEGORIES.find((c) => c.id === id || c.slug === id);
      if (found) {
        targetCategory = found;
        break;
      }
    }
  }

  if (targetCategory) {
    allIds.add(targetCategory.id);
    allSlugs.add(targetCategory.slug.toLowerCase());
    keywords.add(targetCategory.name.toLowerCase());

    // Extract word tokens from category name (e.g. "Hotels", "Accommodation")
    targetCategory.name
      .split(/[\s,&/]+/)
      .filter((w) => w.length > 2)
      .forEach((w) => keywords.add(w.toLowerCase()));

    // Get all tree descendants (children and grandchildren)
    const descendants = getDescendants(targetCategory.id);
    descendants.ids.forEach((id) => allIds.add(id));
    descendants.slugs.forEach((slug) => allSlugs.add(slug.toLowerCase()));

    // If it has a parent, also include parent info
    if (targetCategory.parentId) {
      allIds.add(targetCategory.parentId);
      const parent = SEED_CATEGORIES.find((c) => c.id === targetCategory?.parentId);
      if (parent) {
        allSlugs.add(parent.slug.toLowerCase());
      }
    }
  }

  // 3. Add predefined keywords
  for (const id of Array.from(allIds).concat(Array.from(allSlugs))) {
    const kws = CATEGORY_KEYWORDS[id] || CATEGORY_KEYWORDS[id.toLowerCase()];
    if (kws) {
      kws.forEach((k) => keywords.add(k.toLowerCase()));
    }
  }

  return {
    targetCategory,
    allIds: Array.from(allIds),
    allSlugs: Array.from(allSlugs),
    keywords: Array.from(keywords),
  };
}

/**
 * Tests if a business matches a category query (robustly across IDs, subcategories, names, and aliases).
 */
export function isBusinessInCategory(
  biz: {
    categoryId?: string;
    categoryName?: string;
    subcategoryId?: string;
    subcategoryName?: string;
    subSubcategoryId?: string;
    subSubcategoryName?: string;
    slug?: string;
    name?: string;
  },
  categoryInput: string
): boolean {
  if (!categoryInput || categoryInput === "all") return true;

  const { allIds, allSlugs, keywords } = getCategoryRelatedTokens(categoryInput);

  const bizCatId = biz.categoryId || "";
  const bizSubCatId = biz.subcategoryId || "";
  const bizSubSubCatId = biz.subSubcategoryId || "";
  const bizCatName = (biz.categoryName || "").toLowerCase();
  const bizSubCatName = (biz.subcategoryName || "").toLowerCase();
  const bizSlug = (biz.slug || "").toLowerCase();
  const bizName = (biz.name || "").toLowerCase();

  // 1. Direct ID / Slug match against related tokens
  for (const token of allIds) {
    const t = token.toLowerCase();
    if (
      bizCatId.toLowerCase() === t ||
      bizSubCatId.toLowerCase() === t ||
      bizSubSubCatId.toLowerCase() === t
    ) {
      return true;
    }
  }

  for (const token of allSlugs) {
    const t = token.toLowerCase();
    if (
      bizCatId.toLowerCase() === t ||
      bizSubCatId.toLowerCase() === t ||
      bizSubSubCatId.toLowerCase() === t ||
      bizSlug.includes(t)
    ) {
      return true;
    }
  }

  // 2. Keyword match in category or subcategory name
  for (const kw of keywords) {
    if (kw.length >= 3) {
      if (bizCatName.includes(kw) || bizSubCatName.includes(kw)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Builds a MongoDB query condition for category filtering.
 */
export function getCategoryMongoCondition(categoryInput: string): Record<string, any>[] {
  const { allIds, allSlugs, keywords } = getCategoryRelatedTokens(categoryInput);

  const searchTokens = Array.from(new Set([...allIds, ...allSlugs]));
  const regexConditions: any[] = [];

  // Match categoryId, subcategoryId, subSubcategoryId
  const idConditions: any[] = [
    { categoryId: { $in: searchTokens } },
    { subcategoryId: { $in: searchTokens } },
    { subSubcategoryId: { $in: searchTokens } },
  ];

  // Add regex matches for prominent keywords
  const validKeywords = keywords.filter((k) => k.length >= 4);
  if (validKeywords.length > 0) {
    const pattern = validKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const rx = new RegExp(pattern, "i");
    regexConditions.push({ categoryName: { $regex: rx } });
    regexConditions.push({ subcategoryName: { $regex: rx } });
  }

  return [...idConditions, ...regexConditions];
}
