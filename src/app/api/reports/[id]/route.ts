import { NextResponse } from "next/server";
import {
  getReportById,
  updateReportStatus,
  deleteReport,
} from "@/lib/db/queries/reports";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("[API /api/reports/[id] GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch report" },
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

    const { status, actionTaken, resolutionNotes, resolvedBy } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status field is required for update" },
        { status: 400 }
      );
    }

    const updated = await updateReportStatus(
      id,
      status,
      actionTaken,
      resolutionNotes,
      resolvedBy
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Report not found or could not be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Report status updated to '${status}'.`,
    });
  } catch (error: any) {
    console.error("[API /api/reports/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update report" },
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
    const success = await deleteReport(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report successfully deleted",
    });
  } catch (error: any) {
    console.error("[API /api/reports/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete report" },
      { status: 500 }
    );
  }
}
