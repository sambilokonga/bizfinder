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

    // Auto-seed if database collection is empty
    const countTotal = await NotificationModel.countDocuments();
    if (countTotal === 0) {
      try {
        await NotificationModel.insertMany(SEED_NOTIFICATIONS);
      } catch (seedErr) {
        console.warn("[Notifications] Auto-seed failed or partial:", seedErr);
      }
    }

    const query: Record<string, any> = {};

    // ─── 1. Role & Territory Filtering ───────────────────────────────────────
    if (role === "super_admin" && (!country || country === "all") && (!city || city === "all")) {
      // Super Admin sees all system, confirmation, ad and audit alerts platform-wide (unfiltered by territory)
      const allowedTargets = [
        "global",
        "business",
        "admin",
        "super_admin",
        "country_admin",
        "city_admin",
      ];
      query.$or = [
        { target: { $in: allowedTargets } },
        { targetRole: { $in: ["super_admin", "admin", "all"] } },
        { actionType: { $in: ["business_confirmation", "business_upload", "ad_campaign", "system"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];
    } else if (role === "city_admin" || (city && city !== "all" && role !== "owner" && role !== "user")) {
      // City Admin: sees notifications for their specific municipal jurisdiction + unassigned global admin alerts
      const cityFilter = city && city !== "all" ? city : undefined;
      const countryFilter = country && country !== "all" ? country : undefined;

      const cityClauses: any[] = [];
      if (cityFilter) {
        const cityRegex = new RegExp(`^${cityFilter}$`, "i");
        cityClauses.push(
          { targetCity: cityRegex },
          { "metadata.cityName": cityRegex },
          { title: new RegExp(cityFilter, "i") },
          { body: new RegExp(cityFilter, "i") }
        );
      }

      // Unassigned municipal / global notices (not pinned to a different city)
      const globalCityNotices: any = {
        target: { $in: ["global", "admin", "city_admin", "business"] },
        $or: [
          { targetCity: { $exists: false } },
          { targetCity: null },
          { targetCity: "" },
        ],
      };
      if (countryFilter) {
        globalCityNotices.$or = [
          ...globalCityNotices.$or,
          { targetCountry: new RegExp(`^${countryFilter}$`, "i") },
        ];
      }
      cityClauses.push(globalCityNotices);

      if (userId) {
        cityClauses.push({ targetUserId: userId });
      }

      // Must belong to allowed city targets or action types
      const cityTargetCondition = {
        $or: [
          { target: { $in: ["city_admin", "admin", "business", "global"] } },
          { targetRole: { $in: ["city_admin", "admin", "all"] } },
          { actionType: { $in: ["business_confirmation", "business_upload", "ad_campaign", "system", "review"] } },
        ],
      };

      if (cityFilter) {
        // Exclude notifications explicitly addressed to a DIFFERENT city
        const otherCityExclude = {
          $or: [
            { targetCity: { $exists: false } },
            { targetCity: null },
            { targetCity: "" },
            { targetCity: new RegExp(`^${cityFilter}$`, "i") },
          ],
        };
        query.$and = [
          { $or: cityClauses },
          cityTargetCondition,
          otherCityExclude,
        ];
      } else {
        query.$and = [
          { $or: cityClauses },
          cityTargetCondition,
        ];
      }
    } else if (role === "country_admin" || (country && country !== "all" && role !== "owner" && role !== "user")) {
      // Country Admin: sees notifications for their country jurisdiction (including all cities in it) + global
      const countryFilter = country && country !== "all" ? country : undefined;
      const countryClauses: any[] = [];

      if (countryFilter) {
        const countryRegex = new RegExp(`^${countryFilter}$`, "i");
        countryClauses.push(
          { targetCountry: countryRegex },
          { "metadata.countryName": countryRegex },
          { title: new RegExp(countryFilter, "i") },
          { body: new RegExp(countryFilter, "i") }
        );
      }

      // Unassigned national / global notices
      countryClauses.push({
        target: { $in: ["global", "admin", "country_admin", "city_admin", "business"] },
        $or: [
          { targetCountry: { $exists: false } },
          { targetCountry: null },
          { targetCountry: "" },
        ],
      });

      if (userId) {
        countryClauses.push({ targetUserId: userId });
      }

      const countryTargetCondition = {
        $or: [
          { target: { $in: ["country_admin", "city_admin", "admin", "business", "global"] } },
          { targetRole: { $in: ["country_admin", "admin", "all"] } },
          { actionType: { $in: ["business_confirmation", "business_upload", "ad_campaign", "system", "review"] } },
        ],
      };

      if (countryFilter) {
        // Exclude notifications explicitly addressed to a DIFFERENT country
        const otherCountryExclude = {
          $or: [
            { targetCountry: { $exists: false } },
            { targetCountry: null },
            { targetCountry: "" },
            { targetCountry: new RegExp(`^${countryFilter}$`, "i") },
          ],
        };
        query.$and = [
          { $or: countryClauses },
          countryTargetCondition,
          otherCountryExclude,
        ];
      } else {
        query.$and = [
          { $or: countryClauses },
          countryTargetCondition,
        ];
      }
    } else if (role === "owner" || role === "user" || (!role && userId)) {
      // Business Owner / User: sees notifications for their account, their business, and municipal bulletins
      const ownerClauses: any[] = [
        ...(userId ? [{ targetUserId: userId }] : []),
        ...(businessId ? [{ targetBusinessId: businessId }] : []),
        {
          target: { $in: ["business", "user", "global"] },
          $or: [
            { targetUserId: { $exists: false } },
            { targetUserId: null },
            { targetUserId: "" },
            ...(userId ? [{ targetUserId: userId }] : []),
            ...(businessId ? [{ targetBusinessId: businessId }] : []),
          ],
        },
        {
          actionType: {
            $in: [
              "business_confirmation",
              "business_existence_confirmation",
              "business_upload",
              "ad_campaign",
              "payment",
              "subscription_due",
              "subscription_expired",
              "review",
            ],
          },
          $or: [
            { target: { $in: ["business", "user", "global"] } },
            { targetRole: { $in: ["owner", "user", "all"] } },
            ...(userId ? [{ targetUserId: userId }] : []),
            ...(businessId ? [{ targetBusinessId: businessId }] : []),
          ],
        },
      ];

      const cityFilter = city && city !== "all" ? city : undefined;
      const countryFilter = country && country !== "all" ? country : undefined;

      const geoFilters: any[] = [];
      if (cityFilter) {
        geoFilters.push({
          $or: [
            { targetCity: { $exists: false } },
            { targetCity: null },
            { targetCity: "" },
            { targetCity: new RegExp(`^${cityFilter}$`, "i") },
            { title: new RegExp(cityFilter, "i") },
            ...(userId ? [{ targetUserId: userId }] : []),
            ...(businessId ? [{ targetBusinessId: businessId }] : []),
          ],
        });
      }
      if (countryFilter) {
        geoFilters.push({
          $or: [
            { targetCountry: { $exists: false } },
            { targetCountry: null },
            { targetCountry: "" },
            { targetCountry: new RegExp(`^${countryFilter}$`, "i") },
            { title: new RegExp(countryFilter, "i") },
            ...(userId ? [{ targetUserId: userId }] : []),
            ...(businessId ? [{ targetBusinessId: businessId }] : []),
          ],
        });
      }

      if (geoFilters.length > 0) {
        query.$and = [{ $or: ownerClauses }, ...geoFilters];
      } else {
        query.$or = ownerClauses;
      }
    } else if (userId) {
      query.$or = [
        { target: { $in: ["global", "user"] }, targetUserId: { $exists: false } },
        { target: { $in: ["global", "user"] }, targetUserId: null },
        { target: { $in: ["global", "user"] }, targetUserId: "" },
        { targetUserId: userId },
      ];
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

    if (role === "super_admin") {
      const allowedTargets = [
        "global",
        "business",
        "admin",
        "super_admin",
        "country_admin",
        "city_admin",
      ];
      filtered = filtered.filter(
        (n) =>
          allowedTargets.includes(n.target) ||
          ["super_admin", "admin", "all"].includes(n.targetRole || "") ||
          n.actionType === "business_confirmation" ||
          (userId && n.targetUserId === userId)
      );
    } else if (role === "city_admin" || (city && city !== "all" && role !== "owner")) {
      const allowedTargets = ["global", "business", "admin", "city_admin"];
      filtered = filtered.filter((n) => {
        const matchesTarget =
          allowedTargets.includes(n.target) ||
          ["city_admin", "admin", "all"].includes(n.targetRole || "") ||
          ["business_confirmation", "business_upload", "ad_campaign", "system", "review"].includes(n.actionType || "");
        if (!matchesTarget) return false;
        if (city && city !== "all") {
          // If targeted to a different city, exclude
          if (n.targetCity && n.targetCity.toLowerCase() !== city.toLowerCase()) {
            return false;
          }
        }
        return true;
      });
    } else if (role === "country_admin" || (country && country !== "all" && role !== "owner")) {
      const allowedTargets = ["global", "business", "admin", "country_admin", "city_admin"];
      filtered = filtered.filter((n) => {
        const matchesTarget =
          allowedTargets.includes(n.target) ||
          ["country_admin", "admin", "all"].includes(n.targetRole || "") ||
          ["business_confirmation", "business_upload", "ad_campaign", "system", "review"].includes(n.actionType || "");
        if (!matchesTarget) return false;
        if (country && country !== "all") {
          // If targeted to a different country, exclude
          if (n.targetCountry && n.targetCountry.toLowerCase() !== country.toLowerCase()) {
            return false;
          }
        }
        return true;
      });
    } else if (role === "owner" || (!role && userId)) {
      const allowedTargets = ["global", "business", "user"];
      filtered = filtered.filter((n) => {
        const matchesTarget =
          allowedTargets.includes(n.target) ||
          (userId && n.targetUserId === userId) ||
          ["business_confirmation", "business_existence_confirmation", "business_upload", "ad_campaign", "payment", "review"].includes(n.actionType || "");
        if (!matchesTarget) return false;
        if (city && city !== "all" && n.targetCity) {
          if (n.targetCity.toLowerCase() !== city.toLowerCase()) return false;
        }
        if (country && country !== "all" && n.targetCountry) {
          if (n.targetCountry.toLowerCase() !== country.toLowerCase()) return false;
        }
        return true;
      });
    } else if (userId) {
      const allowedTargets = ["global", "user"];
      filtered = filtered.filter(
        (n) =>
          allowedTargets.includes(n.target) ||
          n.targetUserId === userId ||
          !n.targetUserId
      );
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
