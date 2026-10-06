import { NextResponse } from "next/server";
import { createNotification } from "@/lib/db/queries/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      city = "Addis Ababa",
      country = "Ethiopia",
      subject,
      reason,
      businessId,
      businessName,
      priority = "high",
    } = body;

    if (!subject || !subject.trim() || !reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Subject and escalation rationale are required." },
        { status: 400 }
      );
    }

    const ticketId = `ESC-${city.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Create system notification for Country Lead
    await createNotification({
      title: `[Escalation from ${city}] ${subject.trim()}`,
      body: `${city} City Admin escalated: ${reason.trim()} (Ticket: ${ticketId})`,
      target: "global",
      type: "system",
      priority: priority as any,
      sentBy: `${city} City Admin`,
      link: "/admin",
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: `Matter has been escalated directly to ${country} Country Main Administration.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API /city-admin/escalate POST]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to escalate to Country Lead" },
      { status: 500 }
    );
  }
}
