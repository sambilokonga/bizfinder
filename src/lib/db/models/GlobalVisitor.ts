import mongoose, { Schema, Document } from "mongoose";

export type GlobalVisitorType = "actual" | "future";
export type GlobalVisitorAction =
  | "view"
  | "call"
  | "direction"
  | "website"
  | "saved"
  | "share"
  | "inquiry"
  | "meeting"
  | "delegation";

export type GlobalVisitorStatus =
  | "active"
  | "completed"
  | "scheduled"
  | "confirmed"
  | "in_transit"
  | "arrived";

export type EscalationTarget = "none" | "country_admin" | "super_admin";

export interface IGlobalVisitorDoc extends Document {
  id: string;
  visitorType: GlobalVisitorType;
  visitorName?: string;
  visitorCountry: string;
  visitorCountryCode: string;
  visitorCity: string;
  visitorFlag: string;
  visitorDevice: string;
  visitorIp: string;
  targetBusinessId?: string;
  targetBusinessName: string;
  targetBusinessCity: string;
  targetBusinessCountry: string;
  action: GlobalVisitorAction;
  purpose: string;
  status: GlobalVisitorStatus;
  scheduledDate?: Date;
  delegationSize?: number;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  registeredBy: string;
  jurisdictionLevel: "city" | "country" | "global";
  escalatedTo: EscalationTarget;
  escalationNotes?: string;
  referrer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalVisitorSchema = new Schema<IGlobalVisitorDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    visitorType: {
      type: String,
      enum: ["actual", "future"],
      default: "actual",
      index: true,
    },
    visitorName: { type: String, trim: true },
    visitorCountry: { type: String, required: true, index: true },
    visitorCountryCode: { type: String, required: true, index: true },
    visitorCity: { type: String, required: true, index: true },
    visitorFlag: { type: String, default: "🌐" },
    visitorDevice: { type: String, default: "Mobile Safari (iOS 18)" },
    visitorIp: { type: String, default: "192.0.2.1" },
    targetBusinessId: { type: String, index: true },
    targetBusinessName: { type: String, required: true, index: true },
    targetBusinessCity: { type: String, required: true, index: true },
    targetBusinessCountry: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: [
        "view",
        "call",
        "direction",
        "website",
        "saved",
        "share",
        "inquiry",
        "meeting",
        "delegation",
      ],
      default: "view",
      index: true,
    },
    purpose: {
      type: String,
      default: "Diaspora Tourism & Commercial Inquiry",
    },
    status: {
      type: String,
      enum: ["active", "completed", "scheduled", "confirmed", "in_transit", "arrived"],
      default: "active",
      index: true,
    },
    scheduledDate: { type: Date },
    delegationSize: { type: Number, default: 1 },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    notes: { type: String },
    registeredBy: { type: String, default: "City Admin" },
    jurisdictionLevel: {
      type: String,
      enum: ["city", "country", "global"],
      default: "city",
    },
    escalatedTo: {
      type: String,
      enum: ["none", "country_admin", "super_admin"],
      default: "none",
      index: true,
    },
    escalationNotes: { type: String },
    referrer: { type: String, default: "Global Business Directory Network" },
  },
  { timestamps: true }
);

GlobalVisitorSchema.index({ createdAt: -1 });
GlobalVisitorSchema.index({ targetBusinessCity: 1, visitorType: 1, createdAt: -1 });
GlobalVisitorSchema.index({ targetBusinessCountry: 1, visitorType: 1, createdAt: -1 });

export const GlobalVisitorModel =
  (mongoose?.models && mongoose.models.GlobalVisitor) ||
  mongoose.model<IGlobalVisitorDoc>("GlobalVisitor", GlobalVisitorSchema);
