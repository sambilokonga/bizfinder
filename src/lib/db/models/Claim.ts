import mongoose, { Schema, Document } from "mongoose";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface IClaimDoc extends Document {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  proofDocumentUrl?: string;
  businessRole: string; // e.g. "Owner", "General Manager", "Marketing Director"
  notes?: string;
  status: ClaimStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaimDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    proofDocumentUrl: { type: String },
    businessRole: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const ClaimModel =
  mongoose.models.Claim || mongoose.model<IClaimDoc>("Claim", ClaimSchema);
