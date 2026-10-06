import mongoose, { Schema, Document } from "mongoose";

export type AdTier = "starter" | "pro" | "spotlight";
export type BillingCycle = "monthly" | "yearly";

export interface IAdPlanDoc extends Document {
  id: string;
  businessId: string;
  ownerId: string;
  tier: AdTier;
  billingCycle: BillingCycle;
  amountETB: number;
  amountUSD: number;
  txId: string;
  provider: "telebirr" | "cbebirr" | "mpesa" | "card";
  activatedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdPlanSchema = new Schema<IAdPlanDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    tier: {
      type: String,
      enum: ["starter", "pro", "spotlight"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    amountETB: { type: Number, required: true },
    amountUSD: { type: Number, required: true },
    txId: { type: String, required: true },
    provider: {
      type: String,
      enum: ["telebirr", "cbebirr", "mpesa", "card"],
      required: true,
    },
    activatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

AdPlanSchema.index({ businessId: 1, isActive: 1 });

export const AdPlanModel =
  mongoose.models.AdPlan ||
  mongoose.model<IAdPlanDoc>("AdPlan", AdPlanSchema);
