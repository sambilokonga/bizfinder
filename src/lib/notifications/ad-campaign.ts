import { createNotification } from "@/lib/db/queries/notifications";
import { INotification } from "@/types/notification";

export interface DispatchAdCampaignOptions {
  campaign: {
    id: string;
    name: string;
    businessName: string;
    businessId?: string;
    ownerId?: string;
    placement: string;
    dailyBudgetETB: number;
    cityName?: string;
    countryName?: string;
    targetLocation?: string;
  };
}

/**
 * Dispatches multi-tier notifications when an Advertisement Campaign is created/uploaded:
 * 1. Super Admin (Global platform sponsored advertising telemetry)
 * 2. Country Admin (National sponsored campaign tracking for campaign.countryName)
 * 3. City Admin (Municipal sponsored campaign tracking for campaign.cityName)
 * 4. Business Owner (Confirmation and live status of their sponsored campaign)
 */
export async function dispatchAdCampaignNotifications(
  options: DispatchAdCampaignOptions
): Promise<{ notifications: INotification[] }> {
  const { campaign } = options;
  const cityName = campaign.cityName || "City Jurisdiction";
  const countryName = campaign.countryName || "Country Jurisdiction";
  const ownerId = campaign.ownerId || "owner-demo";
  const businessId = campaign.businessId || `biz-${campaign.id}`;

  const notificationsCreated: INotification[] = [];

  // 1. 👑 SUPER ADMIN NOTIFICATION
  try {
    const superAdminRes = await createNotification({
      title: `📢 [Sponsored Ad Campaign] "${campaign.name}" by ${campaign.businessName}`,
      body: `New sponsored ad placement (${campaign.placement}) registered for "${campaign.businessName}" in ${cityName}, ${countryName}. Daily budget: ${campaign.dailyBudgetETB} ETB.`,
      target: "super_admin",
      targetRole: "super_admin",
      targetCountry: countryName,
      targetCity: cityName,
      targetBusinessId: businessId,
      actionType: "ad_campaign",
      type: "system",
      priority: "medium",
      status: "Delivered",
      sentBy: "BizFinder Ads Desk",
      link: `/admin?tab=advertisements`,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        businessName: campaign.businessName,
        businessId,
        cityName,
        countryName,
        dailyBudgetETB: campaign.dailyBudgetETB,
        placement: campaign.placement,
      },
    });
    if (superAdminRes?.notification) notificationsCreated.push(superAdminRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify Super Admin for ad campaign:", err);
  }

  // 2. 🌍 COUNTRY ADMIN NOTIFICATION
  try {
    const countryAdminRes = await createNotification({
      title: `🌍 [National Sponsored Ad] "${campaign.name}" in ${countryName}`,
      body: `Sponsored ad campaign launched for "${campaign.businessName}" in ${cityName}, ${countryName}. Placement: ${campaign.placement}. Daily budget: ${campaign.dailyBudgetETB} ETB.`,
      target: "country_admin",
      targetRole: "country_admin",
      targetCountry: countryName,
      targetCity: cityName,
      targetBusinessId: businessId,
      actionType: "ad_campaign",
      type: "system",
      priority: "medium",
      status: "Delivered",
      sentBy: "National Command",
      link: `/admin?tab=advertisements&country=${encodeURIComponent(countryName)}`,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        businessName: campaign.businessName,
        businessId,
        cityName,
        countryName,
        dailyBudgetETB: campaign.dailyBudgetETB,
      },
    });
    if (countryAdminRes?.notification) notificationsCreated.push(countryAdminRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify Country Admin for ad campaign:", err);
  }

  // 3. 🏙️ CITY ADMIN NOTIFICATION
  try {
    const cityAdminRes = await createNotification({
      title: `🏙️ [City Ad Alert] Local Sponsor in ${cityName}: "${campaign.name}"`,
      body: `Local advertiser "${campaign.businessName}" registered sponsored campaign in ${cityName} (${campaign.placement}). Daily budget: ${campaign.dailyBudgetETB} ETB.`,
      target: "city_admin",
      targetRole: "city_admin",
      targetCountry: countryName,
      targetCity: cityName,
      targetBusinessId: businessId,
      actionType: "ad_campaign",
      type: "system",
      priority: "medium",
      status: "Delivered",
      sentBy: `${cityName} Municipal Desk`,
      link: `/city-admin`,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        businessName: campaign.businessName,
        businessId,
        cityName,
        countryName,
        dailyBudgetETB: campaign.dailyBudgetETB,
      },
    });
    if (cityAdminRes?.notification) notificationsCreated.push(cityAdminRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify City Admin for ad campaign:", err);
  }

  // 4. 👤 BUSINESS OWNER NOTIFICATION
  try {
    const ownerRes = await createNotification({
      title: `🎉 [Campaign Active] "${campaign.name}" is now Live!`,
      body: `Your sponsored advertisement campaign for "${campaign.businessName}" is now active in ${cityName}, ${countryName}. Placement: ${campaign.placement}. Daily budget: ${campaign.dailyBudgetETB} ETB.`,
      target: "business",
      targetUserId: ownerId,
      targetBusinessId: businessId,
      targetCountry: countryName,
      targetCity: cityName,
      actionType: "ad_campaign",
      type: "promo",
      priority: "high",
      status: "Delivered",
      sentBy: "BizFinder Ads Team",
      link: `/dashboard`,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        businessName: campaign.businessName,
        businessId,
        cityName,
        countryName,
      },
    });
    if (ownerRes?.notification) notificationsCreated.push(ownerRes.notification);
  } catch (err) {
    console.error("[Notifications] Failed to notify Business Owner for ad campaign:", err);
  }

  return { notifications: notificationsCreated };
}
