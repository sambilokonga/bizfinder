import mongoose, { Schema, Document, Model } from "mongoose";

export type MediaType = "Photo" | "Video" | "Logo" | "Cover";
export type MediaStatus = "Approved" | "Pending" | "Reported";

export interface IMedia extends Document {
  id: string;
  businessId?: string;
  businessName?: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: MediaStatus;
  description?: string;
  sortOrder: number;
  youtubeId?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  featured?: boolean;
}

const MediaSchema = new Schema<IMedia>(
  {
    id: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, index: true },
    businessName: { type: String, default: "General Platform" },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Photo", "Video", "Logo", "Cover"],
      default: "Photo",
      index: true,
    },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    uploadedBy: { type: String, default: "Admin" },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Reported"],
      default: "Approved",
      index: true,
    },
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    youtubeId: { type: String },
    width: { type: Number },
    height: { type: Number },
    fileSize: { type: Number },
    mimeType: { type: String },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const MediaModel: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
