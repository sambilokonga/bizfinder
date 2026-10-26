import { createNotification } from "@/lib/db/queries/notifications";
import {
  INotification,
  NotificationActionType,
  NotificationChannel,
  NotificationPriority,
  NotificationTarget,
  NotificationType,
} from "@/types/notification";

export interface DispatchNotificationParams {
  title: string;
  body: string;
  target?: NotificationTarget;
  targetRole?:
    | "super_admin"
    | "country_admin"
    | "city_admin"
    | "admin"
    | "owner"
    | "user"
    | "all";
  targetUserId?: string;
  targetBusinessId?: string;
  targetCountry?: string;
  targetCity?: string;
  actionType: NotificationActionType;
  type?: NotificationType;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  recipientEmail?: string;
  recipientPhone?: string;
  sentBy?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface DispatchNotificationResult {
  success: boolean;
  notification?: INotification;
  channelsDelivered: NotificationChannel[];
  channelStatus: {
    in_app?: "delivered" | "failed" | "skipped";
    email?: "delivered" | "failed" | "queued" | "skipped";
    push?: "delivered" | "failed" | "queued" | "skipped";
  };
  error?: string;
}

// Sensitive action types that must NEVER be broadcast to global/all audience
const SENSITIVE_ACTION_TYPES: Set<string> = new Set([
  "payment",
  "security_alert",
  "document_required",
  "dispute_opened",
  "dispute_updated",
  "support_ticket",
]);

/**
 * Common Notification Engine supporting In-App, Email, and Push notifications
 * with strict role-based and geographic territory routing (city and country isolation).
 */
export async function dispatchNotification(
  params: DispatchNotificationParams
): Promise<DispatchNotificationResult> {
  const {
    title,
    body,
    actionType,
    target = "global",
    targetRole,
    targetUserId,
    targetBusinessId,
    targetCountry,
    targetCity,
    type = "system",
    priority = "medium",
    channels = ["in_app"],
    recipientEmail,
    recipientPhone,
    sentBy = "BizFinder Notification Center",
    link,
    metadata = {},
  } = params;

  // 1. Enforce Sensitive Data Isolation:
  // Payments, tax documents, security alerts must NEVER be broadcast publicly
  if (
    SENSITIVE_ACTION_TYPES.has(actionType) &&
    (target === "global" || targetRole === "all")
  ) {
    const errorMsg = `[Notification Engine] Security Violation: Action "${actionType}" contains private/sensitive data and cannot be dispatched to global/public audience.`;
    console.error(errorMsg);
    return {
      success: false,
      channelsDelivered: [],
      channelStatus: { in_app: "failed", email: "failed", push: "failed" },
      error: errorMsg,
    };
  }

  const effectiveChannels: NotificationChannel[] =
    channels.length > 0 ? channels : ["in_app"];

  const channelStatus: DispatchNotificationResult["channelStatus"] = {};
  const channelsDelivered: NotificationChannel[] = [];

  // 2. Channel: In-App Notification (Database persistence)
  let createdNotif: INotification | undefined;
  if (effectiveChannels.includes("in_app")) {
    try {
      const res = await createNotification({
        title,
        body,
        target,
        targetRole,
        targetUserId,
        targetBusinessId,
        targetCountry,
        targetCity,
        actionType,
        type,
        priority,
        sentBy,
        link,
        status: "delivered",
        channels: effectiveChannels,
        metadata: {
          ...metadata,
          recipientEmail: recipientEmail || undefined,
          recipientPhone: recipientPhone || undefined,
        },
      });

      if (res.success && res.notification) {
        createdNotif = res.notification;
        channelStatus.in_app = "delivered";
        channelsDelivered.push("in_app");
      } else {
        channelStatus.in_app = "failed";
      }
    } catch (err: any) {
      console.error("[Notification Engine] In-app creation error:", err);
      channelStatus.in_app = "failed";
    }
  } else {
    channelStatus.in_app = "skipped";
  }

  // 3. Channel: Email Dispatch
  if (effectiveChannels.includes("email")) {
    try {
      // Pluggable / Simulated transactional email delivery
      // Format HTML email message
      const emailRecipient =
        recipientEmail ||
        metadata.ownerEmail ||
        metadata.userEmail ||
        (targetRole === "city_admin" ? `cityadmin.${targetCity || "main"}@bizfinder.et` : undefined) ||
        (targetRole === "country_admin" ? `countryadmin.${targetCountry || "et"}@bizfinder.et` : undefined);

      if (emailRecipient) {
        // Log transactional email delivery simulation
        console.log(
          `[Notification Engine - Email] Sent to <${emailRecipient}> | Priority: ${priority.toUpperCase()} | Subject: ${title}`
        );
        channelStatus.email = "delivered";
        channelsDelivered.push("email");
      } else {
        channelStatus.email = "skipped";
      }
    } catch (err: any) {
      console.error("[Notification Engine] Email dispatch error:", err);
      channelStatus.email = "failed";
    }
  } else {
    channelStatus.email = "skipped";
  }

  // 4. Channel: Push Notification
  if (effectiveChannels.includes("push")) {
    try {
      // Pluggable Web Push notification dispatch
      console.log(
        `[Notification Engine - Push] Dispatched push payload | Target Role: ${targetRole || target} | Title: ${title}`
      );
      channelStatus.push = "delivered";
      channelsDelivered.push("push");
    } catch (err: any) {
      console.error("[Notification Engine] Push dispatch error:", err);
      channelStatus.push = "failed";
    }
  } else {
    channelStatus.push = "skipped";
  }

  return {
    success: channelsDelivered.length > 0,
    notification: createdNotif,
    channelsDelivered,
    channelStatus,
  };
}
