import { connectToDatabase } from "@/lib/db/mongodb";
import { NotificationModel } from "@/lib/db/models/Notification";
import { SEED_NOTIFICATIONS } from "@/lib/db/seed-data/notifications";
import {
  INotification,
  NotificationStats,
  PaginatedNotificationsResponse,
  NotificationPriority,
  NotificationStatus,
  NotificationTarget,
  NotificationType,
} from "@/types/notification";

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  search?: string;
  target?: string;
  type?: string;
  priority?: string;
  status?: string;
  readStatus?: "all" | "unread" | "read";
  userId?: string;
  businessId?: string;
  role?: string;
  country?: string;
  city?: string;
  actionType?: string;
  sort?: "desc" | "asc";
}

export interface CreateNotificationInput {
  id?: string;
  title: string;
  body: string;
  target: NotificationTarget;
  targetUserId?: string;
  targetBusinessId?: string;
  targetRole?:
    | "super_admin"
    | "country_admin"
    | "city_admin"
    | "admin"
    | "owner"
    | "user"
    | "all";
  targetCountry?: string;
  targetCity?: string;
  actionType?:
    | "business_confirmation"
    | "business_upload"
    | "business_existence_confirmation"
    | "subscription_due"
    | "subscription_expired"
    | "payment"
    | "system"
    | "review"
    | "ad_campaign";
  metadata?: Record<string, any>;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  sentBy?: string;
  type?: NotificationType;
  link?: string;
}

// In-memory cache & fallback for offline/development environments
let inMemoryNotifications: INotification[] = [...SEED_NOTIFICATIONS];

function calculateNotificationStats(items: INotification[]): NotificationStats {
  let unread = 0;
  let delivered = 0;
  let globalCount = 0;
  let businessCount = 0;
  let userCount = 0;
  let criticalCount = 0;

  for (const n of items) {
    if (n.status === "Delivered") delivered++;
    if (!n.isRead && (!n.readBy || n.readBy.length === 0)) unread++;
    if (n.target === "global") globalCount++;
    else if (n.target === "business") businessCount++;
    else if (n.target === "user" || n.target === "admin") userCount++;

    if (n.priority === "critical") criticalCount++;
  }

  return {
    total: items.length,
    unread,
    delivered,
    globalCount,
    businessCount,
    userCount,
    criticalCount,
  };
}

function formatNotification(n: any, currentUserId?: string): INotification {
  const readByList: string[] = Array.isArray(n.readBy) ? n.readBy : [];
  const isRead = currentUserId ? readByList.includes(currentUserId) : readByList.length > 0;

  return {
    id: n.id || (n._id ? n._id.toString() : `notif-${Date.now()}`),
    title: n.title,
    body: n.body,
    target: (n.target as NotificationTarget) || "global",
    targetUserId: n.targetUserId,
    targetBusinessId: n.targetBusinessId,
    targetRole: n.targetRole,
    targetCountry: n.targetCountry,
    targetCity: n.targetCity,
    actionType: n.actionType,
    metadata: n.metadata,
    status: (n.status as NotificationStatus) || "Delivered",
    priority: (n.priority as NotificationPriority) || "medium",
    sentBy: n.sentBy || "Super Admin",
    type: (n.type as NotificationType) || "system",
    readBy: readByList,
    isRead,
    link: n.link,
    createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
    updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
    sent: n.createdAt
      ? new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Just now",
  };
}

