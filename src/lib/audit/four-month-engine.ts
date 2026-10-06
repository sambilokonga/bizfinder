import { connectToDatabase } from "@/lib/db/mongodb";
import { BusinessModel } from "@/lib/db/models/Business";
import { createNotification } from "@/lib/db/queries/notifications";
import { getBusinessById, updateBusiness } from "@/lib/db/queries/businesses";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { Business } from "@/types/business";
import { INotification } from "@/types/notification";

/** Standard 4 months review cycle in milliseconds (120 days) */
export const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;
export const FOUR_MONTHS_DAYS = 120;

export interface BusinessAuditMetrics {
  business: Business;
  registeredAtDate: Date;
  validationDateDate?: Date;
  effectiveStartDate: Date;
  nextAuditDate: Date;
  daysSinceStart: number;
  monthsSinceStart: number;
  isDueForReview: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  existenceStatus: "confirmed" | "pending_confirmation" | "unconfirmed" | "dormant";
  subscriptionStatus: "trial" | "active" | "due" | "past_due";
  lastAuditAlertSentAt?: Date;
  auditAlertsCount: number;
}

export interface FourMonthAuditSummary {
  totalTracked: number;
  dueForReviewCount: number;
  subscriptionDueCount: number;
  confirmedActiveCount: number;
  unconfirmedCount: number;
  totalAlertsDispatched: number;
  items: BusinessAuditMetrics[];
}

/**
 * Calculates accurate 4-month lifecycle metrics for a given business listing.
 */
