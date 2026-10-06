import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { CategoryModel } from "@/lib/db/models/Category";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";

export async function GET() {
  try {
    await connectToDatabase();
    let docs = await CategoryModel.find({}).sort({ level: 1, name: 1 }).lean();

    // If database has no categories yet, initialize with seed data for actual database persistence
    if (!docs || docs.length === 0) {
      try {
        const seedToInsert = SEED_CATEGORIES.map((c) => ({
          id: c.id,
          parentId: c.parentId ?? null,
          name: c.name,
          slug: c.slug,
          icon: c.icon || (c.level === 1 ? "Folder" : "Tag"),
          level: c.level,
          featured: c.featured ?? false,
        }));
        await CategoryModel.insertMany(seedToInsert, { ordered: false });
        docs = await CategoryModel.find({}).sort({ level: 1, name: 1 }).lean();
      } catch (seedErr) {
        console.warn("[API /categories GET] Auto-seeding initial categories notice:", seedErr);
        return NextResponse.json({ categories: SEED_CATEGORIES, seeded: false });
      }
    } else {
      // If new categories (like updated Shops & Retail taxonomy) were added to SEED_CATEGORIES, sync them
      const existingIds = new Set(docs.map((d: any) => d.id));
      const missingSeed = SEED_CATEGORIES.filter((c) => !existingIds.has(c.id));
      if (missingSeed.length > 0) {
        try {
          const toInsert = missingSeed.map((c) => ({
            id: c.id,
            parentId: c.parentId ?? null,
            name: c.name,
            slug: c.slug,
            icon: c.icon || (c.level === 1 ? "Folder" : "Tag"),
            level: c.level,
            featured: c.featured ?? false,
          }));
          await CategoryModel.insertMany(toInsert, { ordered: false });
          docs = await CategoryModel.find({}).sort({ level: 1, name: 1 }).lean();
        } catch (syncErr) {
          console.warn("[API /categories GET] Auto-sync missing categories notice:", syncErr);
        }
      }
    }

    // Ensure legacy "Shopping & Retail" (cat-5) and categories now consolidated under
    // Shops & Retail are removed from DB to avoid duplicate Primary Industry entries.
    const LEGACY_REMOVED_IDS = new Set([
      "cat-5",  // Shopping & Retail (old name)
      "cat-2",  // Cafés & Beverages
      "cat-4",  // Grocery & Food Retail
      "cat-6",  // Fashion & Accessories
      "cat-21", // Building Materials & Hardware
      "cat-23", // Furniture & Home Décor
      "cat-24", // Electronics & Technology
      "cat-39", // Agricultural Supplies & Equipment
      "cat-42", // Energy & Solar Power
      "cat-53", // Florists & Gifts
      "cat-54", // Books, Arts & Culture
      "cat-66", // Beauty Manufacturing & Wholesale
    ]);
    try {
      const legacyIds = Array.from(LEGACY_REMOVED_IDS);
      await CategoryModel.deleteMany({
        $or: [
          { id: { $in: legacyIds } },
          { parentId: { $in: legacyIds } },
          { name: "Shopping & Retail" },
        ],
      });
    } catch {
      // Ignore cleanup error if DB not ready
    }

    const categories = docs
      .filter((d: any) => {
        const id = d.id as string;
        const parentId = d.parentId as string | null;
        if (LEGACY_REMOVED_IDS.has(id)) return false;
        if (parentId && LEGACY_REMOVED_IDS.has(parentId)) return false;
        if (d.name === "Shopping & Retail") return false;
        return true;
      })
      .map((d: any) => ({
        id: d.id,
        parentId: d.parentId ?? null,
        name: d.name,
        slug: d.slug,
        icon: d.icon || "Folder",
        level: d.level,
        featured: d.featured ?? false,
      }));

    return NextResponse.json({ categories, total: categories.length, success: true });
  } catch (error) {
    console.error("[API /categories GET]", error);
    return NextResponse.json({ categories: SEED_CATEGORIES, total: SEED_CATEGORIES.length, success: false });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, slug: rawSlug, parentId, icon, featured } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    let cleanSlug = (rawSlug && typeof rawSlug === "string" ? rawSlug : cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!cleanSlug) {
      cleanSlug = `category-${Date.now()}`;
    }

    // Determine level based on parentId
    let level = 1;
    const parentIdVal = parentId && parentId !== "" ? parentId : null;
    if (parentIdVal) {
      const parentDoc = await CategoryModel.findOne({ id: parentIdVal }).lean();
      if (parentDoc && (parentDoc as any).level) {
        level = (parentDoc as any).level + 1;
      } else {
        const seedParent = SEED_CATEGORIES.find((c) => c.id === parentIdVal);
        if (seedParent) level = seedParent.level + 1;
      }
    }

    // Ensure unique id and slug
    let finalId = body.id || `cat-${cleanSlug}`;
    const existingById = await CategoryModel.findOne({ id: finalId }).lean();
    if (existingById) {
      finalId = `cat-${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const existingBySlug = await CategoryModel.findOne({ slug: cleanSlug }).lean();
    if (existingBySlug) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newCategory = await CategoryModel.create({
      id: finalId,
      parentId: parentIdVal,
      name: cleanName,
      slug: cleanSlug,
      icon: icon || (level === 1 ? "FolderTree" : "Tag"),
      level,
      featured: Boolean(featured),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category registered successfully",
        category: {
          id: newCategory.id,
          parentId: newCategory.parentId,
          name: newCategory.name,
          slug: newCategory.slug,
          icon: newCategory.icon,
          level: newCategory.level,
          featured: newCategory.featured,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /categories POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to register category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, slug: rawSlug, parentId, icon, featured } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required for update" }, { status: 400 });
    }

    const category = await CategoryModel.findOne({ id });
    if (!category) {
      return NextResponse.json({ error: "Category not found in database" }, { status: 404 });
    }

    if (name) category.name = name.trim();
    if (rawSlug) {
      category.slug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (parentId !== undefined) {
      category.parentId = parentId && parentId !== "" ? parentId : null;
      if (category.parentId) {
        const parentDoc = await CategoryModel.findOne({ id: category.parentId }).lean();
        if (parentDoc) {
          category.level = (parentDoc as any).level + 1;
        }
      } else {
        category.level = 1;
      }
    }
    if (icon) category.icon = icon;
    if (featured !== undefined) category.featured = Boolean(featured);

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: {
        id: category.id,
        parentId: category.parentId,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        level: category.level,
        featured: category.featured,
      },
    });
  } catch (error: any) {
    console.error("[API /categories PUT]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID query parameter is required" }, { status: 400 });
    }

    // Delete the category and also cascade delete direct child subcategories if requested
    const result = await CategoryModel.deleteOne({ id });
    // Also delete or disown any immediate subcategories
    await CategoryModel.deleteMany({ parentId: id });

    return NextResponse.json({
      success: true,
      message: "Category and subcategories removed successfully",
      deletedId: id,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("[API /categories DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
