import { NextResponse } from "next/server";
import {
  getNotifications,
  createNotification,
  deleteNotification,
} from "@/lib/db/queries/notifications";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const target = searchParams.get("target") || undefined;
    const type = searchParams.get("type") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await getNotifications({
      page,
      limit,
      search,
      target,
      type,
      priority,
      status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      body: notifBody,
      target = "global",
      targetUserId,
      targetBusinessId,
      sentBy = "Super Admin",
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

    const result = await createNotification({
      title: title.trim(),
      body: contentBody.trim(),
      target,
      targetUserId: targetUserId || undefined,
      targetBusinessId: targetBusinessId || undefined,
      sentBy,
      type,
      priority,
      link: link ? link.trim() : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification in DB:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create notification." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing notification id" },
        { status: 400 }
      );
    }

    await deleteNotification(id);

    return NextResponse.json({
      success: true,
      message: "Notification deleted permanently.",
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete notification." },
      { status: 500 }
    );
  }
}
