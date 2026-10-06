import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getBusinessById,
  updateBusiness,
  deleteBusiness,
} from "@/lib/db/queries/businesses";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { processBusinessImagesForCloudinary } from "@/lib/cloudinary";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const business = await getBusinessById(id);
    if (!business) {
      // Fallback to seed data during development
      const seed = SEED_BUSINESSES.find((b) => b.id === id || b.slug === id);
      if (!seed) return NextResponse.json({ error: "Business not found" }, { status: 404 });
      return NextResponse.json({ business: seed });
    }
    return NextResponse.json({ business });
  } catch (error) {
    console.error("[API /businesses/[id] GET]", error);
    const seed = SEED_BUSINESSES.find((b) => b.id === id || b.slug === id);
    if (!seed) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    return NextResponse.json({ business: seed });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch (e) {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rawBody = await request.json();
    const business = await getBusinessById(id);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Authorization: only the owner or admins can update
    const cookieRole = (request as any).cookies?.get?.("bizfinder_role")?.value || "user";
    const isAdminUser = ["admin", "super_admin", "country_admin", "city_admin"].includes(cookieRole);
    if (business.ownerId && business.ownerId !== userId && !isAdminUser) {
      return NextResponse.json({ error: "Forbidden: you do not own this listing" }, { status: 403 });
    }

    // Process any base64 images through Cloudinary before saving
    const body = await processBusinessImagesForCloudinary(rawBody);

    const updated = await updateBusiness(id, body);
    return NextResponse.json({ business: updated, success: true });
  } catch (error: any) {
    console.error("[API /businesses/[id] PATCH]", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch (e) {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const business = await getBusinessById(id);
    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Authorization: only the owner or admins can delete
    const cookieRole = (_request as any).cookies?.get?.("bizfinder_role")?.value || "user";
    const isAdminUser = ["admin", "super_admin", "country_admin"].includes(cookieRole);
    if (business.ownerId && business.ownerId !== userId && !isAdminUser) {
      return NextResponse.json({ error: "Forbidden: you do not own this listing" }, { status: 403 });
    }

    await deleteBusiness(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /businesses/[id] DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
