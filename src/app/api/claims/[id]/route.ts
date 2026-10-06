import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClaimById, updateClaimStatus } from "@/lib/db/queries/claims";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const claim = await getClaimById(id);
    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    return NextResponse.json({ claim });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { status, rejectionReason } = body;

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  try {
    const claim = await updateClaimStatus(id, status, userId, rejectionReason);
    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    return NextResponse.json({ claim });
  } catch (error: any) {
    console.error("[API /claims/[id] PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
