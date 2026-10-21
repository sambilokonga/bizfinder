import { NextResponse } from "next/server";
import { getTickets, createTicket } from "@/lib/db/queries/tickets";
import { createNotification } from "@/lib/db/queries/notifications";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const businessId = searchParams.get("businessId") || undefined;
    const assignedAdmin = searchParams.get("assignedAdmin") || undefined;
    const city = searchParams.get("city") || undefined;
    const country = searchParams.get("country") || undefined;
    const sort = (searchParams.get("sort") as "desc" | "asc") || "desc";

    const result = await getTickets({
      page,
      limit,
      search,
      category,
      status,
      priority,
      userId,
      businessId,
      assignedAdmin,
      city,
      country,
      sort,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/support/tickets GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.subject || !body.initialMessage || !body.userId || !body.userName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: subject, initialMessage, userId, userName",
        },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      id: body.id,
      subject: body.subject,
      category: body.category || "general",
      priority: body.priority || "medium",
      status: body.status || "open",
      userId: body.userId,
      userName: body.userName,
      userEmail: body.userEmail || "user@bizfinder.et",
      userPhone: body.userPhone,
      userRole: body.userRole || "owner",
      businessId: body.businessId,
      businessName: body.businessName,
      assignedAdmin: body.assignedAdmin || "Unassigned",
      assignedAdminId: body.assignedAdminId,
      tags: body.tags || [],
      initialMessage: body.initialMessage,
      city: body.city,
      country: body.country,
    });

    // Auto-create notification for the ticket creator and municipal/country queue
    try {
      await createNotification({
        title: `🎫 Ticket Opened: ${ticket.subject}`,
        body: `Support ticket #${ticket.id} (${ticket.category}) opened for ${ticket.businessName || ticket.userName} in ${ticket.city || "global"}, ${ticket.country || "network"}.`,
        target: ticket.businessId ? "business" : "user",
        targetBusinessId: ticket.businessId,
        targetUserId: ticket.userId,
        targetCity: ticket.city,
        targetCountry: ticket.country,
        type: "system",
        priority: (ticket.priority === "critical" as any) ? "critical" : "medium",
        sentBy: "Support Desk",
        link: `/dashboard?tab=support`,
      });
    } catch (notifErr) {
      console.warn("[Tickets] Failed to dispatch ticket notification:", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: ticket,
        message: "Support ticket registered successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /api/support/tickets POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
