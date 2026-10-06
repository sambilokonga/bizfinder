import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "@/types/user";

export interface IUserPreferences {
  categoryIds: string[];
  radiusKm: number;
  openNowDefault: boolean;
}

export interface INotificationSettings {
  reviewReplies: boolean;
  claimUpdates: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
}

export interface IUserDoc extends Document {
  id: string;        // Clerk user ID
  clerkId: string;   // explicit Clerk ID alias
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  country?: string;         // User country
  city?: string;            // User city
  assignedCountry?: string; // Country jurisdiction (for country_admin & city_admin)
  assignedCity?: string;    // City jurisdiction (for city_admin)
  claimedBusinessIds: string[];
  savedBusinessIds: string[];
  preferences: IUserPreferences;
  notificationSettings: INotificationSettings;
  accountSettings?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["user", "owner", "city_admin", "country_admin", "admin", "super_admin"],
      default: "user",
      index: true,
    },
    avatarUrl: { type: String },
    country: { type: String, index: true },
    city: { type: String, index: true },
    assignedCountry: { type: String, index: true },
    assignedCity: { type: String, index: true },
    claimedBusinessIds: [{ type: String }],
    savedBusinessIds: [{ type: String }],
    preferences: {
      categoryIds: [{ type: String }],
      radiusKm: { type: Number, default: 10 },
      openNowDefault: { type: Boolean, default: false },
    },
    notificationSettings: {
      reviewReplies: { type: Boolean, default: true },
      claimUpdates: { type: Boolean, default: true },
      promotionalEmails: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: true },
    },
    accountSettings: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);
