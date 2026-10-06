import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDoc extends Document {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  icon?: string;
  level: number;
  featured?: boolean;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    id: { type: String, required: true, unique: true },
    parentId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: "Layers" },
    level: { type: Number, required: true, default: 1 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategoryDoc>("Category", CategorySchema);
