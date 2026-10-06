import { NextResponse } from "next/server";
import {
  getSecurityEvents,
  createSecurityEvent,
  updateSecurityEventStatus,
  deleteSecurityEvent,
} from "@/lib/db/queries/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "20")); // 20 per page default
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const status = searchParams.get("status") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const actorRole = searchParams.get("actorRole") || undefined;
    const city = searchParams.get("city") || undefined;
    const country = searchParams.get("country") || undefined;
    const sort = (searchParams.get("sort") as "asc" | "desc") || "desc";

    const result = await getSecurityEvents({
      page,
      limit,
      search,
      severity,
      status,
      eventType,
      actorRole,
      city,
      country,
      sort,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /api/security/events GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch security events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      eventType,
      severity,
      status,
      title,
      description,
      actorId,
      actorName,
      actorEmail,
      actorRole,
      targetResource,
      ipAddress,
      city,
      country,
      device,
      browser,
      os,
      actionTaken,
      metadata,
      isFlagged,
    } = body;

    if (!title || !description || !eventType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, description, and eventType are mandatory." },
        { status: 400 }
      );
    }

    const newEvent = await createSecurityEvent({
      eventType,
      severity,
      status,
      title,
      description,
      actorId,
      actorName: actorName || "Security Operator",
      actorEmail,
      actorRole,
      targetResource,
      ipAddress: ipAddress || "127.0.0.1",
      city: city || "Addis Ababa",
      country: country || "Ethiopia",
      device,
      browser,
      os,
      actionTaken,
      metadata,
      isFlagged,
    });

    return NextResponse.json({
      success: true,
      message: "Security event registered successfully to database.",
      event: newEvent,
    });
  } catch (error: any) {
    console.error("[API /api/security/events POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register security event" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, actionTaken, resolutionNotes, resolvedBy } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required for update." },
        { status: 400 }
      );
    }

    const updated = await updateSecurityEventStatus(id, {
      status,
      actionTaken,
      resolutionNotes,
      resolvedBy,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Security event record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Security event ${id} updated to status "${status || updated.status}".`,
      event: updated,
    });
  } catch (error: any) {
    console.error("[API /api/security/events PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update security event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = await deleteSecurityEvent(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Security event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Security event deleted permanently.",
    });
  } catch (error: any) {
    console.error("[API /api/security/events DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete security event" },
      { status: 500 }
    );
  }
}
