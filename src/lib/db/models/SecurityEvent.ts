import mongoose, { Schema, Document } from "mongoose";
import {
  ISecurityEvent,
  SecuritySeverity,
  SecurityStatus,
  SecurityEventType,
  SecurityActionTaken,
} from "@/types/security";

export interface ISecurityEventDoc extends Document, Omit<ISecurityEvent, "id"> {
  id: string;
}

const SecurityEventSchema = new Schema<ISecurityEventDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    eventType: {
      type: String,
      enum: [
        "login_success",
        "login_failed",
        "brute_force_blocked",
        "unauthorized_access_attempt",
        "two_factor_enabled",
        "two_factor_disabled",
        "password_changed",
        "api_key_generated",
        "api_key_revoked",
        "ip_blocked",
        "ip_whitelisted",
        "session_revoked",
        "role_elevated",
        "firewall_rule_added",
        "ddos_mitigated",
        "maintenance_triggered",
        "sensitive_data_export",
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "low",
      index: true,
    },
    status: {
      type: String,
      enum: ["logged", "investigating", "blocked", "resolved", "dismissed"],
      default: "logged",
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actorId: { type: String, index: true },
    actorName: { type: String, required: true },
    actorEmail: { type: String },
    actorRole: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "country_admin",
        "city_admin",
        "owner",
        "user",
        "anonymous",
        "system",
      ],
      default: "user",
      index: true,
    },
    targetResource: { type: String, index: true },
    ipAddress: { type: String, required: true, index: true },
    city: { type: String, default: "Addis Ababa", index: true },
    country: { type: String, default: "Ethiopia", index: true },
    device: {
      type: String,
      enum: ["Desktop", "Mobile", "Tablet", "Server", "Bot"],
      default: "Desktop",
    },
    browser: { type: String },
    os: { type: String },
    actionTaken: {
      type: String,
      enum: [
        "allowed",
        "blocked",
        "session_terminated",
        "account_locked",
        "2fa_challenged",
        "flagged",
        "quarantined",
      ],
      default: "allowed",
    },
    metadata: { type: Schema.Types.Mixed },
    isFlagged: { type: Boolean, default: false, index: true },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

// High-speed indices for security audit queries
SecurityEventSchema.index({ createdAt: -1 });
SecurityEventSchema.index({ severity: 1, createdAt: -1 });
SecurityEventSchema.index({ status: 1, createdAt: -1 });
SecurityEventSchema.index({ eventType: 1, createdAt: -1 });
SecurityEventSchema.index({ ipAddress: 1, createdAt: -1 });
SecurityEventSchema.index({ actorEmail: 1, createdAt: -1 });

export const SecurityEventModel =
  mongoose.models.SecurityEvent ||
  mongoose.model<ISecurityEventDoc>("SecurityEvent", SecurityEventSchema);
