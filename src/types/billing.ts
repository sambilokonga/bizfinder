export type BillingCycle = "monthly" | "yearly";
export type BillingCurrency = "ETB" | "USD";
export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  popular?: boolean;
  badge?: string;
  priceMonthlyETB: number;
  priceYearlyETB: number; // usually 10-12 months equivalent
  priceMonthlyUSD: number;
  priceYearlyUSD: number;
  maxBranches: number;
  isVerifiedBadgeIncluded: boolean;
  isPrioritySearchIncluded: boolean;
  isFeaturedBannerIncluded: boolean;
  features: PlanFeature[];
}

export const OFFICIAL_PAYMENT_ACCOUNTS = {
  cbe: {
    bankName: "Commercial Bank of Ethiopia (CBE)",
    accountNumber: "1000377050917",
    accountName: "GlobalBiz Platform",
    branch: "Finfine Branch / Head Office",
    swiftCode: "CBETETAA",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=1000377050917",
    instructions:
      "Transfer exact amount via CBE Mobile Banking, CBE Birr, or direct branch deposit slip to account 1000377050917. Take a screenshot or photo of your receipt and upload it below.",
  },
  telebirr: {
    serviceName: "Telebirr Direct / Merchant Transfer",
    phoneNumber: "0913273066",
    accountName: "GlobalBiz Technologies",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0913273066",
    instructions:
      "Send payment via Telebirr app or *127# to 0913273066. Attach the SMS confirmation message or screenshot as proof of payment.",
  },
  mpesa: {
    serviceName: "M-Pesa Safaricom",
    paybillOrTill: "0770000000",
    accountName: "GlobalBiz Safaricom M-Pesa",
    instructions: "Enter your registered M-Pesa phone number to receive an instant STK push prompt.",
  },
};

export const GLOBALBIZ_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-starter",
    tier: "starter",
    name: "Free Starter",
    tagline: "Basic presence for local neighborhood shops",
    priceMonthlyETB: 0,
    priceYearlyETB: 0,
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    maxBranches: 1,
    isVerifiedBadgeIncluded: false,
    isPrioritySearchIncluded: false,
    isFeaturedBannerIncluded: false,
    features: [
      { text: "1 Business Location", included: true },
      { text: "Standard Directory Listing", included: true },
      { text: "Customer Reviews & Ratings", included: true },
      { text: "Opening Hours & Contact Info", included: true },
      { text: "Gold Verified Merchant Badge", included: false },
      { text: "Priority Search Ranking", included: false },
      { text: "Multi-branch Management", included: false },
      { text: "Product Catalog & Digital Menu", included: false },
    ],
  },
  {
    id: "plan-pro",
    tier: "pro",
    name: "Growth Pro",
    tagline: "Verified authority with priority rank & direct customer leads",
    popular: true,
    badge: "Most Popular",
    priceMonthlyETB: 1499,
    priceYearlyETB: 14990, // Save 2 months
    priceMonthlyUSD: 25,
    priceYearlyUSD: 250,
    maxBranches: 5,
    isVerifiedBadgeIncluded: true,
    isPrioritySearchIncluded: true,
    isFeaturedBannerIncluded: false,
    features: [
      { text: "Up to 5 Business Branches", included: true },
      { text: "Official Verified Gold Badge", included: true, highlight: true },
      { text: "Priority City & Subcity Search Rank", included: true, highlight: true },
      { text: "Direct Customer Inquiries & Chat", included: true },
      { text: "Product Showcase & Digital Menu (25 items)", included: true },
      { text: "Promotion Vouchers & Discount Coupons", included: true },
      { text: "Detailed Analytics & Visitor Telemetry", included: true },
      { text: "Top-of-Search Featured Banner", included: false },
    ],
  },
  {
    id: "plan-enterprise",
    tier: "enterprise",
    name: "Enterprise Spotlight",
    tagline: "Dominant market visibility for major brands & hotel/retail chains",
    badge: "Maximum Visibility",
    priceMonthlyETB: 3999,
    priceYearlyETB: 39990,
    priceMonthlyUSD: 65,
    priceYearlyUSD: 650,
    maxBranches: 50,
    isVerifiedBadgeIncluded: true,
    isPrioritySearchIncluded: true,
    isFeaturedBannerIncluded: true,
    features: [
      { text: "Unlimited Multi-Branch Locations", included: true },
      { text: "Top-of-Search Featured Banner Placement", included: true, highlight: true },
      { text: "Official Verified Gold Badge", included: true },
      { text: "VIP Priority in GlobalBiz Search Engine", included: true, highlight: true },
      { text: "Unlimited Products, Menus & Services", included: true },
      { text: "Custom QR Code Marketing Standee Kit", included: true },
      { text: "Dedicated VIP Account Manager", included: true },
      { text: "Priority 24/7 Telephone Support", included: true },
    ],
  },
];

export interface BusinessRegistrationPayload {
  name: string;
  categoryId: string;
  categoryName: string;
  countryName: string;
  cityName: string;
  subcityName?: string;
  addressLine: string;
  telephone?: string;
  mobile?: string;
  email?: string;
  description: string;
}

export interface CheckoutRequestPayload {
  businessId?: string;
  businessName?: string;
  newBusiness?: BusinessRegistrationPayload;
  planId: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  currency: BillingCurrency;
  amount: number;
  paymentMethod: "telebirr" | "cbebirr" | "mpesa" | "card" | "bank_transfer";
  payerName: string;
  payerPhone?: string;
  payerEmail?: string;
  // Provider-specific data
  telebirrPhone?: string;
  cbeAccountNumber?: string;
  mpesaPhone?: string;
  cardDetails?: {
    last4: string;
    brand: string;
  };
  // Manual transfer data
  receiptUrl?: string;
  bankReference?: string;
  depositedAccount?: "1000377050917" | "0913273066" | string;
}
