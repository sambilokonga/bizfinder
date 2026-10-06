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
    | "review";
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

    // Role-based target filtering
    if (role === "super_admin") {
      // Super Admin sees all system and confirmation alerts worldwide
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
        { actionType: "business_confirmation" },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];
    } else if (role === "country_admin") {
      // Country Admin sees country, city (in country), admin and global
      const allowedTargets = ["global", "business", "admin", "country_admin", "city_admin"];
      const countryMatches: any[] = [
        { target: { $in: allowedTargets }, targetCountry: { $exists: false } },
        { target: { $in: allowedTargets }, targetCountry: null },
        { target: { $in: allowedTargets }, targetCountry: "" },
      ];
      if (country) {
        countryMatches.push({ targetCountry: new RegExp(`^${country}$`, "i") });
      } else {
        countryMatches.push({ target: { $in: allowedTargets } });
      }
      query.$or = [
        ...countryMatches,
        { targetRole: { $in: ["country_admin", "admin", "all"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];
    } else if (role === "city_admin") {
      // City Admin sees municipal alerts, admin and global
      const allowedTargets = ["global", "business", "admin", "city_admin"];
      const cityMatches: any[] = [
        { target: { $in: allowedTargets }, targetCity: { $exists: false } },
        { target: { $in: allowedTargets }, targetCity: null },
        { target: { $in: allowedTargets }, targetCity: "" },
      ];
      if (city) {
        cityMatches.push({ targetCity: new RegExp(`^${city}$`, "i") });
      } else {
        cityMatches.push({ target: { $in: allowedTargets } });
      }
      query.$or = [
        ...cityMatches,
        { targetRole: { $in: ["city_admin", "admin", "all"] } },
        ...(userId ? [{ targetUserId: userId }] : []),
      ];
    } else if (userId) {
      const allowedTargets = ["global", "user"];
      if (role && ["owner", "admin"].includes(role)) {
        allowedTargets.push("business");
      }
      if (role && ["admin"].includes(role)) {
        allowedTargets.push("admin", "super_admin", "country_admin", "city_admin");
      }

      query.$or = [
        { target: { $in: allowedTargets }, targetUserId: { $exists: false } },
        { target: { $in: allowedTargets }, targetUserId: null },
        { target: { $in: allowedTargets }, targetUserId: "" },
        { targetUserId: userId },
      ];
    } else if (target && target !== "all") {
      query.target = target;
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
    } else if (role === "country_admin") {
      const allowedTargets = ["global", "business", "admin", "country_admin", "city_admin"];
      filtered = filtered.filter((n) => {
        const matchesTarget =
          allowedTargets.includes(n.target) ||
          ["country_admin", "admin", "all"].includes(n.targetRole || "");
        if (!matchesTarget) return false;
        if (country && n.targetCountry) {
          return n.targetCountry.toLowerCase() === country.toLowerCase();
        }
        return true;
      });
    } else if (role === "city_admin") {
      const allowedTargets = ["global", "business", "admin", "city_admin"];
      filtered = filtered.filter((n) => {
        const matchesTarget =
          allowedTargets.includes(n.target) ||
          ["city_admin", "admin", "all"].includes(n.targetRole || "");
        if (!matchesTarget) return false;
        if (city && n.targetCity) {
          return n.targetCity.toLowerCase() === city.toLowerCase();
        }
        return true;
      });
    } else if (userId) {
      const allowedTargets = ["global", "user"];
      if (role && ["owner", "admin"].includes(role)) {
        allowedTargets.push("business");
      }
      filtered = filtered.filter(
        (n) =>
          allowedTargets.includes(n.target) ||
          n.targetUserId === userId ||
          !n.targetUserId
      );
    } else if (target && target !== "all") {
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
    await connectToDatabase();
    await NotificationModel.create(newDoc);
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