export async function getNotifications(
  options: GetNotificationsOptions = {}
): Promise<PaginatedNotificationsResponse> {
  const {
    page = 1,
    limit = 10,
    search,
    target,
    type,
    priority,
    status,
    readStatus = "all",
    userId,
    businessId,
    role,
    country,
    city,
    actionType,
    sort = "desc",
  } = options;

  const validPage = Math.max(1, Number(page) || 1);
  const validLimit = Math.max(1, Number(limit) || 10);
  const skip = (validPage - 1) * validLimit;

  try {
    await connectToDatabase();

    // Auto-seed or sync targetRole if database collection is empty or legacy
    const countTotal = await NotificationModel.countDocuments();
    if (countTotal === 0) {
      try {
        await NotificationModel.insertMany(SEED_NOTIFICATIONS);
      } catch (seedErr) {
        console.warn("[Notifications] Auto-seed failed or partial:", seedErr);
      }
    } else {
      // Sync targetRole for legacy records that may not have targetRole set
      try {
        await Promise.all([
          NotificationModel.updateMany({ target: "global", targetRole: { $exists: false } }, { $set: { targetRole: "all" } }),
          NotificationModel.updateMany({ target: "business", targetRole: { $exists: false } }, { $set: { targetRole: "owner" } }),
          NotificationModel.updateMany({ target: "user", targetRole: { $exists: false } }, { $set: { targetRole: "user" } }),
          NotificationModel.updateMany({ target: "admin", targetRole: { $exists: false } }, { $set: { targetRole: "admin" } }),
          NotificationModel.updateMany({ target: "city_admin", targetRole: { $exists: false } }, { $set: { targetRole: "city_admin" } }),
          NotificationModel.updateMany({ target: "country_admin", targetRole: { $exists: false } }, { $set: { targetRole: "country_admin" } }),
          NotificationModel.updateMany({ target: "super_admin", targetRole: { $exists: false } }, { $set: { targetRole: "super_admin" } }),
        ]);
      } catch {}
    }

    const query: Record<string, any> = {};

    // ─── Common notifications condition (Always visible to all users & roles) ───
    const commonCondition: any = {
      $or: [
        { target: "global" },
        { targetRole: "all" },
        { targetRole: "global" },
        {
          type: "broadcast",
          targetRole: { $in: ["all", "global", null, ""] },
          target: { $in: ["global", null, ""] },
        },
      ],
    };

    // ─── 1. Role & Territory Filtering ───────────────────────────────────────
    if (role === "super_admin") {
      // Super Admin: sees platform-wide admin alerts, audit logs, sign-offs, plus common notices
      const superAdminClauses: any[] = [
        commonCondition,
        { target: "super_admin" },
        { targetRole: "super_admin" },
        { target: { $in: ["admin", "country_admin", "city_admin", "business", "global"] } },
        { targetRole: { $in: ["super_admin", "country_admin", "city_admin", "admin", "all"] } },
        { actionType: { $in: ["business_confirmation", "business_upload", "ad_campaign", "system", "review", "dispute", "payment"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];
      query.$or = superAdminClauses;
    } else if (role === "country_admin") {
      // Country Admin: sees national jurisdiction alerts, city escalations within country, plus common notices
      const countryFilter = country && country !== "all" ? country : undefined;
      const countryClauses: any[] = [
        commonCondition,
        { target: "country_admin" },
        { targetRole: "country_admin" },
        {
          target: { $in: ["admin", "city_admin"] },
          targetRole: { $in: ["country_admin", "admin", "city_admin", "all", null, ""] },
        },
        { actionType: { $in: ["business_confirmation", "business_upload", "ad_campaign", "system", "review", "dispute"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];

      const conditions: any[] = [{ $or: countryClauses }];
      // Do not show super_admin private root alerts
      conditions.push({ targetRole: { $ne: "super_admin" }, target: { $ne: "super_admin" } });

      if (countryFilter) {
        conditions.push({
          $or: [
            { targetCountry: { $exists: false } },
            { targetCountry: null },
            { targetCountry: "" },
            { targetCountry: new RegExp(`^${countryFilter}$`, "i") },
            { "metadata.countryName": new RegExp(`^${countryFilter}$`, "i") },
            { title: new RegExp(countryFilter, "i") },
          ],
        });
      }
      query.$and = conditions;
    } else if (role === "city_admin") {
      // City Admin: sees municipal verification queue, local reviews/ads for their city, plus common notices
      const cityFilter = city && city !== "all" ? city : undefined;
      const countryFilter = country && country !== "all" ? country : undefined;

      const cityClauses: any[] = [
        commonCondition,
        { target: "city_admin" },
        { targetRole: "city_admin" },
        {
          target: "admin",
          targetRole: { $in: ["city_admin", "admin", "all", null, ""] },
        },
        { actionType: { $in: ["business_confirmation", "business_upload", "ad_campaign", "system", "review"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];

      const conditions: any[] = [{ $or: cityClauses }];
      // Exclude super_admin and country_admin private alerts
      conditions.push({
        targetRole: { $nin: ["super_admin", "country_admin"] },
        target: { $nin: ["super_admin", "country_admin"] },
      });

      if (cityFilter) {
        conditions.push({
          $or: [
            { targetCity: { $exists: false } },
            { targetCity: null },
            { targetCity: "" },
            { targetCity: new RegExp(`^${cityFilter}$`, "i") },
            { "metadata.cityName": new RegExp(`^${cityFilter}$`, "i") },
            { title: new RegExp(cityFilter, "i") },
          ],
        });
      }
      if (countryFilter) {
        conditions.push({
          $or: [
            { targetCountry: { $exists: false } },
            { targetCountry: null },
            { targetCountry: "" },
            { targetCountry: new RegExp(`^${countryFilter}$`, "i") },
          ],
        });
      }
      query.$and = conditions;
    } else if (role === "admin") {
      // Operational Admin (Moderator / Operations Admin):
      // Sees moderation queues, reviews, disputes, fraud flags, support tickets, 2FA alerts, plus common notices
      const adminClauses: any[] = [
        commonCondition,
        { target: "admin" },
        { targetRole: "admin" },
        { type: { $in: ["security", "dispute"] } },
        { actionType: { $in: ["review", "dispute"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];

      const conditions: any[] = [
        { $or: adminClauses },
        // Exclude super admin root private operations, city admin / country admin queues, business-owner only financial receipts, and customer personal alerts
        { targetRole: { $nin: ["super_admin", "country_admin", "city_admin", "owner", "user"] } },
        { target: { $nin: ["super_admin", "country_admin", "city_admin", "user"] } },
      ];
      query.$and = conditions;
    } else if (role === "owner") {
      // Business Owner:
      // Sees common notices, notifications addressed to their business, 4-month audits, payments, reviews, and ad updates
      const ownerClauses: any[] = [
        commonCondition,
        { targetRole: "owner" },
        { target: "business" },
        ...(userId ? [{ targetUserId: userId }] : []),
        ...(businessId ? [{ targetBusinessId: businessId }] : []),
        {
          actionType: {
            $in: [
              "business_confirmation",
              "business_existence_confirmation",
              "business_upload",
              "subscription_due",
              "subscription_expired",
              "payment",
              "review",
              "ad_campaign",
            ],
          },
        },
      ];

      const conditions: any[] = [
        { $or: ownerClauses },
        // Must NOT show admin moderation/dispute queues
        {
          target: { $nin: ["admin", "super_admin", "country_admin", "city_admin"] },
          targetRole: { $nin: ["admin", "super_admin", "country_admin", "city_admin"] },
        },
      ];

      if (city && city !== "all") {
        conditions.push({
          $or: [
            { targetCity: { $exists: false } },
            { targetCity: null },
            { targetCity: "" },
            { targetCity: new RegExp(`^${city}$`, "i") },
            ...(userId ? [{ targetUserId: userId }] : []),
            ...(businessId ? [{ targetBusinessId: businessId }] : []),
          ],
        });
      }
      if (country && country !== "all") {
        conditions.push({
          $or: [
            { targetCountry: { $exists: false } },
            { targetCountry: null },
            { targetCountry: "" },
            { targetCountry: new RegExp(`^${country}$`, "i") },
            ...(userId ? [{ targetUserId: userId }] : []),
            ...(businessId ? [{ targetBusinessId: businessId }] : []),
          ],
        });
      }
      query.$and = conditions;
    } else {
      // Common / Local Users (role === "user" or visitors):
      // Sees common platform broadcasts, platform announcements, and personal user notifications ONLY
      const userClauses: any[] = [
        commonCondition,
        { targetRole: "user" },
        {
          target: "user",
          $or: [
            { targetUserId: { $exists: false } },
            { targetUserId: null },
            { targetUserId: "" },
            ...(userId ? [{ targetUserId: userId }] : []),
          ],
        },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];

      const conditions: any[] = [
        { $or: userClauses },
        // Strictly exclude business finances, audit queues, admin disputes, and non-user roles
        {
          target: { $nin: ["business", "admin", "super_admin", "country_admin", "city_admin"] },
          targetRole: { $nin: ["owner", "admin", "super_admin", "country_admin", "city_admin"] },
        },
      ];

      if (city && city !== "all") {
        conditions.push({
          $or: [
            { targetCity: { $exists: false } },
            { targetCity: null },
            { targetCity: "" },
            { targetCity: new RegExp(`^${city}$`, "i") },
            ...(userId ? [{ targetUserId: userId }] : []),
          ],
        });
      }
      if (country && country !== "all") {
        conditions.push({
          $or: [
            { targetCountry: { $exists: false } },
            { targetCountry: null },
            { targetCountry: "" },
            { targetCountry: new RegExp(`^${country}$`, "i") },
            ...(userId ? [{ targetUserId: userId }] : []),
          ],
        });
      }
      query.$and = conditions;
    }

    // ─── 2. Optional Target Subnav Tab Filter ────────────────────────────────
    if (target && target !== "all") {
      const targetFilter = {
        $or: [{ target }, { targetRole: target }],
      };
      if (query.$and) {
        query.$and.push(targetFilter);
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, targetFilter];
        delete query.$or;
      } else {
        query.target = target;
      }
    }

    if (actionType && actionType !== "all") {
      query.actionType = actionType;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (readStatus === "unread") {
      if (userId) {
        query.readBy = { $ne: userId };
      } else {
        query.$or = [
          ...(query.$or || []),
          { readBy: { $exists: false } },
          { readBy: { $size: 0 } },
        ];
      }
    } else if (readStatus === "read") {
      if (userId) {
        query.readBy = userId;
      } else {
        query["readBy.0"] = { $exists: true };
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      const searchClauses = [
        { title: regex },
        { body: regex },
        { sentBy: regex },
        { id: regex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchClauses }];
        delete query.$or;
      } else {
        query.$or = searchClauses;
      }
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    const [rawDocs, totalCount, allDocsForStats] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(validLimit)
        .lean(),
      NotificationModel.countDocuments(query),
      NotificationModel.find().lean(),
    ]);

    const formattedList = rawDocs.map((doc: any) =>
      formatNotification(doc, userId)
    );

    const statsList = allDocsForStats.map((doc: any) =>
      formatNotification(doc, userId)
    );
    const stats = calculateNotificationStats(statsList);
    const totalPages = Math.max(1, Math.ceil(totalCount / validLimit));
    const unreadCount = formattedList.filter((n) => !n.isRead).length;

    return {
      success: true,
      notifications: formattedList,
      total: totalCount,
      page: validPage,
      totalPages,
      limit: validLimit,
      unreadCount,
      stats,
    };
  } catch (error: any) {
    console.warn(
      "[Notifications] Mongo query error, serving in-memory fallback:",
      error?.message || error
    );

    let filtered = [...inMemoryNotifications];

    const isCommonNotif = (n: INotification) =>
      n.target === "global" ||
      n.targetRole === "all" ||
      (n.type === "broadcast" && (!n.targetRole || (n.targetRole as string) === "all"));

    if (role === "super_admin") {
      filtered = filtered.filter((n) => {
        if (isCommonNotif(n)) return true;
        if (userId && n.targetUserId === userId) return true;
        if (n.targetRole === "super_admin" || n.target === "super_admin") return true;
        if (["admin", "country_admin", "city_admin", "business", "global"].includes(n.target)) return true;
        if (["super_admin", "country_admin", "city_admin", "admin", "all"].includes(n.targetRole || "")) return true;
        return false;
      });
    } else if (role === "country_admin") {
      filtered = filtered.filter((n) => {
        if (isCommonNotif(n)) return true;
        if (userId && n.targetUserId === userId) return true;
        if (n.targetRole === "super_admin" || n.target === "super_admin") return false;
        if (country && country !== "all" && n.targetCountry) {
          if (n.targetCountry.toLowerCase() !== country.toLowerCase()) return false;
        }
        if (n.targetRole === "country_admin" || n.target === "country_admin") return true;
        if (["admin", "city_admin"].includes(n.target)) return true;
        if (["country_admin", "admin", "city_admin", "all"].includes(n.targetRole || "")) return true;
        return false;
      });
    } else if (role === "city_admin") {
      filtered = filtered.filter((n) => {
        if (isCommonNotif(n)) return true;
        if (userId && n.targetUserId === userId) return true;
        if (["super_admin", "country_admin"].includes(n.targetRole || "") || ["super_admin", "country_admin"].includes(n.target)) return false;
        if (city && city !== "all" && n.targetCity) {
          if (n.targetCity.toLowerCase() !== city.toLowerCase()) return false;
        }
        if (country && country !== "all" && n.targetCountry) {
          if (n.targetCountry.toLowerCase() !== country.toLowerCase()) return false;
        }
        if (n.targetRole === "city_admin" || n.target === "city_admin") return true;
        if (n.target === "admin" && ["city_admin", "admin", "all", undefined].includes(n.targetRole)) return true;
        return false;
      });
    } else if (role === "admin") {
      filtered = filtered.filter((n) => {
        if (isCommonNotif(n)) return true;
        if (userId && n.targetUserId === userId) return true;
        if (["super_admin", "country_admin", "city_admin", "owner", "user"].includes(n.targetRole || "")) return false;
        if (["super_admin", "country_admin", "city_admin", "user"].includes(n.target)) return false;
        if (n.targetRole === "admin" || n.target === "admin") return true;
        if (["security", "dispute"].includes(n.type || "")) return true;
        return false;
      });
    } else if (role === "owner") {
      filtered = filtered.filter((n) => {
        if (isCommonNotif(n)) return true;
        if (userId && n.targetUserId === userId) return true;
        if (businessId && n.targetBusinessId === businessId) return true;
        if (["admin", "super_admin", "country_admin", "city_admin"].includes(n.targetRole || "")) return false;
        if (["admin", "super_admin", "country_admin", "city_admin"].includes(n.target)) return false;
        if (city && city !== "all" && n.targetCity && n.targetCity.toLowerCase() !== city.toLowerCase()) return false;
        if (country && country !== "all" && n.targetCountry && n.targetCountry.toLowerCase() !== country.toLowerCase()) return false;
        if (n.targetRole === "owner" || n.target === "business") return true;
        return false;
      });
    } else {
      // Common / Local Users (role === "user" or visitors)
      filtered = filtered.filter((n) => {
        if (isCommonNotif(n)) return true;
        if (userId && n.targetUserId === userId) return true;
        if (["owner", "admin", "super_admin", "country_admin", "city_admin"].includes(n.targetRole || "")) return false;
        if (["business", "admin", "super_admin", "country_admin", "city_admin"].includes(n.target)) return false;
        if (city && city !== "all" && n.targetCity && n.targetCity.toLowerCase() !== city.toLowerCase()) return false;
        if (country && country !== "all" && n.targetCountry && n.targetCountry.toLowerCase() !== country.toLowerCase()) return false;
        if (n.targetRole === "user" || n.target === "user") return true;
        return false;
      });
    }

    if (target && target !== "all") {
      filtered = filtered.filter((n) => n.target === target || n.targetRole === target);
    }

    if (actionType && actionType !== "all") {
      filtered = filtered.filter((n) => n.actionType === actionType);
    }

    if (type && type !== "all") {
      filtered = filtered.filter((n) => n.type === type);
    }

    if (priority && priority !== "all") {
      filtered = filtered.filter((n) => n.priority === priority);
    }

    if (status && status !== "all") {
      filtered = filtered.filter((n) => n.status === status);
    }

    if (readStatus === "unread") {
      filtered = filtered.filter((n) => {
        const readList = n.readBy || [];
        return userId ? !readList.includes(userId) : readList.length === 0;
      });
    } else if (readStatus === "read") {
      filtered = filtered.filter((n) => {
        const readList = n.readBy || [];
        return userId ? readList.includes(userId) : readList.length > 0;
      });
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.sentBy.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === "asc" ? timeA - timeB : timeB - timeA;
    });

    const totalCount = filtered.length;
    const paginated = filtered.slice(skip, skip + validLimit);
    const formatted = paginated.map((n) => formatNotification(n, userId));
    const stats = calculateNotificationStats(inMemoryNotifications);
    const totalPages = Math.max(1, Math.ceil(totalCount / validLimit));
    const unreadCount = formatted.filter((n) => !n.isRead).length;

    return {
      success: true,
      notifications: formatted,
      total: totalCount,
      page: validPage,
      totalPages,
      limit: validLimit,
      unreadCount,
      stats,
    };
  }
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<{ success: boolean; notification: INotification; message?: string }> {
  const notifId =
    input.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const now = new Date();

  const newDoc: INotification = {
    id: notifId,
    title: input.title.trim(),
    body: input.body.trim(),
    target: input.target || "global",
    targetUserId: input.targetUserId,
    targetBusinessId: input.targetBusinessId,
    targetRole: input.targetRole,
    targetCountry: input.targetCountry,
    targetCity: input.targetCity,
    actionType: input.actionType,
    metadata: input.metadata,
    status: input.status || "Delivered",
    priority: input.priority || "medium",
    sentBy: input.sentBy || "Super Admin",
    type: input.type || "system",
    link: input.link,
    readBy: [],
    createdAt: now,
    updatedAt: now,
    sent: "Just now",
  };

  // Add to memory cache
  inMemoryNotifications = [newDoc, ...inMemoryNotifications];

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await NotificationModel.create(newDoc);
    }
  } catch (err: any) {
    console.warn(
      "[Notifications] Mongo insert error, stored in in-memory fallback:",
      err?.message || err
    );
  }

  return {
    success: true,
    notification: newDoc,
    message: "Notification registered and dispatched successfully",
  };
}

export async function deleteNotification(id: string): Promise<boolean> {
  inMemoryNotifications = inMemoryNotifications.filter(
    (n) => n.id !== id
  );

  try {
    await connectToDatabase();
    await NotificationModel.deleteOne({
      $or: [{ id }, { _id: id }],
    });
    return true;
  } catch (err) {
    console.warn("[Notifications] Mongo delete error:", err);
    return true;
  }
}

export async function markNotificationRead(
  id: string,
  userId: string
): Promise<boolean> {
  // Update in-memory
  inMemoryNotifications = inMemoryNotifications.map((n) => {
    if (n.id === id) {
      const readList = n.readBy || [];
      if (!readList.includes(userId)) {
        return { ...n, readBy: [...readList, userId], isRead: true };
      }
    }
    return n;
  });

  try {
    await connectToDatabase();
    await NotificationModel.updateOne(
      { $or: [{ id }, { _id: id }] },
      { $addToSet: { readBy: userId } }
    );
    return true;
  } catch (err) {
    console.warn("[Notifications] Mongo markRead error:", err);
    return true;
  }
}

export async function markAllNotificationsRead(
  userId: string,
  role?: string
): Promise<boolean> {
  const allowedTargets = ["global", "user"];
  if (
    role &&
    ["owner", "admin", "city_admin", "country_admin", "super_admin"].includes(role)
  ) {
    allowedTargets.push("business");
  }

  inMemoryNotifications = inMemoryNotifications.map((n) => {
    if (
      allowedTargets.includes(n.target) ||
      n.targetUserId === userId ||
      !n.targetUserId
    ) {
      const readList = n.readBy || [];
      if (!readList.includes(userId)) {
        return { ...n, readBy: [...readList, userId], isRead: true };
      }
    }
    return n;
  });

  try {
    await connectToDatabase();
    await NotificationModel.updateMany(
      {
        $or: [
          { target: { $in: allowedTargets }, targetUserId: { $exists: false } },
          { target: { $in: allowedTargets }, targetUserId: null },
          { target: { $in: allowedTargets }, targetUserId: "" },
          { targetUserId: userId },
        ],
      },
      { $addToSet: { readBy: userId } }
    );
    return true;
  } catch (err) {
    console.warn("[Notifications] Mongo markAllRead error:", err);
    return true;
  }
}

export async function markNotificationUnread(
  id: string,
  userId: string
): Promise<boolean> {
  // Update in-memory
  inMemoryNotifications = inMemoryNotifications.map((n) => {
    if (n.id === id) {
      const readList = (n.readBy || []).filter((u) => u !== userId);
      return { ...n, readBy: readList, isRead: false };
    }
    return n;
  });

  try {
    await connectToDatabase();
    await NotificationModel.updateOne(
      { $or: [{ id }, { _id: id }] },
      { $pull: { readBy: userId } }
    );
    return true;
  } catch (err) {
    console.warn("[Notifications] Mongo markUnread error:", err);
    return true;
  }
}

export async function clearReadNotifications(
  userId: string,
  role?: string
): Promise<number> {
  let clearedCount = 0;
  // In-memory
  const prevLen = inMemoryNotifications.length;
  inMemoryNotifications = inMemoryNotifications.filter((n) => {
    const readList = n.readBy || [];
    return !readList.includes(userId);
  });
  clearedCount = prevLen - inMemoryNotifications.length;

  try {
    await connectToDatabase();
    const res = await NotificationModel.deleteMany({
      readBy: userId,
    });
    return res.deletedCount || clearedCount;
  } catch (err) {
    console.warn("[Notifications] Mongo clearReadNotifications error:", err);
    return clearedCount;
  }
}
