export type BusinessStatus = "open" | "closed" | "temporarily_closed";
export type PriceTier = "$" | "$$" | "$$$" | "$$$$";
export type BusinessType =
  | "Sole Proprietorship"
  | "Partnership"
  | "Private Company"
  | "Pub"
  | "Limited Liability Company"
  | "Corporation"
  | "Cooperative / Public Company"
  | "Share Company"
  | "PLC"
  | "Joint Venture"
  | "Franchise"
  | "Nonprofit Organization"
  | "NGO"
  | "Government-Owned Enterprise"
  | "State-Owned Company"
  | "Corporation / Public Enterprise"
  | "Micro Enterprise"
  | "Small Enterprise"
  | "Medium Enterprise"
  | "Large Enterprise"
  | "Family Business"
  | "Startup"
  | "Social Enterprise"
  | "Informal Business"
  | "Freelancer / Independent Professional"
  | "Branch / Outlet"
  | "Subsidiary"
  | "Holding Company"
  | "Association"
  | "Religious Organization"
  | "Educational Institution"
  | "Healthcare Organization"
  | "Professional Practice"
  | "Government Office"
  | "Public Institution"
  | "Other";

export const BUSINESS_TYPE_OPTIONS: BusinessType[] = [
  "Sole Proprietorship",
  "Partnership",
  "Private Company",
  "Pub",
  "Limited Liability Company",
  "Corporation",
  "Cooperative / Public Company",
  "Share Company",
  "PLC",
  "Joint Venture",
  "Franchise",
  "Nonprofit Organization",
  "NGO",
  "Government-Owned Enterprise",
  "State-Owned Company",
  "Corporation / Public Enterprise",
  "Micro Enterprise",
  "Small Enterprise",
  "Medium Enterprise",
  "Large Enterprise",
  "Family Business",
  "Startup",
  "Social Enterprise",
  "Informal Business",
  "Freelancer / Independent Professional",
  "Branch / Outlet",
  "Subsidiary",
  "Holding Company",
  "Association",
  "Religious Organization",
  "Educational Institution",
  "Healthcare Organization",
  "Professional Practice",
  "Government Office",
  "Public Institution",
  "Other",
];
export type MediaType =
  | "logo"
  | "cover"
  | "interior"
  | "exterior"
  | "product"
  | "menu"
  | "staff"
  | "promo"
  | "video";

export interface OpeningHourSlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime?: string; // "08:00" in 24h format
  closeTime?: string; // "22:00" in 24h format
  is24h?: boolean;
  isClosed?: boolean;
}

export interface BusinessMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  sortOrder: number;
  uploadedAt: string;
}

export interface BusinessAttributes {
  delivery?: boolean;
  takeout?: boolean;
  parking?: boolean;
  wifi?: boolean;
  reservation?: boolean;
  accessible?: boolean;
  acceptsCards?: boolean;
  outdoorSeating?: boolean;
  petFriendly?: boolean;
  airConditioning?: boolean;
  priceTier?: PriceTier;
}

export interface BusinessServiceItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  category?: string;
}

export interface BusinessVerificationDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt?: string;
  status?: "pending" | "verified" | "rejected";
}

export interface BusinessBranch {
  id: string;
  name: string; // e.g. "Bole Medhanialem Branch", "Hawassa Menaharia Branch"
  branchCode?: string; // e.g. "BR-102"
  isHeadquarters?: boolean;
  countryName: string;
  cityName: string;
  subcityName?: string;
  districtName?: string;
  addressLine: string;
  street?: string;
  building?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: OpeningHourSlot[];
  status?: BusinessStatus;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  ownerId?: string | null;

  // Multi-branch attributes
  hasMultipleBranches?: boolean;
  branchesCount?: number;
  branches?: BusinessBranch[];
  parentBusinessId?: string | null;
  isHeadquarters?: boolean;
  branchName?: string;
  branchCode?: string;
  
  // Category references
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subSubcategoryId?: string;
  subSubcategoryName?: string;

  // Location references
  countryId?: string;
  regionId?: string;
  cityId?: string;
  subcityId?: string;
  districtId?: string;
  countryName?: string;
  cityName?: string;
  districtName?: string;

  // Physical Address & Geo
  addressLine: string;
  street?: string;
  building?: string;
  floorNumber?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;

  // Contact details
  telephone?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  website?: string;

  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;

  // Business scale, type & specialties
  businessLevel?: "Small" | "Medium" | "Large" | "International";
  businessType?: BusinessType;
  priceTier?: PriceTier;
  yearEstablished?: number;
  servicesAndMenu?: string;

  // Rich Profile Details
  description: string;
  shortDescription?: string;
  status: BusinessStatus;
  isVerified: boolean;
  isFeatured: boolean;
  ratingAvg: number;
  reviewCount: number;
  viewCount: number;
  callCount?: number;
  directionCount?: number;

  // Media
  logoUrl: string;
  coverUrl: string;
  youtubeVideoId?: string;
  media: BusinessMedia[];

  // Features & Attributes
  openingHours: OpeningHourSlot[];
  attributes: BusinessAttributes;
  services?: BusinessServiceItem[];
  verificationDocuments?: BusinessVerificationDocument[];

  // Multi-Tier Approval Workflow
  approvalStatus?: BusinessApprovalStatus;
  isApproved?: boolean;
  isPublished?: boolean;
  approvedByCity?: ApprovalStageDetail;
  approvedByCountry?: ApprovalStageDetail;
  approvedBySuperAdmin?: ApprovalStageDetail;
  approvalHistory?: ApprovalAuditEntry[];
  rejectionReason?: string;

  // Registration, Validation & 4-Month Audit Lifecycle
  registeredAt?: string;
  validationDate?: string;
  nextAuditDate?: string;
  existenceStatus?: BusinessExistenceStatus;
  subscriptionStatus?: BusinessSubscriptionStatus;
  lastConfirmedAt?: string;
  lastSubscriptionPaidAt?: string;
  lastAuditAlertSentAt?: string;
  auditAlertsCount?: number;

  createdAt: string;
  updatedAt: string;
}

export type BusinessExistenceStatus =
  | "confirmed"
  | "pending_confirmation"
  | "unconfirmed"
  | "dormant";

export type BusinessSubscriptionStatus =
  | "trial"
  | "active"
  | "due"
  | "past_due";

export type BusinessApprovalStatus =
  | "pending_city"
  | "pending_country"
  | "pending_super_admin"
  | "approved"
  | "rejected"
  | "revision_requested";

export interface ApprovalStageDetail {
  approved: boolean;
  at?: string;
  by?: string;
  notes?: string;
}

export interface ApprovalAuditEntry {
  step:
    | "submitted"
    | "city_approved"
    | "country_approved"
    | "super_admin_approved"
    | "super_admin_override"
    | "rejected"
    | "revision_requested";
  actorId: string;
  actorName: string;
  actorRole: "user" | "owner" | "city_admin" | "country_admin" | "super_admin" | "admin";
  timestamp: string;
  notes?: string;
}
