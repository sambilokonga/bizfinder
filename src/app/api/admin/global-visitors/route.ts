import { NextResponse } from "next/server";
import {
  getGlobalVisitorsTelemetry,
  registerGlobalVisitor,
  escalateGlobalVisitor,
  updateGlobalVisitorStatus,
} from "@/lib/analytics/globalVisitors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "20")); // 20 per page default
    const visitorType = (searchParams.get("type") || searchParams.get("visitorType")) as
      | "all"
      | "actual"
      | "future"
      | undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const continent = searchParams.get("continent") || undefined;
    const status = searchParams.get("status") || undefined;
    const escalatedOnly = searchParams.get("escalatedOnly") === "true";

    const data = await getGlobalVisitorsTelemetry({
      country,
      city,
      page,
      limit,
      visitorType,
      search,
      continent,
      status,
      escalatedOnly,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API /admin/global-visitors GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch global visitors telemetry" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      visitorType = "actual",
      visitorName,
      visitorCountry,
      visitorCountryCode,
      visitorCity,
      visitorFlag,
      visitorDevice,
      visitorIp,
      targetBusinessId,
      targetBusinessName,
      targetBusinessCity,
      targetBusinessCountry,
      action = "view",
      purpose,
      status,
      scheduledDate,
      delegationSize = 1,
      contactEmail,
      contactPhone,
      notes,
      registeredBy,
      jurisdictionLevel = "city",
      escalatedTo = "none",
      escalationNotes,
      referrer,
    } = body;

    if (!visitorCountry || !visitorCity || !targetBusinessName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: visitorCountry, visitorCity, and targetBusinessName are required.",
        },
        { status: 400 }
      );
    }

    const createdVisitor = await registerGlobalVisitor({
      visitorType,
      visitorName,
      visitorCountry,
      visitorCountryCode,
      visitorCity,
      visitorFlag,
      visitorDevice,
      visitorIp,
      targetBusinessId,
      targetBusinessName,
      targetBusinessCity,
      targetBusinessCountry,
      action,
      purpose,
      status,
      scheduledDate,
      delegationSize: Number(delegationSize) || 1,
      contactEmail,
      contactPhone,
      notes,
      registeredBy: registeredBy || "City Admin",
      jurisdictionLevel,
      escalatedTo,
      escalationNotes,
      referrer,
    });

    return NextResponse.json({
      success: true,
      data: createdVisitor,
      message: `${visitorType === "future" ? "Future Visitor Delegation" : "Actual Global Visitor"} registered successfully`,
    });
  } catch (error: any) {
    console.error("[API /admin/global-visitors POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register global visitor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, actionType, targetLevel, status, notes, adminName } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: visitorId" },
        { status: 400 }
      );
    }

    if (actionType === "escalate") {
      if (!targetLevel || (targetLevel !== "country_admin" && targetLevel !== "super_admin" && targetLevel !== "none")) {
        return NextResponse.json(
          { success: false, error: "Invalid targetLevel. Must be 'country_admin' or 'super_admin'." },
          { status: 400 }
        );
      }

      const updated = await escalateGlobalVisitor(visitorId, targetLevel, notes, adminName);
      return NextResponse.json({
        success: true,
        data: updated,
        message: `Visitor lead successfully escalated to ${targetLevel.replace("_", " ")}`,
      });
    }

    if (actionType === "update_status") {
      if (!status) {
        return NextResponse.json(
          { success: false, error: "Missing required parameter: status" },
          { status: 400 }
        );
      }

      const updated = await updateGlobalVisitorStatus(visitorId, status);
      return NextResponse.json({
        success: true,
        data: updated,
        message: `Visitor status successfully updated to '${status}'`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid actionType. Must be 'escalate' or 'update_status'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API /admin/global-visitors PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update global visitor" },
      { status: 500 }
    );
  }
}
