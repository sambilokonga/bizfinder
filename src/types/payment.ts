export type PaymentProvider =
  | "telebirr"
  | "cbebirr"
  | "mpesa"
  | "card"
  | "chapa"
  | "bank_transfer"
  | "cash";

export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export type PaymentType =
  | "subscription"
  | "advertisement"
  | "verification"
  | "featured_listing"
  | "other";

export type PaymentCurrency = "ETB" | "USD";

export interface IPayment {
  id: string; // Unique transaction identifier e.g. TX-TEL-892104
  businessId?: string;
  businessName: string;
  cityName?: string;    // City where the paying business is located
  countryName?: string; // Country where the paying business is located
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  amount: number;
  currency: PaymentCurrency;
  provider: PaymentProvider;
  paymentType: PaymentType;
  status: PaymentStatus;
  reference?: string; // Provider transaction code, bank slip, or receipt #
  description?: string; // Description or plan note
  metadata?: Record<string, any>;
  registeredBy?: string; // Admin or system who recorded the payment
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Aggregated payment summary per geographic region */
export interface GeoPaymentSummary {
  country: string;
  city: string;
  totalAmount: number;
  currency: string;
  count: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
}

export interface PaymentStats {
  totalRevenueETB: number;
  totalRevenueUSD: number;
  countCompleted: number;
  countPending: number;
  countRefunded: number;
  countFailed: number;
  avgOrderValueETB: number;
}

export interface PaginatedPaymentsResponse {
  success: boolean;
  payments: IPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: PaymentStats;
  geoBreakdown?: GeoPaymentSummary[];
}
