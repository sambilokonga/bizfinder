import { NextResponse } from "next/server";
import {
  getTicketById,
  addTicketMessage,
  updateTicket,
  deleteTicket,
} from "@/lib/db/queries/tickets";
import { createNotification } from "@/lib/db/queries/notifications";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Support ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    console.error("[API /api/support/tickets/[id] GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Case 1: Appending a message/reply
    if (body.message && body.senderName) {
      const senderRole = body.senderRole || "admin";
      let targetNewStatus = body.newStatus || body.status;

      // When owner replies, move from waiting_on_customer to in_progress
      if (senderRole === "owner" && !targetNewStatus) {
        targetNewStatus = "in_progress";
      }

      const updated = await addTicketMessage(id, {
        senderId: body.senderId,
        senderName: body.senderName,
        senderRole,
        message: body.message,
        attachments: body.attachments,
        newStatus: targetNewStatus,
      });

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Ticket not found or could not add message" },
          { status: 404 }
        );
      }

      // Auto-dispatch real-time notification based on sender role
      try {
        if (senderRole === "admin" || senderRole === "super_admin") {
          await createNotification({
            title: `🎫 Support Reply: #${updated.id}`,
            body: `${body.senderName}: "${body.message.slice(0, 120)}${body.message.length > 120 ? "…" : ""}"`,
            target: updated.businessId ? "business" : "user",
            targetBusinessId: updated.businessId,
            targetUserId: updated.userId,
            type: "system",
            priority: updated.priority === "critical" ? "critical" : "high",
            sentBy: body.senderName || "Support Desk",
            link: `/dashboard?tab=support`,
          });
        } else if (senderRole === "owner") {
          await createNotification({
            title: `🎫 Owner Response: #${updated.id}`,
            body: `${body.senderName} (${updated.businessName || "Merchant"}): "${body.message.slice(0, 120)}${body.message.length > 120 ? "…" : ""}"`,
            target: "admin",
            type: "system",
            priority: updated.priority === "critical" ? "critical" : "medium",
            sentBy: body.senderName || "Business Owner",
            link: `/admin`,
          });
        }
      } catch (notifErr) {
        console.warn("[Tickets API] Failed to dispatch reply notification:", notifErr);
      }

      return NextResponse.json({
        success: true,
        ticket: updated,
        message: "Reply appended to ticket thread.",
      });
    }

    // Case 2: Updating ticket fields (status, priority, assignedAdmin)
    const updated = await updateTicket(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Ticket not found or update failed" },
        { status: 404 }
      );
    }

    // Auto-dispatch notification on status resolution or close
    if (body.status === "resolved" || body.status === "closed") {
      try {
        await createNotification({
          title: `🎫 Ticket #${updated.id} ${body.status === "resolved" ? "Resolved" : "Closed"}`,
          body: `Support Ticket #${updated.id} ("${updated.subject}") has been marked as ${body.status.replace(/_/g, " ")}.`,
          target: updated.businessId ? "business" : "user",
          targetBusinessId: updated.businessId,
          targetUserId: updated.userId,
          type: "system",
          priority: "medium",
          sentBy: "Support Desk",
          link: `/dashboard?tab=support`,
        });
      } catch (notifErr) {
        console.warn("[Tickets API] Failed to dispatch resolution notification:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: "Ticket updated successfully.",
    });
  } catch (error: any) {
    console.error("[API /api/support/tickets/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteTicket(id);

    return NextResponse.json({
      success,
      message: `Ticket ${id} deleted successfully.`,
    });
  } catch (error: any) {
    console.error("[API /api/support/tickets/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
