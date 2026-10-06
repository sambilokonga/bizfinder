import { connectToDatabase } from "@/lib/db/mongodb";
import { BusinessModel } from "@/lib/db/models/Business";
import { createNotification } from "@/lib/db/queries/notifications";
import { Business } from "@/types/business";
import { INotification } from "@/types/notification";

export interface DispatchConfirmationOptions {
  business: Partial<Business> & { id: string; name: string };
  ownerInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  submissionType?: "wizard" | "uploaded" | "admin_created";
  isNewUserOverride?: boolean;
}

/**
 * Dispatches multi-tier confirmation alerts to:
 * 1. Super Admin (Global Confirmation Queue)
 * 2. Country Admin (National Verification Queue for business.countryName)
 * 3. City Admin (Municipal Verification Queue for business.cityName)
 * 4. User / Owner (Submission confirmation and multi-tier tracking)
 */
export async function dispatchBusinessConfirmationNotifications(
  options: DispatchConfirmationOptions
): Promise<{
  isNewUser: boolean;
  notifications: INotification[];
}> {
  const { business, ownerInfo, submissionType = "wizard", isNewUserOverride } = options;
  const ownerId = business.ownerId || ownerInfo?.id || "user_guest";
  const ownerName = ownerInfo?.name || "Business Owner";
  const cityName = business.cityName || "City Jurisdiction";
  const countryName = business.countryName || "Country Jurisdiction";
  const categoryName = business.categoryName || "General Business";

  // Determine if this is a brand new user or an existing owner
  let isNewUser = true;
  if (typeof isNewUserOverride === "boolean") {
    isNewUser = isNewUserOverride;
  } else {
    try {
      await connectToDatabase();
      const priorCount = await BusinessModel.countDocuments({
        ownerId,
        id: { $ne: business.id },
      });
      isNewUser = priorCount === 0;
    } catch {
      isNewUser = true;
    }
  }

  const userBadge = isNewUser ? "✨ Brand New User" : "🏢 Existing Business Owner";
  const userRoleDescription = isNewUser ? "first-time registrant" : "returning business owner";
  const methodLabel = submissionType === "uploaded" ? "bulk uploaded" : "registered";

  const notificationsCreated: INotification[] = [];

  // 1. 👑 SUPER ADMIN ALERT (Global Platform Confirmation)
  try {
    const superAdminRes = await createNotification({
      title: `🔔 [Confirmation Required] ${userBadge} ${submissionType === "uploaded" ? "Uploaded" : "Added"} "${business.name}"`,
      body: `${userBadge} (${ownerName}) just ${methodLabel} "${business.name}" (${categoryName}) in ${cityName}, ${countryName} for platform confirmation. Click to review or verify.`,
      target: "super_admin",
      targetRole: "super_admin",
      targetCountry: countryName,
      targetCity: cityName,
      targetBusinessId: business.id,
      actionType: "business_confirmation",
      type: "verification",
      priority: "high",
      status: "Delivered",
      sentBy: "BizFinder Queue",
      link: `/admin?tab=listings&confirm=${business.id}`,
      metadata: {
        businessId: business.id,
        businessName: business.name,
        categoryName,
        cityName,
        countryName,
        ownerId,
        ownerName,
        ownerEmail: ownerInfo?.email,
        isNewUser,
        submissionType,
        requiredStage: "Stage 1 (City) -> Stage 2 (Country) -> Stage 3 (Super Admin)",
      },
    });
    if (superAdminRes?.notification) notificationsCreated.push(superAdminRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify Super Admin:", err);
  }

  // 2. 🌍 COUNTRY ADMIN ALERT (National Directory Verification)
  try {
    const countryAdminRes = await createNotification({
      title: `🌍 [Country Confirmation] New Listing in ${countryName}: "${business.name}"`,
      body: `A ${userRoleDescription} submitted "${business.name}" (${categoryName}) in ${cityName}. National directory review & regional compliance confirmation required.`,
      target: "country_admin",
      targetRole: "country_admin",
      targetCountry: countryName,
      targetCity: cityName,
      targetBusinessId: business.id,
      actionType: "business_confirmation",
      type: "verification",
      priority: "high",
      status: "Delivered",
      sentBy: "National Command",
      link: `/admin?tab=listings&country=${encodeURIComponent(countryName)}&confirm=${business.id}`,
      metadata: {
        businessId: business.id,
        businessName: business.name,
        categoryName,
        cityName,
        countryName,
        ownerId,
        ownerName,
        isNewUser,
        submissionType,
      },
    });
    if (countryAdminRes?.notification) notificationsCreated.push(countryAdminRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify Country Admin:", err);
  }

  // 3. 🏙️ CITY ADMIN ALERT (Municipal Stage 1 Verification)
  try {
    const cityAdminRes = await createNotification({
      title: `🏙️ [City Verification Alert] Local Listing in ${cityName}: "${business.name}"`,
      body: `Stage 1 Municipal Confirmation required for "${business.name}" at ${business.addressLine || cityName}. Verify location coordinates, category, and municipal compliance.`,
      target: "city_admin",
      targetRole: "city_admin",
      targetCountry: countryName,
      targetCity: cityName,
      targetBusinessId: business.id,
      actionType: "business_confirmation",
      type: "verification",
      priority: "high",
      status: "Delivered",
      sentBy: `${cityName} Municipal Desk`,
      link: `/city-admin?confirm=${business.id}`,
      metadata: {
        businessId: business.id,
        businessName: business.name,
        categoryName,
        cityName,
        countryName,
        addressLine: business.addressLine,
        ownerId,
        ownerName,
        isNewUser,
        submissionType,
      },
    });
    if (cityAdminRes?.notification) notificationsCreated.push(cityAdminRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify City Admin:", err);
  }

  // 4. 👤 USER / OWNER CONFIRMATION NOTICE
  if (ownerId && ownerId !== "user_guest") {
    try {
      const userRes = await createNotification({
        title: `📋 [Listing Received] "${business.name}" Queued for Confirmation`,
        body: `Thank you! Your business registration has been received. Super Admin, Country Admin (${countryName}), and City Admin (${cityName}) have been alerted for confirmation review.`,
        target: "user",
        targetUserId: ownerId,
        targetBusinessId: business.id,
        actionType: "business_confirmation",
        type: "verification",
        priority: "medium",
        status: "Delivered",
        sentBy: "BizFinder Team",
        link: `/dashboard`,
        metadata: {
          businessId: business.id,
          businessName: business.name,
          status: "pending_city",
        },
      });
      if (userRes?.notification) notificationsCreated.push(userRes.notification);
    } catch (err) {
      console.error("[Notifications] Failed to notify User:", err);
    }
  }

  return {
    isNewUser,
    notifications: notificationsCreated,
  };
}
