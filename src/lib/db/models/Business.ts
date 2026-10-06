import mongoose, { Schema, Document } from "mongoose";
import { BusinessStatus, PriceTier } from "@/types/business";

export interface IBusinessDoc extends Document {
  id: string;
  name: string;
  slug: string;
  ownerId?: string | null;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subSubcategoryId?: string;
  subSubcategoryName?: string;
  countryId?: string;
  countryName?: string;
  cityId?: string;
  cityName?: string;
  subcityId?: string;
  districtId?: string;
  districtName?: string;
  addressLine: string;
  street?: string;
  building?: string;
  floorNumber?: string;
  postalCode?: string;
  businessLevel?: "Small" | "Medium" | "Large" | "International";
  servicesAndMenu?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude] for GeoJSON
  };
  telephone?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  // Social media
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  // Business type
  businessType?: string;
  description: string;
  shortDescription?: string;
  yearEstablished?: number;
  status: BusinessStatus;
  isVerified: boolean;
  isFeatured: boolean;
  ratingAvg: number;
  reviewCount: number;
  viewCount: number;
  callCount?: number;
  directionCount?: number;
  logoUrl: string;
  coverUrl: string;
  youtubeVideoId?: string;
  media: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    title?: string;
    sortOrder: number;
    uploadedAt?: string;
  }>;
  openingHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    is24h?: boolean;
    isClosed?: boolean;
  }>;
  attributes: {
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
  };
  services: Array<{
    id: string;
    name: string;
    description?: string;
    price?: string;
    category?: string;
  }>;
  verificationDocuments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt?: string;
    status?: string;
  }>;
  // Multi-branch chain attributes
  hasMultipleBranches?: boolean;
  branchesCount?: number;
  branches?: Array<{
    id: string;
    name: string;
    branchCode?: string;
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
    status?: string;
  }>;
  parentBusinessId?: string | null;
  isHeadquarters?: boolean;
  branchName?: string;
  branchCode?: string;
  // Multi-tier approval workflow
  approvalStatus?: "pending_city" | "pending_country" | "pending_super_admin" | "approved" | "rejected" | "revision_requested";
  isApproved?: boolean;
  isPublished?: boolean;
  approvedByCity?: {
    approved: boolean;
    at?: string;
    by?: string;
    notes?: string;
  };
  approvedByCountry?: {
    approved: boolean;
    at?: string;
    by?: string;
    notes?: string;
  };
  approvedBySuperAdmin?: {
    approved: boolean;
    at?: string;
    by?: string;
    notes?: string;
  };
  approvalHistory?: Array<{
    step: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    timestamp: string;
    notes?: string;
  }>;
  rejectionReason?: string;
  // 4-Month Audit & Registration/Validation Lifecycle
  registeredAt?: Date;
  validationDate?: Date;
  nextAuditDate?: Date;
  existenceStatus?: "confirmed" | "pending_confirmation" | "unconfirmed" | "dormant";
  subscriptionStatus?: "trial" | "active" | "due" | "past_due";
  lastConfirmedAt?: Date;
  lastSubscriptionPaidAt?: Date;
  lastAuditAlertSentAt?: Date;
  auditAlertsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusinessDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, default: null, index: true },
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    subcategoryId: { type: String, index: true },
    subcategoryName: { type: String },
    subSubcategoryId: { type: String, index: true },
    subSubcategoryName: { type: String },
    countryId: { type: String, index: true },
    countryName: { type: String },
    cityId: { type: String, index: true },
    cityName: { type: String },
    subcityId: { type: String, index: true },
    districtId: { type: String, index: true },
    districtName: { type: String },
    addressLine: { type: String, required: true },
    street: { type: String },
    building: { type: String },
    floorNumber: { type: String },
    businessLevel: {
      type: String,
      enum: ["Small", "Medium", "Large", "International"],
      default: "Small",
      index: true,
    },
    servicesAndMenu: { type: String },
    hasMultipleBranches: { type: Boolean, default: false, index: true },
    branchesCount: { type: Number, default: 0 },
    branches: [
      {
        id: String,
        name: String,
        branchCode: String,
        isHeadquarters: Boolean,
        countryName: String,
        cityName: String,
        subcityName: String,
        districtName: String,
        addressLine: String,
        street: String,
        building: String,
        phone: String,
        mobile: String,
        email: String,
        managerName: String,
        latitude: Number,
        longitude: Number,
        status: String,
      },
    ],
    parentBusinessId: { type: String, default: null, index: true },
    isHeadquarters: { type: Boolean, default: false },
    branchName: { type: String },
    branchCode: { type: String },
    postalCode: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    telephone: { type: String },
    mobile: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    website: { type: String },
    // Social media links
    facebookUrl: { type: String },
    instagramUrl: { type: String },
    tiktokUrl: { type: String },
    // Business type / legal structure
    businessType: { type: String },
    description: { type: String, required: true },
    shortDescription: { type: String },
    yearEstablished: { type: Number },
    status: {
      type: String,
      enum: ["open", "closed", "temporarily_closed"],
      default: "open",
      index: true,
    },
    // Multi-tier approval workflow fields
    approvalStatus: {
      type: String,
      enum: ["pending_city", "pending_country", "pending_super_admin", "approved", "rejected", "revision_requested"],
      default: "pending_city",
      index: true,
    },
    isApproved: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    approvedByCity: {
      approved: { type: Boolean, default: false },
      at: { type: String },
      by: { type: String },
      notes: { type: String },
    },
    approvedByCountry: {
      approved: { type: Boolean, default: false },
      at: { type: String },
      by: { type: String },
      notes: { type: String },
    },
    approvedBySuperAdmin: {
      approved: { type: Boolean, default: false },
      at: { type: String },
      by: { type: String },
      notes: { type: String },
    },
    approvalHistory: [
      {
        step: { type: String },
        actorId: { type: String },
        actorName: { type: String },
        actorRole: { type: String },
        timestamp: { type: String },
        notes: { type: String },
      },
    ],
    rejectionReason: { type: String },
    // 4-Month Audit & Registration/Validation Lifecycle
    registeredAt: { type: Date, default: Date.now, index: true },
    validationDate: { type: Date, index: true },
    nextAuditDate: { type: Date, index: true },
    existenceStatus: {
      type: String,
      enum: ["confirmed", "pending_confirmation", "unconfirmed", "dormant"],
      default: "confirmed",
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "due", "past_due"],
      default: "trial",
      index: true,
    },
    lastConfirmedAt: { type: Date },
    lastSubscriptionPaidAt: { type: Date },
    lastAuditAlertSentAt: { type: Date },
    auditAlertsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    ratingAvg: { type: Number, default: 0, index: true },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    callCount: { type: Number, default: 0 },
    directionCount: { type: Number, default: 0 },
    logoUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    youtubeVideoId: { type: String },
    media: [
      {
        id: String,
        type: { type: String },
        url: String,
        thumbnailUrl: String,
        title: String,
        sortOrder: Number,
        uploadedAt: String,
      },
    ],
    openingHours: [
      {
        dayOfWeek: Number,
        openTime: String,
        closeTime: String,
        is24h: Boolean,
        isClosed: Boolean,
      },
    ],
    attributes: {
      delivery: { type: Boolean, default: false },
      takeout: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      reservation: { type: Boolean, default: false },
      accessible: { type: Boolean, default: false },
      acceptsCards: { type: Boolean, default: false },
      outdoorSeating: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      priceTier: { type: String, default: "$$" },
    },
    services: [
      {
        id: String,
        name: String,
        description: String,
        price: String,
        category: String,
      },
    ],
    verificationDocuments: [
      {
        id: String,
        name: String,
        url: String,
        type: { type: String },
        uploadedAt: String,
        status: { type: String, default: "pending" },
      },
    ],
  },
  { timestamps: true }
);

// Geospatial 2dsphere index for geo searches
BusinessSchema.index({ location: "2dsphere" });
// Full-text search compound index for keyword queries
BusinessSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
  categoryName: "text",
  subcategoryName: "text",
  addressLine: "text",
});

export const BusinessModel =
  mongoose.models.Business || mongoose.model<IBusinessDoc>("Business", BusinessSchema);

