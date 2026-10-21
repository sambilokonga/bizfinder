import mongoose, { Schema, Document } from "mongoose";

export interface IReviewReply {
  ownerId: string;
  ownerName: string;
  comment: string;
  createdAt: Date;
}

export interface IReviewDoc extends Document {
  id: string;
  businessId: string;
  businessName?: string;
  cityName?: string;
  countryName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  photos?: string[];
  likesCount: number;
  reply?: IReviewReply;
  status: "published" | "pending" | "reported" | "removed";
  timeframeType?: "historical" | "recent" | "future_scheduled";
  isVerifiedCitizen?: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, required: true, index: true },
    businessName: { type: String },
    cityName: { type: String, index: true },
    countryName: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    reply: {
      ownerId: { type: String },
      ownerName: { type: String },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ["published", "pending", "reported", "removed"],
      default: "published",
      index: true,
    },
    timeframeType: {
      type: String,
      enum: ["historical", "recent", "future_scheduled"],
      default: "recent",
      index: true,
    },
    isVerifiedCitizen: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ businessId: 1, createdAt: -1 });
ReviewSchema.index({ cityName: 1, createdAt: -1 });
ReviewSchema.index({ countryName: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ isFlagged: 1, createdAt: -1 });

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReviewDoc>("Review", ReviewSchema);
