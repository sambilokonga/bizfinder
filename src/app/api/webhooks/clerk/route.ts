import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { upsertUser, updateUserStatus } from "@/lib/db/queries/users";
import { normalizeRole } from "@/lib/auth/roles";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.type;
    const data = payload.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";
      const name =
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        data.username ||
        email ||
        "User";
      const avatarUrl = data.image_url;
      const phone = data.phone_numbers?.[0]?.phone_number;

      // Extract role from public_metadata, unsafe_metadata, or private_metadata
      const rawRole =
        data.public_metadata?.role ||
        data.public_metadata?.roles ||
        data.public_metadata?.business_role ||
        data.public_metadata?.userRole ||
        data.unsafe_metadata?.role ||
        data.unsafe_metadata?.roles ||
        data.private_metadata?.role;
      const role = normalizeRole(rawRole);

      await upsertUser({
        clerkId,
        email,
        name,
        role,
        avatarUrl,
        phone,
      });

      return NextResponse.json({ success: true, event: eventType, role });
    }

    if (eventType === "user.deleted") {
      const clerkId = data.id;
      if (clerkId) {
        await updateUserStatus(clerkId, false);
      }
      return NextResponse.json({ success: true, event: eventType });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Clerk Webhook Error]", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}
