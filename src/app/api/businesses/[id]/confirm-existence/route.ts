import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { confirmBusinessExistence } from "@/lib/audit/four-month-engine";
import { getUserByClerkId } from "@/lib/db/queries/users";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let clerkUserId: string | null = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult?.userId ?? null;
  } catch {
    clerkUserId = null;
  }

  try {
    const body = await request.json().catch(() => ({}));
    let actorName = body.actorName || "Business Owner";
    let actorRole = body.actorRole || "owner";

    if (clerkUserId) {
      const dbUser = await getUserByClerkId(clerkUserId).catch(() => null);
      if (dbUser) {
        actorName = dbUser.name || actorName;
        actorRole = dbUser.role || actorRole;
      }
    }

    const result = await confirmBusinessExistence(id, {
      actorId: clerkUserId || body.actorId || "owner_user",
      actorName,
      actorRole,
      notes: body.notes || "Operational existence confirmed via 4-month platform verification prompt.",
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      business: result.business,
    });
  } catch (error: any) {
    console.error("[API /businesses/[id]/confirm-existence POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm business existence." },
      { status: 500 }
    );
  }
}
