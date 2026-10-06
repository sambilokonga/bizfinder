export type NotificationTarget =
  | "global"
  | "business"
  | "user"
  | "admin"
  | "super_admin"
  | "country_admin"
  | "city_admin";

export type NotificationType =
  | "system"
  | "verification"
  | "review"
  | "payment"
  | "security"
  | "promo"
  | "dispute"
  | "broadcast"
  | "message";

export type NotificationPriority = "critical" | "high" | "medium" | "low";

export type NotificationStatus = "Delivered" | "Pending" | "Scheduled" | "Failed";

export interface INotification {
  id: string;
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
  status: NotificationStatus;
  priority: NotificationPriority;
  sentBy: string;
  type: NotificationType;
  readBy: string[];
  isRead?: boolean;
  link?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  sent?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  delivered: number;
  globalCount: number;
  businessCount: number;
  userCount: number;
  criticalCount: number;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  notifications: INotification[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  unreadCount?: number;
  stats?: NotificationStats;
  message?: string;
  error?: string;
}
