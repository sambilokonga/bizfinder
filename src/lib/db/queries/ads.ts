import { connectToDatabase } from "@/lib/db/mongodb";
import { AdCampaignModel } from "@/lib/db/models/AdCampaign";
import { AdPlanModel } from "@/lib/db/models/AdPlan";

// ─── Campaign helpers ──────────────────────────────────────────────────────────

function docToCampaign(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    ownerId: obj.ownerId,
    businessId: obj.businessId,
    businessName: obj.businessName,
    name: obj.name,
    placement: obj.placement,
    targetLocation: obj.targetLocation,
    dailyBudgetETB: obj.dailyBudgetETB,
    totalSpentETB: obj.totalSpentETB,
    durationDays: obj.durationDays,
    impressions: obj.impressions,
    clicks: obj.clicks,
    status: obj.status,
    startDate: obj.startDate,
    endDate: obj.endDate,
    createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: obj.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function docToPlan(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    businessId: obj.businessId,
    ownerId: obj.ownerId,
    tier: obj.tier,
    billingCycle: obj.billingCycle,
    amountETB: obj.amountETB,
    amountUSD: obj.amountUSD,
    txId: obj.txId,
    provider: obj.provider,
    activatedAt: obj.activatedAt?.toISOString?.() ?? new Date().toISOString(),
    expiresAt: obj.expiresAt?.toISOString?.() ?? new Date().toISOString(),
    isActive: obj.isActive,
    createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function createAdCampaign(data: {
  id: string;
  ownerId: string;
  businessId: string;
  businessName: string;
  name: string;
  placement: string;
  targetLocation: string;
  dailyBudgetETB: number;
  durationDays: number;
  startDate: string;
}) {
  await connectToDatabase();
  const doc = await AdCampaignModel.create({
    ...data,
    totalSpentETB: 0,
    impressions: 0,
    clicks: 0,
    status: "active",
  });
  return docToCampaign(doc);
}

export async function getAdCampaignsByOwner(
  ownerId: string,
  options?: { page?: number; limit?: number }
) {
  await connectToDatabase();
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    AdCampaignModel.find({ ownerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AdCampaignModel.countDocuments({ ownerId }),
  ]);

  return {
    campaigns: docs.map(docToCampaign),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAdCampaignById(id: string) {
  await connectToDatabase();
  const doc = await AdCampaignModel.findOne({ id }).lean();
  if (!doc) return null;
  return docToCampaign(doc);
}

export async function updateCampaignStatus(
  id: string,
  status: "active" | "paused" | "completed"
) {
  await connectToDatabase();
  const doc = await AdCampaignModel.findOneAndUpdate(
    { id },
    { $set: { status } },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToCampaign(doc);
}

export async function incrementAdMetrics(
  id: string,
  field: "impressions" | "clicks"
) {
  await connectToDatabase();
  await AdCampaignModel.updateOne({ id }, { $inc: { [field]: 1 } });
}

/**
 * Returns businessIds of currently active sponsored campaigns,
 * ordered by dailyBudgetETB descending (highest bidder first).
 */
export async function getActiveSponsoredBusinessIds(limit = 5): Promise<string[]> {
  await connectToDatabase();
  const docs = await AdCampaignModel.find({ status: "active" })
    .sort({ dailyBudgetETB: -1 })
    .limit(limit)
    .select("businessId")
    .lean() as any[];
  return docs.map((d) => d.businessId);
}

export async function getAllAdCampaigns({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  await connectToDatabase();
  const query: Record<string, any> = {};
  if (status && status !== "all") {
    query.status = status;
  }
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    AdCampaignModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AdCampaignModel.countDocuments(query),
  ]);
  return {
    campaigns: docs.map(docToCampaign),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    counts: {
      all: await AdCampaignModel.countDocuments({}),
      active: await AdCampaignModel.countDocuments({ status: "active" }),
      paused: await AdCampaignModel.countDocuments({ status: "paused" }),
      scheduled: await AdCampaignModel.countDocuments({ status: "scheduled" }),
      completed: await AdCampaignModel.countDocuments({ status: "completed" }),
    },
  };
}

export async function deleteAdCampaign(id: string) {
  await connectToDatabase();
  const res = await AdCampaignModel.deleteOne({ id });
  return res.deletedCount > 0;
}

export async function updateCampaignStatusAdmin(
  id: string,
  status: "active" | "paused" | "scheduled" | "completed"
) {
  await connectToDatabase();
  const doc = await AdCampaignModel.findOneAndUpdate(
    { id },
    { $set: { status } },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToCampaign(doc);
}

// ─── Plan helpers ──────────────────────────────────────────────────────────────

export async function upsertAdPlan(data: {
  id: string;
  businessId: string;
  ownerId: string;
  tier: "starter" | "pro" | "spotlight";
  billingCycle: "monthly" | "yearly";
  amountETB: number;
  amountUSD: number;
  txId: string;
  provider: "telebirr" | "cbebirr" | "mpesa" | "card";
}) {
  await connectToDatabase();

  // Deactivate existing active plans for this business
  await AdPlanModel.updateMany(
    { businessId: data.businessId, isActive: true },
    { $set: { isActive: false } }
  );

  const months = data.billingCycle === "yearly" ? 12 : 1;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const doc = await AdPlanModel.create({
    ...data,
    activatedAt: new Date(),
    expiresAt,
    isActive: true,
  });
  return docToPlan(doc);
}

export async function getAdPlanByBusiness(businessId: string) {
  await connectToDatabase();
  const doc = await AdPlanModel.findOne({ businessId, isActive: true })
    .sort({ activatedAt: -1 })
    .lean();
  if (!doc) return null;
  return docToPlan(doc);
}
