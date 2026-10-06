import mongoose, { Schema, Document } from "mongoose";
import { PaymentProvider, PaymentStatus, PaymentType, PaymentCurrency } from "@/types/payment";

export interface IPaymentDoc extends Document {
  id: string; // Unique transaction identifier (e.g. TX-TEL-892104)
  businessId?: string;
  businessName: string;
  cityName?: string;
  countryName?: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  amount: number;
  currency: PaymentCurrency;
  provider: PaymentProvider;
  paymentType: PaymentType;
  status: PaymentStatus;
  reference?: string;
  description?: string;
  metadata?: Record<string, any>;
  registeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, index: true },
    businessName: { type: String, required: true, index: true },
    cityName: { type: String, index: true },
    countryName: { type: String, index: true },
    payerName: { type: String, required: true },
    payerEmail: { type: String },
    payerPhone: { type: String },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["ETB", "USD"],
      default: "ETB",
    },
    provider: {
      type: String,
      enum: ["telebirr", "cbebirr", "mpesa", "card", "chapa", "bank_transfer", "cash"],
      required: true,
      index: true,
    },
    paymentType: {
      type: String,
      enum: ["subscription", "advertisement", "verification", "featured_listing", "other"],
      default: "subscription",
      index: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "refunded"],
      default: "completed",
      index: true,
    },
    reference: { type: String, index: true },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed },
    registeredBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPaymentDoc>("Payment", PaymentSchema);
