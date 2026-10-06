export interface ISystemSettingsData {
  id: string;

  // 1. General
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

  // 2. Business
  maxPhotosPerListing: number;
  autoApproveListings: boolean;
  verificationExpiryDays: number;
  minReviewLength: number;
  profanityFilter: boolean;
  featuredListingDurationDays: number;
  allowUserClaiming: boolean;
  maxBranchesPerBusiness: number;

  // 3. Search
  defaultRadiusKm: number;
  featuredBoostWeight: number;
  resultsPerPage: number;
  minCharsAutocomplete: number;
  mapTileProvider: "osm" | "mapbox" | "carto";
  enableGeofencing: boolean;

  // 4. SEO
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  canonicalUrlBase: string;
  ogImageUrl: string;
  enableRobotsIndexing: boolean;
  twitterHandle: string;
  keywords: string[];

  // 5. Notifications
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

  // 6. Payments
  currencyCode: string;
  platformCommissionPercent: number;
  telebirrEnabled: boolean;
  chapaEnabled: boolean;
  stripeEnabled: boolean;
  paymentEnvironment: "sandbox" | "production";

  // 7. Security
  require2FAForAdmins: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  enableRateLimiting: boolean;
  maintenanceMode: boolean;
  maintenanceNotice: string;

  updatedBy?: string;
  updatedAt?: string;
}

export const DEFAULT_SYSTEM_SETTINGS: ISystemSettingsData = {
  id: "global_system_settings",
  platformName: "BizFinder Directory",
  tagline: "The Modern African Business & Service Directory",
  siteUrl: "https://bizfinder.et",
  contactEmail: "contact@bizfinder.et",
  adminEmail: "admin@bizfinder.et",
  supportPhone: "+251 11 123 4567",
  defaultCurrency: "ETB",
  supportedCurrencies: ["ETB", "USD", "EUR", "GBP", "KES"],
  defaultTimezone: "Africa/Addis_Ababa",
  defaultLanguage: "en",
  supportedLanguages: ["en", "am", "om", "ti"],

  maxPhotosPerListing: 20,
  autoApproveListings: false,
  verificationExpiryDays: 365,
  minReviewLength: 20,
  profanityFilter: true,
  featuredListingDurationDays: 30,
  allowUserClaiming: true,
  maxBranchesPerBusiness: 15,

  defaultRadiusKm: 25,
  featuredBoostWeight: 1.5,
  resultsPerPage: 20,
  minCharsAutocomplete: 2,
  mapTileProvider: "osm",
  enableGeofencing: true,

  metaTitleTemplate: "{business_name} | Verified in {city} - BizFinder",
  metaDescriptionTemplate:
    "Discover {business_name} in {city}. Verified reviews, opening hours, directions, and direct contact details.",
  canonicalUrlBase: "https://bizfinder.et/business/",
  ogImageUrl: "https://bizfinder.et/og-cover.png",
  enableRobotsIndexing: true,
  twitterHandle: "@BizFinderET",
  keywords: ["business directory", "ethiopia businesses", "addis ababa services", "verified listings"],

  emailNotificationsEnabled: true,
  smsNotificationsEnabled: true,
  sendWelcomeEmail: true,
  businessApprovalAlerts: true,
  weeklyDigest: true,
  promotionalCampaigns: false,
  smtpHost: "smtp.resend.com",
  smtpPort: 587,
  smtpSenderEmail: "notifications@bizfinder.et",
  smtpSenderName: "BizFinder Global",

  currencyCode: "ETB",
  platformCommissionPercent: 5,
  telebirrEnabled: true,
  chapaEnabled: true,
  stripeEnabled: true,
  paymentEnvironment: "sandbox",

  require2FAForAdmins: false,
  sessionTimeoutMinutes: 120,
  maxFailedLoginAttempts: 5,
  enableRateLimiting: true,
  maintenanceMode: false,
  maintenanceNotice:
    "BizFinder is briefly undergoing scheduled maintenance. We will be back online shortly!",

  updatedBy: "system",
};
