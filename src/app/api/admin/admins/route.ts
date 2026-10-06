import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { upsertUser, getAllUsers } from "@/lib/db/queries/users";
import { UserModel } from "@/lib/db/models/User";
import { connectToDatabase } from "@/lib/db/mongodb";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin" | "country_admin" | "city_admin";
  status: "active" | "suspended" | "pending";
  assignedCountry?: string;
  assignedCity?: string;
  departments: string[];
  permissions: string[];
  createdAt: string;
  lastLogin: string;
  actionsCount: number;
}

// In-memory / seed admin data that synchronizes with DB
let ADMIN_ROSTER: AdminAccount[] = [
  {
    id: "adm-1",
    name: "Alex Rivera",
    email: "superadmin@bizfinder.et",
    role: "super_admin",
    status: "active",
    departments: ["Executive", "System Administration", "Security"],
    permissions: [
      "all",
      "admin.create",
      "admin.update",
      "admin.delete",
      "role.manage",
      "permission.manage",
      "system.settings.manage",
      "audit_log.manage",
    ],
    createdAt: "2024-01-10",
    lastLogin: "Just now",
    actionsCount: 1420,
  },
  {
    id: "adm-2",
    name: "Elena Vance",
    email: "elena.vance@bizfinder.et",
    role: "admin",
    status: "active",
    departments: ["Business Operations", "Content Moderation"],
    permissions: [
      "business.read",
      "business.update_any",
      "business.verify",
      "business.approve",
      "business.reject",
      "review.moderate",
      "review.delete_any",
      "category.manage",
    ],
    createdAt: "2024-02-15",
    lastLogin: "2 hours ago",
    actionsCount: 684,
  },
  {
    id: "adm-3",
    name: "Marcus Holloway",
    email: "marcus.h@bizfinder.et",
    role: "admin",
    status: "active",
    departments: ["Business Verification", "Reports & Compliance"],
    permissions: [
      "business.verify",
      "business.approve",
      "business.reject",
      "report.manage",
      "review.moderate",
    ],
    createdAt: "2024-03-01",
    lastLogin: "Yesterday",
    actionsCount: 412,
  },
  {
    id: "adm-4",
    name: "Sara Connor",
    email: "sara.c@bizfinder.et",
    role: "admin",
    status: "active",
    departments: ["Customer Support", "User Moderation"],
    permissions: [
      "user.read",
      "user.update",
      "user.suspend",
      "report.manage",
      "review.moderate",
    ],
    createdAt: "2024-04-12",
    lastLogin: "3 days ago",
    actionsCount: 235,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    const dbAdmins = await UserModel.find({
      role: { $in: ["admin", "super_admin", "country_admin", "city_admin"] },
    }).lean();

    const existingEmails = new Set(ADMIN_ROSTER.map((a) => a.email.toLowerCase()));

    const fromDb: AdminAccount[] = dbAdmins
      .filter((doc) => !existingEmails.has((doc.email || "").toLowerCase()))
      .map((doc) => ({
        id: doc.clerkId || doc.id || `adm-${doc._id}`,
        name: doc.name || "Administrator",
        email: doc.email || "",
        role: (doc.role as any) || "admin",
        assignedCountry: doc.assignedCountry,
        assignedCity: doc.assignedCity,
        status: doc.isActive !== false ? "active" : "suspended",
        departments: ["General Administration"],
        permissions: ["business.read", "business.verify", "review.moderate"],
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        lastLogin: "Recently",
        actionsCount: 0,
      }));

    const merged = [...ADMIN_ROSTER, ...fromDb];
    return NextResponse.json({ admins: merged });
  } catch (error: any) {
    return NextResponse.json({ admins: ADMIN_ROSTER });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, assignedCountry, assignedCity, password, departments, permissions } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanRole = role || "admin";
    const cleanCountry = assignedCountry ? assignedCountry.trim() : undefined;
    const cleanCity = assignedCity ? assignedCity.trim() : undefined;
    const cleanDepartments = departments && departments.length > 0 ? departments : ["General Administration"];
    const cleanPermissions =
      permissions && permissions.length > 0
        ? permissions
        : ["business.read", "business.verify", "review.moderate"];

    // 1. Sync with Clerk Dashboard (Create or update Clerk user)
    let clerkUserId: string | null = null;
    let clerkSyncStatus: "created" | "updated" | "invited" | "skipped" = "skipped";
    let clerkError: string | null = null;

    try {
      if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder")) {
        const client = await clerkClient();
        const nameParts = cleanName.split(" ");
        const firstName = nameParts[0] || cleanName;
        const lastName = nameParts.slice(1).join(" ") || undefined;

        // Check if user exists in Clerk
        const existingUsers = await client.users.getUserList({
          emailAddress: [cleanEmail],
        });

        if (existingUsers.data && existingUsers.data.length > 0) {
          const existing = existingUsers.data[0];
          clerkUserId = existing.id;
          await client.users.updateUserMetadata(existing.id, {
            publicMetadata: {
              role: cleanRole,
              permissions: cleanPermissions,
              departments: cleanDepartments,
            },
          });
          clerkSyncStatus = "updated";
        } else {
          // Attempt to create user in Clerk
          try {
            const newClerkUser = await client.users.createUser({
              emailAddress: [cleanEmail],
              firstName,
              lastName,
              password: password?.trim() || undefined,
              skipPasswordRequirement: !password?.trim(),
              publicMetadata: {
                role: cleanRole,
                permissions: cleanPermissions,
                departments: cleanDepartments,
              },
            });
            clerkUserId = newClerkUser.id;
            clerkSyncStatus = "created";
          } catch (createErr: any) {
            console.warn("[Clerk Create User Fallback to Invitation]", createErr?.message);
            try {
              await client.invitations.createInvitation({
                emailAddress: cleanEmail,
                publicMetadata: {
                  role: cleanRole,
                  permissions: cleanPermissions,
                  departments: cleanDepartments,
                },
                ignoreExisting: true,
              });
              clerkSyncStatus = "invited";
            } catch (invErr: any) {
              clerkError = invErr?.message || "Could not invite in Clerk";
            }
          }
        }
      }
    } catch (clerkErr: any) {
      console.warn("[Clerk Sync Notice]", clerkErr?.message);
      clerkError = clerkErr?.message;
    }

    const effectiveId = clerkUserId || `adm-${Date.now()}`;

    // 2. Persist to MongoDB Users collection
    try {
      await upsertUser({
        clerkId: effectiveId,
        email: cleanEmail,
        name: cleanName,
        role: cleanRole,
      });
    } catch (dbErr: any) {
      console.warn("[MongoDB Admin Upsert Notice]", dbErr?.message);
    }

    // 3. Update in-memory roster
    const newAdmin: AdminAccount = {
      id: effectiveId,
      name: cleanName,
      email: cleanEmail,
      role: cleanRole,
      status: "active",
      departments: cleanDepartments,
      permissions: cleanPermissions,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "Just now",
      actionsCount: 0,
    };

    // Remove existing if duplicate email in memory
    ADMIN_ROSTER = [newAdmin, ...ADMIN_ROSTER.filter((a) => a.email.toLowerCase() !== cleanEmail)];

    return NextResponse.json({
      success: true,
      admin: newAdmin,
      clerkSynced: clerkSyncStatus !== "skipped",
      clerkStatus: clerkSyncStatus,
      clerkError,
    });
  } catch (error: any) {
    console.error("[Admin API POST Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create administrator" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, permissions, departments, role } = body;

    const target = ADMIN_ROSTER.find((a) => a.id === id);
    if (!target) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (status) target.status = status;
    if (permissions) target.permissions = permissions;
    if (departments) target.departments = departments;
    if (role) target.role = role;

    // Sync status change to MongoDB
    if (status) {
      try {
        await connectToDatabase();
        await UserModel.findOneAndUpdate(
          { $or: [{ id }, { clerkId: id }] },
          { $set: { isActive: status === "active", role: target.role } }
        );
      } catch (e) {}
    }

    return NextResponse.json({ success: true, admin: target });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    ADMIN_ROSTER = ADMIN_ROSTER.filter((a) => a.id !== id);

    try {
      await connectToDatabase();
      await UserModel.findOneAndDelete({ $or: [{ id }, { clerkId: id }] });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

