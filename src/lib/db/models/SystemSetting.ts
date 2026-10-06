import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettingDoc extends Document {
  id: string; // "global_system_settings"
  
  // 1. General & Platform Profile
  platformName: string;
  tagline: string;
  siteUrl: string;
  contactEmail: string;
  adminEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  defaultTimezone: string;
  defaultLanguage: string;
  supportedLanguages: string[];

  // 2. Business Listing & Moderation Rules
  maxPhotosPerListing: number;
  autoApproveListings: boolean;
  verificationExpiryDays: number;
  minReviewLength: number;
  profanityFilter: boolean;
  featuredListingDurationDays: number;
  allowUserClaiming: boolean;
  maxBranchesPerBusiness: number;

  // 3. Search Engine & Discovery
  defaultRadiusKm: number;
  featuredBoostWeight: number;
  resultsPerPage: number;
  minCharsAutocomplete: number;
  mapTileProvider: "osm" | "mapbox" | "carto";
  enableGeofencing: boolean;

  // 4. SEO & Social Meta
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  canonicalUrlBase: string;
  ogImageUrl: string;
  enableRobotsIndexing: boolean;
  twitterHandle: string;
  keywords: string[];

  // 5. Notifications & Gateway
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  sendWelcomeEmail: boolean;
  businessApprovalAlerts: boolean;
  weeklyDigest: boolean;
  promotionalCampaigns: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSenderEmail: string;
  smtpSenderName: string;

  // 6. Payments & Monetization
  currencyCode: string;
  platformCommissionPercent: number;
  telebirrEnabled: boolean;
  chapaEnabled: boolean;
  stripeEnabled: boolean;
  paymentEnvironment: "sandbox" | "production";

  // 7. Security & Access Policies
  require2FAForAdmins: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  enableRateLimiting: boolean;
  maintenanceMode: boolean;
  maintenanceNotice: string;

  // Audit
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSettingDoc>(
  {
    id: { type: String, required: true, unique: true, default: "global_system_settings" },

    // 1. General
    platformName: { type: String, default: "BizFinder Directory" },
    tagline: { type: String, default: "The Modern African Business & Service Directory" },
    siteUrl: { type: String, default: "https://bizfinder.et" },
    contactEmail: { type: String, default: "contact@bizfinder.et" },
    adminEmail: { type: String, default: "admin@bizfinder.et" },
    supportPhone: { type: String, default: "+251 11 123 4567" },
    defaultCurrency: { type: String, default: "ETB" },
    supportedCurrencies: { type: [String], default: ["ETB", "USD", "EUR", "GBP", "KES"] },
    defaultTimezone: { type: String, default: "Africa/Addis_Ababa" },
    defaultLanguage: { type: String, default: "en" },
    supportedLanguages: { type: [String], default: ["en", "am", "om", "ti"] },

    // 2. Business
    maxPhotosPerListing: { type: Number, default: 20 },
    autoApproveListings: { type: Boolean, default: false },
    verificationExpiryDays: { type: Number, default: 365 },
    minReviewLength: { type: Number, default: 20 },
    profanityFilter: { type: Boolean, default: true },
    featuredListingDurationDays: { type: Number, default: 30 },
    allowUserClaiming: { type: Boolean, default: true },
    maxBranchesPerBusiness: { type: Number, default: 15 },

    // 3. Search
    defaultRadiusKm: { type: Number, default: 25 },
    featuredBoostWeight: { type: Number, default: 1.5 },
    resultsPerPage: { type: Number, default: 20 },
    minCharsAutocomplete: { type: Number, default: 2 },
    mapTileProvider: { type: String, default: "osm" },
    enableGeofencing: { type: Boolean, default: true },

    // 4. SEO
    metaTitleTemplate: { type: String, default: "{business_name} | Verified in {city} - BizFinder" },
    metaDescriptionTemplate: {
      type: String,
      default: "Discover {business_name} in {city}. Verified reviews, opening hours, directions, and direct contact details.",
    },
    canonicalUrlBase: { type: String, default: "https://bizfinder.et/business/" },
    ogImageUrl: { type: String, default: "https://bizfinder.et/og-cover.png" },
    enableRobotsIndexing: { type: Boolean, default: true },
    twitterHandle: { type: String, default: "@BizFinderET" },
    keywords: {
      type: [String],
      default: ["business directory", "ethiopia businesses", "addis ababa services", "verified listings"],
    },

    // 5. Notifications
    emailNotificationsEnabled: { type: Boolean, default: true },
    smsNotificationsEnabled: { type: Boolean, default: true },
    sendWelcomeEmail: { type: Boolean, default: true },
    businessApprovalAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    promotionalCampaigns: { type: Boolean, default: false },
    smtpHost: { type: String, default: "smtp.resend.com" },
    smtpPort: { type: Number, default: 587 },
    smtpSenderEmail: { type: String, default: "notifications@bizfinder.et" },
    smtpSenderName: { type: String, default: "BizFinder Global" },

    // 6. Payments
    currencyCode: { type: String, default: "ETB" },
    platformCommissionPercent: { type: Number, default: 5 },
    telebirrEnabled: { type: Boolean, default: true },
    chapaEnabled: { type: Boolean, default: true },
    stripeEnabled: { type: Boolean, default: true },
    paymentEnvironment: { type: String, enum: ["sandbox", "production"], default: "sandbox" },

    // 7. Security
    require2FAForAdmins: { type: Boolean, default: false },
    sessionTimeoutMinutes: { type: Number, default: 120 },
    maxFailedLoginAttempts: { type: Number, default: 5 },
    enableRateLimiting: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceNotice: {
      type: String,
      default: "BizFinder is briefly undergoing scheduled maintenance. We will be back online shortly!",
    },

    updatedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

export const SystemSettingModel =
  mongoose.models.SystemSetting ||
  mongoose.model<ISystemSettingDoc>("SystemSetting", SystemSettingSchema);
