import { NextResponse } from "next/server";
import { getReports, createReport } from "@/lib/db/queries/reports";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const targetId = searchParams.get("targetId") || undefined;
    const city = searchParams.get("city") || undefined;
    const country = searchParams.get("country") || undefined;
    const sort = (searchParams.get("sort") as "desc" | "asc") || "desc";

    const result = await getReports({
      page,
      limit,
      search,
      type,
      status,
      priority,
      targetId,
      city,
      country,
      sort,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/reports GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.reason || !body.targetId || !body.targetName || !body.reporterName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, reason, targetId, targetName, reporterName",
        },
        { status: 400 }
      );
    }

    const report = await createReport({
      id: body.id,
      type: body.type || "business",
      title: body.title,
      reason: body.reason,
      details: body.details,
      targetId: body.targetId,
      targetName: body.targetName,
      targetType: body.targetType || body.type,
      reporterName: body.reporterName,
      reporterEmail: body.reporterEmail,
      reporterId: body.reporterId,
      reporterRole: body.reporterRole || "user",
      priority: body.priority || "medium",
      status: body.status || "pending",
      evidenceUrls: body.evidenceUrls,
      city: body.city,
      country: body.country,
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: "Report successfully submitted to moderation desk.",
    });
  } catch (error: any) {
    console.error("[API /api/reports POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create report" },
      { status: 500 }
    );
  }
}
