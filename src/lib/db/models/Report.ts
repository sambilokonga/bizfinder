import mongoose, { Schema, Document } from "mongoose";
import { ReportType, ReportStatus, ReportPriority, ReportActionTaken } from "@/types/report";

export interface IReportDoc extends Document {
  id: string;
  type: ReportType;
  title: string;
  reason: string;
  details?: string;
  targetId: string;
  targetName: string;
  targetType: string;
  reporterName: string;
  reporterEmail?: string;
  reporterId?: string;
  reporterRole?: string;
  status: ReportStatus;
  priority: ReportPriority;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  actionTaken?: ReportActionTaken;
  evidenceUrls?: string[];
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["business", "review", "user", "media"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    reason: { type: String, required: true, index: true },
    details: { type: String },
    targetId: { type: String, required: true, index: true },
    targetName: { type: String, required: true, index: true },
    targetType: { type: String, default: "business" },
    reporterName: { type: String, required: true },
    reporterEmail: { type: String },
    reporterId: { type: String, index: true },
    reporterRole: { type: String, default: "user" },
    status: {
      type: String,
      enum: ["pending", "under_review", "investigating", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      index: true,
    },
    resolutionNotes: { type: String },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    actionTaken: {
      type: String,
      enum: [
        "none",
        "dismissed",
        "penalty_applied",
        "content_removed",
        "user_suspended",
        "warning_issued",
      ],
      default: "none",
    },
    evidenceUrls: [{ type: String }],
    city: { type: String, default: "Addis Ababa" },
    country: { type: String, default: "Ethiopia" },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance admin moderation filtering
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ type: 1, status: 1 });
ReportSchema.index({ priority: 1, status: 1 });

export const ReportModel =
  mongoose.models.Report || mongoose.model<IReportDoc>("Report", ReportSchema);
