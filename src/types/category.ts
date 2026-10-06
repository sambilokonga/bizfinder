export interface Category {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  level: number; // 1 = Industry / Top Category, 2 = Category / Group, 3 = Subcategory, 4 = Specialty
  industryId?: string;
  industryName?: string;
  path?: string[];
  keywords?: string[];
  businessCount?: number;
  featured?: boolean;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface IndustryGroup {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  categories: CategoryTree[];
}
