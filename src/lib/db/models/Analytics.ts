import mongoose, { Schema, Document } from "mongoose";
import { AnalyticsEventType, AnalyticsDeviceType } from "@/types/analytics";

export interface IAnalyticsDoc extends Document {
  id: string;
  eventType: AnalyticsEventType;
  businessId?: string;
  businessName?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  city: string;
  country: string;
  searchTerm?: string;
  device: AnalyticsDeviceType;
  browser?: string;
  os?: string;
  ip?: string;
  duration?: number;
  metadata?: Record<string, any>;
  registeredBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalyticsDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    eventType: {
      type: String,
      enum: [
        "view",
        "search",
        "click_phone",
        "click_direction",
        "click_website",
        "favorite",
        "share",
        "ad_click",
        "review",
      ],
      required: true,
      index: true,
    },
    businessId: { type: String, index: true },
    businessName: { type: String, index: true },
    userId: { type: String, index: true },
    userName: { type: String },
    userRole: { type: String },
    city: { type: String, default: "Addis Ababa", index: true },
    country: { type: String, default: "Ethiopia", index: true },
    searchTerm: { type: String, index: true },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "mobile",
    },
    browser: { type: String },
    os: { type: String },
    ip: { type: String },
    duration: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    registeredBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ businessId: 1, createdAt: -1 });
AnalyticsSchema.index({ eventType: 1, createdAt: -1 });

export const AnalyticsModel =
  mongoose.models.Analytics ||
  mongoose.model<IAnalyticsDoc>("Analytics", AnalyticsSchema);
