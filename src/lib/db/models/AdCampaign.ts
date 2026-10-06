import mongoose, { Schema, Document } from "mongoose";

export type AdPlacement =
  | "search_top"
  | "home_hero"
  | "category_spotlight"
  | "map_highlight";

export type AdCampaignStatus = "active" | "paused" | "scheduled" | "completed";

export interface IAdCampaignDoc extends Document {
  id: string;
  ownerId: string;
  businessId: string;
  businessName: string;
  name: string;
  placement: AdPlacement;
  targetLocation: string;
  dailyBudgetETB: number;
  totalSpentETB: number;
  durationDays: number;
  impressions: number;
  clicks: number;
  status: AdCampaignStatus;
  startDate: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdCampaignSchema = new Schema<IAdCampaignDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    businessId: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    name: { type: String, required: true },
    placement: {
      type: String,
      enum: ["search_top", "home_hero", "category_spotlight", "map_highlight"],
      required: true,
    },
    targetLocation: { type: String, required: true },
    dailyBudgetETB: { type: Number, required: true },
    totalSpentETB: { type: Number, default: 0 },
    durationDays: { type: Number, required: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "paused", "scheduled", "completed"],
      default: "active",
      index: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String },
  },
  { timestamps: true }
);

AdCampaignSchema.index({ ownerId: 1, status: 1 });

export const AdCampaignModel =
  mongoose.models.AdCampaign ||
  mongoose.model<IAdCampaignDoc>("AdCampaign", AdCampaignSchema);
