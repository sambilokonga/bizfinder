import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateUserRole } from "@/lib/db/queries/users";
import { UserRole } from "@/types/user";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: targetClerkId } = await params;
  const body = await request.json();
  const { role } = body;

  const validRoles: UserRole[] = ["user", "owner", "admin", "super_admin"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const user = await updateUserRole(targetClerkId, role);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
