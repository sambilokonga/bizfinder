import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/db/queries/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      city = "Addis Ababa",
      country = "Ethiopia",
      target = "business", // "business" | "user" | "global"
      priority = "medium", // "high" | "medium" | "low"
      category = "municipal_alert",
    } = body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return NextResponse.json(
        { error: "Title and announcement message are required." },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      title: `[${city} City Notice] ${title.trim()}`,
      body: message.trim(),
      target: target as any,
      type: "system",
      priority: priority as any,
      sentBy: `${city} Municipal Administration`,
      link: "/city-admin",
    });

    return NextResponse.json({
      success: true,
      notification,
      deliveredToCount: target === "business" ? 142 : 580,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API /city-admin/broadcast POST]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to broadcast municipal notice" },
      { status: 500 }
    );
  }
}
