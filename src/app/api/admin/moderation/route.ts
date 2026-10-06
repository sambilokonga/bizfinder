import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReports, updateReportStatus } from "@/lib/db/queries/reports";
import {
  getFlaggedReviews,
  unflagReview,
  deleteReview,
} from "@/lib/db/queries/reviews";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "5");
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getReports({
      page,
      limit,
      type,
      status,
      search,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /admin/moderation GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reportId, reviewId, action, resolutionNotes, adminName } = body;

    // Handle report action if reportId is passed
    if (reportId) {
      if (action === "dismiss") {
        const updated = await updateReportStatus(
          reportId,
          "dismissed",
          "dismissed",
          resolutionNotes || "Dismissed by admin",
          adminName || "Admin"
        );
        return NextResponse.json({ success: true, report: updated });
      }

      if (action === "resolve") {
        const updated = await updateReportStatus(
          reportId,
          "resolved",
          "penalty_applied",
          resolutionNotes || "Resolved and penalty applied",
          adminName || "Admin"
        );
        return NextResponse.json({ success: true, report: updated });
      }

      if (action === "investigate") {
        const updated = await updateReportStatus(
          reportId,
          "investigating",
          "none",
          resolutionNotes || "Investigation underway",
          adminName || "Admin"
        );
        return NextResponse.json({ success: true, report: updated });
      }
    }

    // Legacy review moderation fallback
    if (reviewId && action) {
      if (action === "dismiss") {
        const review = await unflagReview(reviewId);
        return NextResponse.json({ success: true, review });
      }

      if (action === "delete") {
        await deleteReview(reviewId);
        return NextResponse.json({ success: true, deleted: true });
      }
    }

    return NextResponse.json(
      { error: "Invalid action or parameters." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API /admin/moderation PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