export function calculateBusinessAuditMetrics(
  biz: Business,
  now: Date = new Date(),
  forceDue: boolean = false
): BusinessAuditMetrics {
  const registeredAtDate = biz.registeredAt
    ? new Date(biz.registeredAt)
    : biz.createdAt
    ? new Date(biz.createdAt)
    : new Date();

  const validationDateDate = biz.validationDate
    ? new Date(biz.validationDate)
    : biz.approvedBySuperAdmin?.at
    ? new Date(biz.approvedBySuperAdmin.at)
    : undefined;

  // Effective anchor date is validation date if approved, else registration date
  const effectiveStartDate = validationDateDate || registeredAtDate;

  // Scheduled next audit date (defaults to 120 days after effective start date)
  const nextAuditDate = biz.nextAuditDate
    ? new Date(biz.nextAuditDate)
    : new Date(effectiveStartDate.getTime() + FOUR_MONTHS_MS);

  const diffMs = now.getTime() - effectiveStartDate.getTime();
  const daysSinceStart = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
  const monthsSinceStart = Math.round((daysSinceStart / 30) * 10) / 10;

  const isOverdue = forceDue || now.getTime() >= nextAuditDate.getTime() || daysSinceStart >= FOUR_MONTHS_DAYS;
  const isDueForReview =
    isOverdue ||
    biz.existenceStatus === "pending_confirmation" ||
    biz.subscriptionStatus === "due";

  const daysOverdue = isOverdue
    ? Math.max(0, Math.floor((now.getTime() - nextAuditDate.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  const existenceStatus = biz.existenceStatus || (isDueForReview ? "pending_confirmation" : "confirmed");
  const subscriptionStatus = biz.subscriptionStatus || (isDueForReview ? "due" : "trial");

  return {
    business: biz,
    registeredAtDate,
    validationDateDate,
    effectiveStartDate,
    nextAuditDate,
    daysSinceStart,
    monthsSinceStart,
    isDueForReview,
    isOverdue,
    daysOverdue,
    existenceStatus,
    subscriptionStatus,
    lastAuditAlertSentAt: biz.lastAuditAlertSentAt ? new Date(biz.lastAuditAlertSentAt) : undefined,
    auditAlertsCount: biz.auditAlertsCount || 0,
  };
}

/**
 * Scans all businesses and collects listings that have completed 4 months
 * (or are overdue for existence confirmation and subscription payment).
 */
export async function collectBusinessesDueForFourMonthReview(options?: {
  forceTestAll?: boolean;
  filterCountry?: string;
  filterCity?: string;
  limit?: number;
}): Promise<FourMonthAuditSummary> {
  const { forceTestAll = false, filterCountry, filterCity, limit = 200 } = options || {};
  const conn = await connectToDatabase();
  const now = new Date();

  let rawList: Business[] = [];

  if (conn) {
    const query: Record<string, any> = {};
    if (filterCountry && filterCountry !== "all") query.countryName = filterCountry;
    if (filterCity && filterCity !== "all") query.cityName = filterCity;

    const docs = await BusinessModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    const { docToBusiness } = await import("@/lib/db/queries/businesses");
    rawList = docs.map(docToBusiness);
  } else {
    rawList = [...SEED_BUSINESSES];
    if (filterCountry && filterCountry !== "all") {
      rawList = rawList.filter((b) => b.countryName === filterCountry);
    }
    if (filterCity && filterCity !== "all") {
      rawList = rawList.filter((b) => b.cityName === filterCity);
    }
  }

  const metricsList: BusinessAuditMetrics[] = rawList.map((biz, idx) => {
    // If forceTestAll is requested or if it's past 120 days or flagged
    const forceThis = forceTestAll && idx < 10;
    return calculateBusinessAuditMetrics(biz, now, forceThis);
  });

  const dueItems = metricsList.filter((m) => m.isDueForReview || m.isOverdue);
  const subscriptionDueItems = metricsList.filter(
    (m) => m.subscriptionStatus === "due" || m.subscriptionStatus === "past_due" || m.isOverdue
  );
  const confirmedItems = metricsList.filter((m) => m.existenceStatus === "confirmed");
  const unconfirmedItems = metricsList.filter(
    (m) => m.existenceStatus === "unconfirmed" || m.existenceStatus === "dormant"
  );
  const totalAlertsDispatched = metricsList.reduce((acc, curr) => acc + curr.auditAlertsCount, 0);

  return {
    totalTracked: metricsList.length,
    dueForReviewCount: dueItems.length,
    subscriptionDueCount: subscriptionDueItems.length,
    confirmedActiveCount: confirmedItems.length,
    unconfirmedCount: unconfirmedItems.length,
    totalAlertsDispatched,
    items: metricsList.sort((a, b) => {
      // Prioritize items that are overdue or due for review
      if (a.isDueForReview && !b.isDueForReview) return -1;
      if (!a.isDueForReview && b.isDueForReview) return 1;
      return b.daysSinceStart - a.daysSinceStart;
    }),
  };
}

/**
 * Automatically collects all businesses that have completed 4 months of registration
 * or validation, generates existence confirmation alerts and subscription payment due notices,
 * dispatches them to business owners and admins, and updates the database records.
 */
export async function collectAndDispatchFourMonthAlerts(options?: {
  businessIds?: string[];
  forceTest?: boolean;
  dryRun?: boolean;
  filterCountry?: string;
  filterCity?: string;
}): Promise<{
  success: boolean;
  processedCount: number;
  existenceAlertsCount: number;
  subscriptionAlertsCount: number;
  totalAlertsDispatched: number;
  results: Array<{
    businessId: string;
    businessName: string;
    ownerId?: string;
    existenceAlertId?: string;
    subscriptionAlertId?: string;
    existenceStatus: string;
    subscriptionStatus: string;
    daysSinceStart: number;
  }>;
}> {
  const { businessIds, forceTest = false, dryRun = false, filterCountry, filterCity } = options || {};

  const summary = await collectBusinessesDueForFourMonthReview({
    forceTestAll: forceTest,
    filterCountry,
    filterCity,
    limit: 500,
  });

  let candidates = summary.items;
  if (businessIds && businessIds.length > 0) {
    candidates = candidates.filter((item) => businessIds.includes(item.business.id));
  } else if (!forceTest) {
    candidates = candidates.filter((item) => item.isDueForReview || item.isOverdue);
  }

  const results: Array<{
    businessId: string;
    businessName: string;
    ownerId?: string;
    existenceAlertId?: string;
    subscriptionAlertId?: string;
    existenceStatus: string;
    subscriptionStatus: string;
    daysSinceStart: number;
  }> = [];

  let existenceAlertsCount = 0;
  let subscriptionAlertsCount = 0;

  for (const item of candidates) {
    const biz = item.business;
    const ownerId = biz.ownerId || "user_guest";
    const regDateStr = item.registeredAtDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const valDateStr = item.validationDateDate
      ? item.validationDateDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    let existenceAlertId: string | undefined;
    let subscriptionAlertId: string | undefined;

    if (!dryRun) {
      // 1. ⚠️ EXISTENCE CONFIRMATION ALERT MESSAGE
      try {
        const existNotif = await createNotification({
          title: `⚠️ [4-Month Review] Confirm Existence: "${biz.name}"`,
          body: `Your business "${biz.name}" completed 4 months (${item.daysSinceStart} days) of registration/validation (started ${valDateStr || regDateStr}). As a verified platform directory standard, please confirm whether your business is currently active and operating at "${biz.addressLine || biz.cityName}". Unconfirmed listings will be paused.`,
          target: ownerId !== "user_guest" ? "user" : "admin",
          targetUserId: ownerId !== "user_guest" ? ownerId : undefined,
          targetBusinessId: biz.id,
          targetCountry: biz.countryName,
          targetCity: biz.cityName,
          targetRole: "owner",
          actionType: "business_existence_confirmation",
          type: "verification",
          priority: "high",
          status: "Delivered",
          sentBy: "GlobalBiz Verification Bureau",
          link: `/dashboard?confirm_existence=${biz.id}`,
          metadata: {
            businessId: biz.id,
            businessName: biz.name,
            addressLine: biz.addressLine,
            cityName: biz.cityName,
            countryName: biz.countryName,
            registeredAt: item.registeredAtDate.toISOString(),
            validationDate: item.validationDateDate?.toISOString(),
            daysSinceStart: item.daysSinceStart,
            actionRequired: "confirm_existence",
          },
        });
        if (existNotif?.notification?.id) {
          existenceAlertId = existNotif.notification.id;
          existenceAlertsCount++;
        }
      } catch (err) {
        console.error(`[4-Month Engine] Failed to dispatch existence alert for "${biz.name}":`, err);
      }

      // 2. 💳 SUBSCRIPTION FEE DUE ALERT MESSAGE
      try {
        const subNotif = await createNotification({
          title: `💳 [Subscription Due] 4-Month Listing Renewal for "${biz.name}"`,
          body: `Your 4-month listing cycle for "${biz.name}" is complete. Please pay your directory subscription fee (starting from 1,499 ETB / mo via Telebirr, CBE Birr, M-Pesa, Card or Bank Transfer) to maintain verified status, top priority ranking, and direct customer leads.`,
          target: ownerId !== "user_guest" ? "user" : "admin",
          targetUserId: ownerId !== "user_guest" ? ownerId : undefined,
          targetBusinessId: biz.id,
          targetCountry: biz.countryName,
          targetCity: biz.cityName,
          targetRole: "owner",
          actionType: "subscription_due",
          type: "payment",
          priority: "high",
          status: "Delivered",
          sentBy: "GlobalBiz Billing Authority",
          link: `/billing?businessId=${biz.id}`,
          metadata: {
            businessId: biz.id,
            businessName: biz.name,
            amountDue: 1499,
            currency: "ETB",
            recommendedTier: "pro",
            actionRequired: "pay_subscription",
          },
        });
        if (subNotif?.notification?.id) {
          subscriptionAlertId = subNotif.notification.id;
          subscriptionAlertsCount++;
        }
      } catch (err) {
        console.error(`[4-Month Engine] Failed to dispatch subscription alert for "${biz.name}":`, err);
      }

      // Update business document in database
      try {
        await updateBusiness(biz.id, {
          existenceStatus: "pending_confirmation",
          subscriptionStatus: "due",
          lastAuditAlertSentAt: new Date().toISOString(),
          auditAlertsCount: (biz.auditAlertsCount || 0) + 1,
        } as any);
      } catch (upErr) {
        console.warn(`[4-Month Engine] Failed to update business status for "${biz.name}":`, upErr);
      }
    } else {
      // Dry-run simulation
      existenceAlertsCount++;
      subscriptionAlertsCount++;
    }

    results.push({
      businessId: biz.id,
      businessName: biz.name,
      ownerId: biz.ownerId || undefined,
      existenceAlertId,
      subscriptionAlertId,
      existenceStatus: "pending_confirmation",
      subscriptionStatus: "due",
      daysSinceStart: item.daysSinceStart,
    });
  }

  // Also notify Super Admin summary if alerts were dispatched
  if (!dryRun && results.length > 0) {
    try {
      await createNotification({
        title: `📢 [Audit Cycle Complete] Dispatched 4-Month Alerts to ${results.length} Businesses`,
        body: `Automated 4-month audit scan finished. Generated and sent ${existenceAlertsCount} existence confirmation alerts and ${subscriptionAlertsCount} subscription renewal notices.`,
        target: "super_admin",
        targetRole: "super_admin",
        actionType: "system",
        type: "system",
        priority: "medium",
        status: "Delivered",
        sentBy: "Automated Audit Engine",
        link: `/admin?tab=businesses&subtab=four_month_audit`,
        metadata: {
          processedCount: results.length,
          existenceAlertsCount,
          subscriptionAlertsCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn("Failed to notify Super Admin of audit cycle:", e);
    }
  }

  return {
    success: true,
    processedCount: results.length,
    existenceAlertsCount,
    subscriptionAlertsCount,
    totalAlertsDispatched: existenceAlertsCount + subscriptionAlertsCount,
    results,
  };
}

/**
 * 1-Click Existence Confirmation:
 * Called by business owner or platform administrator to verify that the business
 * is actively operating at its registered location.
 */
export async function confirmBusinessExistence(
  businessId: string,
  confirmedBy: {
    actorId: string;
    actorName: string;
    actorRole: string;
    notes?: string;
  }
): Promise<{ success: boolean; business: Business | null; message: string }> {
  const business = await getBusinessById(businessId);
  if (!business) {
    return { success: false, business: null, message: "Business not found." };
  }

  const now = new Date();
  const nextCycle = new Date(now.getTime() + FOUR_MONTHS_MS).toISOString();

  const updated = await updateBusiness(businessId, {
    existenceStatus: "confirmed",
    lastConfirmedAt: now.toISOString(),
    nextAuditDate: nextCycle,
  } as any);

  // Send confirmation acknowledgment notification
  try {
    if (business.ownerId) {
      await createNotification({
        title: `✅ [Existence Confirmed] "${business.name}" is Active`,
        body: `Thank you! Your business existence has been verified. Your listing is confirmed active for the next 4-month cycle (next review: ${new Date(nextCycle).toLocaleDateString()}).`,
        target: "user",
        targetUserId: business.ownerId,
        targetBusinessId: business.id,
        actionType: "business_existence_confirmation",
        type: "verification",
        priority: "medium",
        status: "Delivered",
        sentBy: "GlobalBiz Verification Bureau",
        link: `/dashboard`,
        metadata: {
          businessId: business.id,
          businessName: business.name,
          confirmedAt: now.toISOString(),
          confirmedBy: confirmedBy.actorName,
        },
      });
    }

    // Also notify admins
    await createNotification({
      title: `🏢 [Owner Confirmed Existence] "${business.name}" is Operating`,
      body: `${confirmedBy.actorName} (${confirmedBy.actorRole}) confirmed that "${business.name}" (${business.cityName}) is active and operational. Next audit scheduled for 4 months from now.`,
      target: "admin",
      targetBusinessId: business.id,
      actionType: "business_existence_confirmation",
      type: "verification",
      priority: "low",
      status: "Delivered",
      sentBy: "Platform System",
      metadata: {
        businessId: business.id,
        businessName: business.name,
        confirmedBy: confirmedBy.actorName,
      },
    });
  } catch (notifErr) {
    console.warn("Failed to create existence confirmation notifications:", notifErr);
  }

  return {
    success: true,
    business: updated,
    message: `Business "${business.name}" existence successfully confirmed for the next 4 months!`,
  };
}

/**
 * Records a completed subscription fee payment for the 4-month listing period.
 */
export async function recordBusinessSubscriptionPayment(
  businessId: string,
  paymentInfo: {
    payerName: string;
    amount: number;
    currency?: string;
    provider: string;
    reference?: string;
  }
): Promise<{ success: boolean; business: Business | null; message: string }> {
  const business = await getBusinessById(businessId);
  if (!business) {
    return { success: false, business: null, message: "Business not found." };
  }

  const now = new Date();
  const nextAudit = new Date(now.getTime() + FOUR_MONTHS_MS).toISOString();

  const updated = await updateBusiness(businessId, {
    subscriptionStatus: "active",
    lastSubscriptionPaidAt: now.toISOString(),
    nextAuditDate: nextAudit,
    isVerified: true,
  } as any);

  // Send receipt notification to owner
  try {
    if (business.ownerId) {
      await createNotification({
        title: `🎉 [Subscription Active] 4-Month Listing Renewed: "${business.name}"`,
        body: `Payment of ${paymentInfo.amount} ${paymentInfo.currency || "ETB"} via ${paymentInfo.provider} received. Your business listing is active with Verified status for the next 4 months.`,
        target: "user",
        targetUserId: business.ownerId,
        targetBusinessId: business.id,
        actionType: "subscription_due",
        type: "payment",
        priority: "medium",
        status: "Delivered",
        sentBy: "GlobalBiz Billing Authority",
        link: `/dashboard`,
        metadata: {
          businessId: business.id,
          amount: paymentInfo.amount,
          reference: paymentInfo.reference,
          nextAuditDate: nextAudit,
        },
      });
    }
  } catch (err) {
    console.warn("Failed to send subscription payment notification:", err);
  }

  return {
    success: true,
    business: updated,
    message: `Subscription fee recorded. Business "${business.name}" is now active with 4-month renewal!`,
  };
}
