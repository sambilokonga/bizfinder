import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClaim, getClaimsByBusiness } from "@/lib/db/queries/claims";
import { getBusinessById } from "@/lib/db/queries/businesses";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: businessId } = await params;

  try {
    const claims = await getClaimsByBusiness(businessId);
    return NextResponse.json({ claims });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: businessId } = await params;

  try {
    const clerkUser = await currentUser();
    const body = await request.json();
    const { businessRole, userPhone, proofDocumentUrl, notes } = body;

    if (!businessRole || !userPhone) {
      return NextResponse.json(
        { error: "businessRole and userPhone are required" },
        { status: 400 }
      );
    }

    const business = await getBusinessById(businessId);
    const businessName = business?.name || body.businessName || "Unknown Business";

    const claim = await createClaim({
      id: `CLM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      businessId,
      businessName,
      userId,
      userEmail: clerkUser?.emailAddresses[0]?.emailAddress || "",
      userName: clerkUser?.fullName || "Unknown",
      userPhone,
      businessRole,
      proofDocumentUrl,
      notes,
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error: any) {
    console.error("[API /businesses/[id]/claim POST]", error);
    return NextResponse.json({ error: error.message || "Failed to submit claim" }, { status: 500 });
  }
}
