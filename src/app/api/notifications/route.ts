import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  clearReadNotifications,
  deleteNotification,
} from "@/lib/db/queries/notifications";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieRole = cookieHeader.match(/bizfinder_role=([^;]+)/)?.[1];

    let userId: string | null = searchParams.get("userId") || null;
    let role = searchParams.get("role") || cookieRole || "owner";

    try {
      const authObj = await auth();
      if (authObj?.userId) {
        userId = authObj.userId;
        const dbUser = await getUserByClerkId(userId);
        if (dbUser?.role) role = dbUser.role;
      }
    } catch {
      // no auth session
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const target = searchParams.get("target") || undefined;
    const type = searchParams.get("type") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const readStatus = (searchParams.get("readStatus") as "all" | "unread" | "read") || undefined;
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;
    const actionType = searchParams.get("actionType") || undefined;

    const result = await getNotifications({
      page,
      limit,
      search,
      target,
      type,
      priority,
      status: searchParams.get("status") || undefined,
      readStatus,
      userId: userId || undefined,
      role,
      country,
      city,
      actionType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching user notifications:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    let role = "owner";
    let senderName = "Business Owner";

    try {
      const authObj = await auth();
      userId = authObj?.userId || null;
      if (userId) {
        const dbUser = await getUserByClerkId(userId);
        if (dbUser?.role) role = dbUser.role;
        senderName = dbUser?.name || "Business Owner";
      }
    } catch {
      // no auth session
    }

    const body = await req.json();
    const {
      title,
      message,
      body: notifBody,
      target = "business",
      targetBusinessId,
      targetRole,
      targetCountry,
      targetCity,
      actionType,
      metadata,
      sentBy,
      type = "system",
      priority = "medium",
      link,
    } = body;

    const contentBody = notifBody || message;
    if (!title || !title.trim() || !contentBody || !contentBody.trim()) {
      return NextResponse.json(
        { error: "Title and message body are required." },
        { status: 400 }
      );
    }

    const finalSender = sentBy || senderName || "Platform System";

    const result = await createNotification({
      title: title.trim(),
      body: contentBody.trim(),
      target,
      targetUserId: target === "user" ? (userId || undefined) : undefined,
      targetBusinessId,
      targetRole,
      targetCountry,
      targetCity,
      actionType,
      metadata,
      sentBy: finalSender,
      type,
      priority,
      link: link ? link.trim() : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user notification:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create notification." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    let userId: string | null = null;
    try {
      const authObj = await auth();
      userId = authObj?.userId || null;
    } catch {}

    const body = await req.json();
    const { action, notificationId } = body;

    // Use placeholder fallback if offline/no auth in dev
    const effectiveUserId = userId || "anonymous-user";

    if (action === "markRead" && notificationId) {
      await markNotificationRead(notificationId, effectiveUserId);
      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    if (action === "markUnread" && notificationId) {
      await markNotificationUnread(notificationId, effectiveUserId);
      return NextResponse.json({ success: true, message: "Marked as unread" });
    }

    if (action === "markAllRead") {
      let role = "owner";
      if (userId) {
        const dbUser = await getUserByClerkId(userId);
        if (dbUser?.role) role = dbUser.role;
      }
      await markAllNotificationsRead(effectiveUserId, role);
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (action === "clearAllRead") {
      let role = "owner";
      if (userId) {
        const dbUser = await getUserByClerkId(userId);
        if (dbUser?.role) role = dbUser.role;
      }
      const count = await clearReadNotifications(effectiveUserId, role);
      return NextResponse.json({ success: true, clearedCount: count, message: "Cleared read notifications" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating notification read status:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await deleteNotification(id);
    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
