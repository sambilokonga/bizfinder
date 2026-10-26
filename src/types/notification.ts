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

export type NotificationStatus =
  | "pending"
  | "scheduled"
  | "processing"
  | "delivered"
  | "failed"
  | "cancelled"
  | "Delivered"
  | "Pending"
  | "Scheduled"
  | "Failed";

export type NotificationChannel = "in_app" | "email" | "push";

export type NotificationActionType =
  | "business_confirmation"
  | "business_upload"
  | "business_existence_confirmation"
  | "business_status_changed"
  | "document_required"
  | "subscription_due"
  | "subscription_expired"
  | "payment"
  | "ad_campaign"
  | "review"
  | "review_escalation"
  | "message_received"
  | "support_ticket"
  | "security_alert"
  | "dispute_opened"
  | "dispute_updated"
  | "broadcast"
  | "system"
  | "audit_due"
  | "role_changed"
  | "report_generated"
  | "listing_performance";

export interface NotificationChannelStatus {
  in_app?: "delivered" | "failed" | "skipped";
  email?: "delivered" | "failed" | "queued" | "skipped";
  push?: "delivered" | "failed" | "queued" | "skipped";
}

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
  actionType?: NotificationActionType | string;
  channels?: NotificationChannel[];
  channelStatus?: NotificationChannelStatus;
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
