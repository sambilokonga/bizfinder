// ─── Subscription & Renewal Types ────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"          // Paid and within renewal window
  | "due"             // Renewal due within 30 days
  | "overdue"         // Past renewal date, not yet paid
  | "suspended"       // Listing hidden — payment overdue > 14 days
  | "cancelled"       // Owner explicitly cancelled
  | "trial";          // First 4 months (no payment yet required)

export type SubscriptionPlan =
  | "basic"           // Free tier / minimal listing
  | "standard"        // Standard listing — default
  | "premium"         // Featured + priority placement
  | "enterprise";     // Multi-branch / API access

export type RenewalAlertStage =
  | "30_days"         // First reminder: 30 days before due
  | "14_days"         // Second reminder: 14 days before
  | "7_days"          // Urgent: 7 days
  | "3_days"          // Critical: 3 days
  | "due_today"       // Due today
  | "3_days_overdue"  // 3 days past due
  | "7_days_overdue"  // 7 days past due — suspension warning
  | "14_days_overdue" // 14 days past due — listing suspended
  | "existence_check";// 4-month existence confirmation required

export type ExistenceConfirmStatus =
  | "pending"         // Not yet confirmed by owner
  | "confirmed"       // Owner confirmed business still exists
  | "no_response"     // Owner did not respond in time
  | "closed";         // Business reported closed by owner

export interface ISubscription {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;

  // Location context
  cityName?: string;
  countryName?: string;

  // Plan details
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  // Pricing
  amountETB: number;          // Subscription fee in ETB
  amountUSD?: number;         // USD equivalent

  // Timeline
  registrationDate: string;   // ISO — when the business was first registered/validated
  validationDate?: string;    // ISO — when it passed super-admin approval (may differ)
  currentPeriodStart: string; // ISO — start of current billing period
  currentPeriodEnd: string;   // ISO — end of current billing period (4 months after start)
  nextRenewalDate: string;    // ISO — same as currentPeriodEnd
  lastPaidAt?: string;        // ISO — last successful payment
  lastPaymentId?: string;     // Reference to payment record

  // Existence confirmation
  existenceConfirmStatus: ExistenceConfirmStatus;
  existenceConfirmedAt?: string;
  existenceConfirmedBy?: string; // "owner" | "admin" | "field_agent"

  // Alert tracking — which reminders have been sent
  alertsSent: RenewalAlertStage[];
  lastAlertSentAt?: string;

  // Renewal history
  renewalHistory: RenewalHistoryEntry[];

  createdAt: string;
  updatedAt: string;
}

export interface RenewalHistoryEntry {
  id: string;
  period: string;              // e.g. "2026-09 → 2027-01"
  paidAt: string;
  amountETB: number;
  paymentId?: string;
  paymentProvider?: string;
  confirmedBy: string;         // admin name or "owner self-service"
  notes?: string;
}

/** Computed renewal status summary for a single business */
export interface BusinessRenewalSummary {
  businessId: string;
  businessName: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  cityName?: string;
  countryName?: string;
  logoUrl?: string;
  subscriptionStatus: SubscriptionStatus;
  plan: SubscriptionPlan;
  amountETB: number;
  registrationDate: string;
  validationDate?: string;
  nextRenewalDate: string;
  daysUntilRenewal: number;    // negative = overdue
  daysOverdue: number;         // 0 if not overdue
  existenceConfirmStatus: ExistenceConfirmStatus;
  alertStage: RenewalAlertStage | null;
  lastPaidAt?: string;
  renewalCycleNumber: number;  // 1 = first renewal, 2 = second, etc.
}

/** Admin dashboard aggregated renewal stats */
export interface RenewalStats {
  totalTracked: number;
  activeCount: number;
  dueCount: number;           // Due within 30 days
  overdueCount: number;       // Past due date
  suspendedCount: number;
  pendingExistenceConfirm: number;
  revenueCollectedETB: number;
  revenuePendingETB: number;
}

/** Subscription plan config */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, {
  label: string;
  amountETB: number;
  amountUSD: number;
  periodMonths: number;
  color: string;
  features: string[];
}> = {
  basic: {
    label: "Basic",
    amountETB: 500,
    amountUSD: 9,
    periodMonths: 4,
    color: "text-slate-500",
    features: ["Directory listing", "Contact info", "Map location"],
  },
  standard: {
    label: "Standard",
    amountETB: 1200,
    amountUSD: 22,
    periodMonths: 4,
    color: "text-indigo-500",
    features: ["All Basic features", "Photo gallery", "Business hours", "Category badge"],
  },
  premium: {
    label: "Premium",
    amountETB: 2500,
    amountUSD: 45,
    periodMonths: 4,
    color: "text-amber-500",
    features: ["All Standard features", "Featured placement", "Priority search ranking", "Review responses"],
  },
  enterprise: {
    label: "Enterprise",
    amountETB: 5000,
    amountUSD: 90,
    periodMonths: 4,
    color: "text-purple-500",
    features: ["All Premium features", "Multi-branch support", "API access", "Dedicated account manager"],
  },
};
