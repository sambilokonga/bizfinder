import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getUserByClerkId,
  updateUserPreferences,
  updateNotificationSettings,
  upsertUser,
} from "@/lib/db/queries/users";
import { normalizeRole } from "@/lib/auth/roles";

import { getPermissions } from "@/lib/auth/permissions";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clerkUser = await currentUser();
    const existingDbUser = await getUserByClerkId(userId);

    const rawRole =
      (clerkUser?.publicMetadata as any)?.role ||
      (clerkUser?.publicMetadata as any)?.roles ||
      (clerkUser?.publicMetadata as any)?.business_role ||
      (clerkUser?.publicMetadata as any)?.userRole ||
      (clerkUser?.unsafeMetadata as any)?.role ||
      (clerkUser?.unsafeMetadata as any)?.roles ||
      (clerkUser?.privateMetadata as any)?.role ||
      (clerkUser as any)?.organizationMemberships?.[0]?.role ||
      existingDbUser?.role;

    const role = normalizeRole(rawRole);

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || existingDbUser?.email || "";
    const name =
      `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() ||
      clerkUser?.username ||
      existingDbUser?.name ||
      email ||
      "User";
    const avatarUrl = clerkUser?.imageUrl || existingDbUser?.avatarUrl;
    const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber || existingDbUser?.phone;

    // Always keep MongoDB synced with the authoritative Clerk profile and role
    const user = await upsertUser({
      clerkId: userId,
      email,
      name,
      role,
      avatarUrl,
      phone,
    });

    const res = NextResponse.json({
      user,
      role,
      permissions: getPermissions(role),
    });

    // Set cookie so middleware and server components can read immediately without JWT delays
    res.cookies.set("bizfinder_role", role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return res;
  } catch (error: any) {
    console.error("[API /users/me GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { preferences, notificationSettings } = body;

    if (preferences) {
      await updateUserPreferences(userId, preferences);
    }
    if (notificationSettings) {
      await updateNotificationSettings(userId, notificationSettings);
    }

    const user = await getUserByClerkId(userId);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("[API /users/me PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
