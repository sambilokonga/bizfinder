import mongoose, { Schema, Document } from "mongoose";
import { TicketCategory, TicketPriority, TicketStatus } from "@/types/ticket";

export interface ITicketDoc extends Document {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userRole?: string;
  businessId?: string;
  businessName?: string;
  assignedAdmin?: string;
  assignedAdminId?: string;
  tags?: string[];
  messages: Array<{
    id: string;
    senderId?: string;
    senderName: string;
    senderRole: "user" | "owner" | "admin" | "super_admin";
    message: string;
    attachments?: string[];
    createdAt: Date;
  }>;
  lastReply?: string;
  lastReplyAt?: Date;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    senderId: { type: String },
    senderName: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ["user", "owner", "admin", "super_admin"],
      required: true,
      default: "user",
    },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicketDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        "verification",
        "billing",
        "technical",
        "account",
        "listing",
        "dispute",
        "general",
      ],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_on_customer", "resolved", "closed"],
      default: "open",
      index: true,
    },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    userPhone: { type: String },
    userRole: { type: String, default: "owner" },
    businessId: { type: String, index: true },
    businessName: { type: String, index: true },
    assignedAdmin: { type: String, default: "Unassigned" },
    assignedAdminId: { type: String },
    tags: [{ type: String }],
    messages: [TicketMessageSchema],
    lastReply: { type: String },
    lastReplyAt: { type: Date, default: Date.now },
    city: { type: String, default: "Addis Ababa" },
    country: { type: String, default: "Ethiopia" },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes for Support Desk queues
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ userId: 1, createdAt: -1 });
TicketSchema.index({ businessId: 1, status: 1 });
TicketSchema.index({ priority: 1, status: 1 });
TicketSchema.index({ category: 1, status: 1 });

export const TicketModel =
  mongoose.models.Ticket || mongoose.model<ITicketDoc>("Ticket", TicketSchema);
