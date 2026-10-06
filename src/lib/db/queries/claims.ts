import { connectToDatabase } from "@/lib/db/mongodb";
import { ClaimModel, IClaimDoc } from "@/lib/db/models/Claim";
import { BusinessModel } from "@/lib/db/models/Business";

export interface ClaimData {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  businessRole: string;
  proofDocumentUrl?: string;
  notes?: string;
}

function docToClaim(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    businessId: obj.businessId,
    businessName: obj.businessName,
    userId: obj.userId,
    userEmail: obj.userEmail,
    userName: obj.userName,
    userPhone: obj.userPhone,
    businessRole: obj.businessRole,
    proofDocumentUrl: obj.proofDocumentUrl,
    notes: obj.notes,
    status: obj.status,
    reviewedBy: obj.reviewedBy,
    reviewedAt: obj.reviewedAt?.toISOString?.() ?? null,
    rejectionReason: obj.rejectionReason,
    createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: obj.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function createClaim(data: ClaimData) {
  await connectToDatabase();
  const doc = await ClaimModel.create(data);
  return docToClaim(doc);
}

export async function getClaimById(id: string) {
  await connectToDatabase();
  const doc = await ClaimModel.findOne({ id }).lean();
  if (!doc) return null;
  return docToClaim(doc);
}

export async function getClaimsByBusiness(businessId: string) {
  await connectToDatabase();
  const docs = await ClaimModel.find({ businessId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(docToClaim);
}

export async function getClaims(
  status?: string,
  page = 1,
  limit = 20
) {
  await connectToDatabase();
  const filter: Record<string, any> = {};
  if (status && status !== "all") filter.status = status;

  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    ClaimModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ClaimModel.countDocuments(filter),
  ]);
  return { total, page, limit, claims: docs.map(docToClaim) };
}

export async function updateClaimStatus(
  id: string,
  status: "approved" | "rejected",
  reviewedBy: string,
  rejectionReason?: string
) {
  await connectToDatabase();
  const update: Record<string, any> = {
    status,
    reviewedBy,
    reviewedAt: new Date(),
  };
  if (rejectionReason) update.rejectionReason = rejectionReason;

  const doc = await ClaimModel.findOneAndUpdate({ id }, update, {
    new: true,
  }).lean();

  if (!doc) return null;

  // If approved, transfer business ownership
  if (status === "approved") {
    const claim = doc as any;
    await BusinessModel.updateOne(
      { id: claim.businessId },
      { ownerId: claim.userId, isVerified: true }
    );
  }

  return docToClaim(doc);
}
