import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { UserRole } from "@/types/user";

function docToUser(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    clerkId: obj.clerkId,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    role: obj.role as UserRole,
    avatarUrl: obj.avatarUrl,
    assignedCountry: obj.assignedCountry,
    assignedCity: obj.assignedCity,
    claimedBusinessIds: obj.claimedBusinessIds ?? [],
    savedBusinessIds: obj.savedBusinessIds ?? [],
    preferences: obj.preferences ?? {
      categoryIds: [],
      radiusKm: 10,
      openNowDefault: false,
    },
    notificationSettings: obj.notificationSettings ?? {
      reviewReplies: true,
      claimUpdates: true,
      promotionalEmails: false,
      weeklyDigest: true,
    },
    isActive: obj.isActive ?? true,
    createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: obj.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

/**
 * Create or update a user from Clerk data (called on sign-in/webhook/admin assignment).
 */
export async function upsertUser(data: {
  clerkId: string;
  email: string;
  name: string;
  role?: UserRole;
  avatarUrl?: string;
  phone?: string;
  assignedCountry?: string;
  assignedCity?: string;
}) {
  await connectToDatabase();
  const doc = await UserModel.findOneAndUpdate(
    { clerkId: data.clerkId },
    {
      $setOnInsert: { id: data.clerkId },
      $set: {
        clerkId: data.clerkId,
        name: data.name,
        email: data.email,
        ...(data.role && { role: data.role }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(data.phone && { phone: data.phone }),
        ...(data.assignedCountry !== undefined && { assignedCountry: data.assignedCountry }),
        ...(data.assignedCity !== undefined && { assignedCity: data.assignedCity }),
      },
    },
    { upsert: true, new: true }
  ).lean();
  return docToUser(doc);
}

export async function getUserByClerkId(clerkId: string) {
  await connectToDatabase();
  const doc = await UserModel.findOne({ clerkId }).lean();
  if (!doc) return null;
  return docToUser(doc);
}

export async function getUserById(id: string) {
  await connectToDatabase();
  const doc = await UserModel.findOne({ id }).lean();
  if (!doc) return null;
  return docToUser(doc);
}

export async function getAllUsers(page = 1, limit = 50) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    UserModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserModel.countDocuments({}),
  ]);
  return { total, page, limit, users: docs.map(docToUser) };
}

export async function updateUserRole(
  clerkId: string,
  role: UserRole,
  geo?: { assignedCountry?: string; assignedCity?: string }
) {
  await connectToDatabase();
  const updateData: Record<string, any> = { role };
  if (geo) {
    if (geo.assignedCountry !== undefined) updateData.assignedCountry = geo.assignedCountry;
    if (geo.assignedCity !== undefined) updateData.assignedCity = geo.assignedCity;
  }
  const doc = await UserModel.findOneAndUpdate(
    { clerkId },
    { $set: updateData },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToUser(doc);
}

export async function getAdminsByGeoScope(country?: string, city?: string) {
  await connectToDatabase();
  const query: Record<string, any> = {
    role: { $in: ["super_admin", "country_admin", "city_admin", "admin"] },
  };

  if (country && country !== "all") {
    query.$or = [
      { role: "super_admin" },
      { assignedCountry: country },
    ];
  }

  if (city && city !== "all") {
    query.$or = [
      { role: "super_admin" },
      { role: "country_admin", assignedCountry: country },
      { role: "city_admin", assignedCountry: country, assignedCity: city },
    ];
  }

  const docs = await UserModel.find(query).sort({ createdAt: -1 }).lean();
  return docs.map(docToUser);
}

export async function updateUserStatus(clerkId: string, isActive: boolean) {
  await connectToDatabase();
  const doc = await UserModel.findOneAndUpdate(
    { clerkId },
    { $set: { isActive } },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToUser(doc);
}

export async function updateUserPreferences(
  clerkId: string,
  preferences: {
    categoryIds?: string[];
    radiusKm?: number;
    openNowDefault?: boolean;
  }
) {
  await connectToDatabase();
  const update: Record<string, any> = {};
  if (preferences.categoryIds !== undefined)
    update["preferences.categoryIds"] = preferences.categoryIds;
  if (preferences.radiusKm !== undefined)
    update["preferences.radiusKm"] = preferences.radiusKm;
  if (preferences.openNowDefault !== undefined)
    update["preferences.openNowDefault"] = preferences.openNowDefault;

  const doc = await UserModel.findOneAndUpdate(
    { clerkId },
    { $set: update },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToUser(doc);
}

export async function updateNotificationSettings(
  clerkId: string,
  settings: {
    reviewReplies?: boolean;
    claimUpdates?: boolean;
    promotionalEmails?: boolean;
    weeklyDigest?: boolean;
  }
) {
  await connectToDatabase();
  const update: Record<string, any> = {};
  for (const [k, v] of Object.entries(settings)) {
    if (v !== undefined) update[`notificationSettings.${k}`] = v;
  }
  const doc = await UserModel.findOneAndUpdate(
    { clerkId },
    { $set: update },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToUser(doc);
}

export async function toggleSavedBusiness(clerkId: string, businessId: string) {
  await connectToDatabase();
  const user = await UserModel.findOne({ clerkId }).lean() as any;
  const saved: string[] = user?.savedBusinessIds ?? [];
  const alreadySaved = saved.includes(businessId);

  const doc = await UserModel.findOneAndUpdate(
    { clerkId },
    alreadySaved
      ? { $pull: { savedBusinessIds: businessId } }
      : { $addToSet: { savedBusinessIds: businessId } },
    { new: true }
  ).lean();
  if (!doc) return null;
  return docToUser(doc);
}

// In-memory cache for user account settings
const inMemoryUserSettings: Record<string, any> = {};

export async function getUserSettings(clerkIdOrUserId: string): Promise<any | null> {
  try {
    const conn = await connectToDatabase();
    if (conn && conn.connection.readyState === 1) {
      const doc = (await UserModel.findOne({
        $or: [{ clerkId: clerkIdOrUserId }, { id: clerkIdOrUserId }, { email: clerkIdOrUserId }],
      }).lean()) as any;

      if (doc?.accountSettings) {
        inMemoryUserSettings[clerkIdOrUserId] = doc.accountSettings;
        return doc.accountSettings;
      }
    }
  } catch (err) {
    console.warn("[getUserSettings] MongoDB error, checking memory cache:", err);
  }

  return inMemoryUserSettings[clerkIdOrUserId] || null;
}

export async function updateUserSettings(
  clerkIdOrUserId: string,
  settings: any
): Promise<any> {
  inMemoryUserSettings[clerkIdOrUserId] = {
    ...(inMemoryUserSettings[clerkIdOrUserId] || {}),
    ...settings,
  };

  try {
    const conn = await connectToDatabase();
    if (conn && conn.connection.readyState === 1) {
      const doc = (await UserModel.findOneAndUpdate(
        { $or: [{ clerkId: clerkIdOrUserId }, { id: clerkIdOrUserId }] },
        { $set: { accountSettings: inMemoryUserSettings[clerkIdOrUserId] } },
        { new: true }
      ).lean()) as any;
      if (doc?.accountSettings) {
        return doc.accountSettings;
      }
    }
  } catch (err) {
    console.warn("[updateUserSettings] MongoDB update error, saved in memory:", err);
  }

  return inMemoryUserSettings[clerkIdOrUserId];
}
