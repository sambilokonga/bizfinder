import { connectToDatabase } from "@/lib/db/mongodb";
import { CategoryModel } from "@/lib/db/models/Category";
import { CategoryItem } from "@/types/api";

function docToCategory(doc: any): CategoryItem {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    parentId: obj.parentId ?? null,
    name: obj.name,
    slug: obj.slug,
    icon: obj.icon,
    level: obj.level,
    featured: obj.featured ?? false,
  };
}

export async function getAllCategories(opts: {
  featured?: boolean;
  level?: number;
} = {}): Promise<CategoryItem[]> {
  await connectToDatabase();
  const filter: Record<string, any> = {};
  if (opts.featured === true) filter.featured = true;
  if (opts.level !== undefined) filter.level = opts.level;
  const docs = await CategoryModel.find(filter).sort({ level: 1, name: 1 }).lean();
  return docs.map(docToCategory);
}

export async function getFeaturedCategories(): Promise<CategoryItem[]> {
  return getAllCategories({ featured: true, level: 1 });
}

export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  await connectToDatabase();
  const doc = await CategoryModel.findOne({ slug }).lean();
  if (!doc) return null;
  return docToCategory(doc);
}

export async function getCategoryChildren(parentId: string): Promise<CategoryItem[]> {
  await connectToDatabase();
  const docs = await CategoryModel.find({ parentId }).sort({ name: 1 }).lean();
  return docs.map(docToCategory);
}
