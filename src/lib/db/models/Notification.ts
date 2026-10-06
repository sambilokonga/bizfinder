import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDoc extends Document {
  id: string;
  title: string;
  body: string;
  target:
    | "global"
    | "business"
    | "user"
    | "admin"
    | "super_admin"
    | "country_admin"
    | "city_admin";
  targetUserId?: string;
  targetBusinessId?: string;
  targetRole?: string;
  targetCountry?: string;
  targetCity?: string;
  actionType?: string;
  metadata?: Record<string, any>;
  status: "Delivered" | "Pending" | "Scheduled" | "Failed";
  priority: "critical" | "high" | "medium" | "low";
  sentBy?: string;
  type?: string;
  link?: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    target: {
      type: String,
      enum: [
        "global",
        "business",
        "user",
        "admin",
        "super_admin",
        "country_admin",
        "city_admin",
      ],
      default: "global",
      index: true,
    },
    targetUserId: { type: String, index: true },
    targetBusinessId: { type: String, index: true },
    targetRole: { type: String, index: true },
    targetCountry: { type: String, index: true },
    targetCity: { type: String, index: true },
    actionType: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["Delivered", "Pending", "Scheduled", "Failed"],
      default: "Delivered",
      index: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      index: true,
    },
    sentBy: { type: String, default: "Super Admin" },
    type: { type: String, default: "broadcast", index: true },
    link: { type: String },
    readBy: [{ type: String }],
  },
  { timestamps: true }
);

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ target: 1, createdAt: -1 });
NotificationSchema.index({ targetRole: 1, targetCountry: 1, targetCity: 1 });
NotificationSchema.index({ status: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotificationDoc>("Notification", NotificationSchema);
