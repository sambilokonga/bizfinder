import { clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";

export interface ClerkGeoAdminPayload {
  email: string;
  name: string;
  role: "super_admin" | "country_admin" | "city_admin" | "admin";
  assignedCountry?: string;
  assignedCity?: string;
  permissions?: string[];
  password?: string;
}

export interface ClerkSyncResult {
  success: boolean;
  clerkUserId?: string;
  action: "created" | "updated" | "skipped";
  publicMetadata?: Record<string, any>;
  error?: string;
}

/**
 * Synchronize an individual Territory Admin (Country Lead or City Admin) to the Clerk Dashboard
 * by setting their `publicMetadata` in Clerk.
 */
export async function syncAdminToClerk(
  payload: ClerkGeoAdminPayload
): Promise<ClerkSyncResult> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || secretKey.includes("placeholder")) {
    return {
      success: false,
      action: "skipped",
      error: "Clerk Secret Key is not configured in .env.local",
    };
  }

  try {
    const client = await clerkClient();
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();
    const cleanCountry = payload.assignedCountry ? payload.assignedCountry.trim() : undefined;
    const cleanCity = payload.assignedCity ? payload.assignedCity.trim() : undefined;
    const flag = cleanCountry ? "🌍" : "";

    // Compute standard permissions if not supplied
    let permissions = payload.permissions || [];
    if (permissions.length === 0) {
      if (payload.role === "super_admin") {
        permissions = ["all", "country_admin.manage", "city_admin.manage", "platform.manage"];
      } else if (payload.role === "country_admin") {
        permissions = ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"];
      } else {
        permissions = ["business.approve", "business.verify", "review.moderate"];
      }
    }

    const publicMetadata = {
      role: payload.role,
      assignedCountry: cleanCountry,
      assignedCity: cleanCity,
      countryFlag: flag,
      jurisdiction:
        payload.role === "super_admin"
          ? "Worldwide Global Super Admin"
          : payload.role === "country_admin"
          ? `National Lead — ${cleanCountry}`
          : `City Admin — ${cleanCity}, ${cleanCountry}`,
      permissions,
      syncedAt: new Date().toISOString(),
      app: "BizFinder",
    };

    // 1. Search for user in Clerk by email
    const searchResponse = await client.users.getUserList({
      emailAddress: [cleanEmail],
    });

    if (searchResponse.data && searchResponse.data.length > 0) {
      const existingUser = searchResponse.data[0];
      await client.users.updateUserMetadata(existingUser.id, {
        publicMetadata,
      });

      return {
        success: true,
        clerkUserId: existingUser.id,
        action: "updated",
        publicMetadata,
      };
    }

    // 2. If user does not exist in Clerk yet, create them with publicMetadata
    const nameParts = cleanName.split(" ");
    const firstName = nameParts[0] || cleanName;
    const lastName = nameParts.slice(1).join(" ") || undefined;

    const newUser = await client.users.createUser({
      emailAddress: [cleanEmail],
      firstName,
      lastName,
      password: payload.password?.trim() || undefined,
      skipPasswordRequirement: !payload.password?.trim(),
      publicMetadata,
    });

    return {
      success: true,
      clerkUserId: newUser.id,
      action: "created",
      publicMetadata,
    };
  } catch (error: any) {
    console.error("[Clerk Admin Sync Error]", error);
    return {
      success: false,
      action: "skipped",
      error: error.message || "Failed to synchronize user to Clerk.",
    };
  }
}

/**
 * Read user metadata from Clerk Dashboard and update local MongoDB user record
 */
export async function syncClerkUserToMongoDB(clerkUserId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    if (!user) return null;

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    if (!email) return null;

    const meta = (user.publicMetadata || {}) as any;
    const role = meta.role || "user";
    const assignedCountry = meta.assignedCountry || undefined;
    const assignedCity = meta.assignedCity || undefined;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || email.split("@")[0];

    await connectToDatabase();
    const updated = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          clerkId: user.id,
          id: user.id,
          name,
          email,
          role,
          assignedCountry,
          assignedCity,
          isActive: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return updated;
  } catch (error) {
    console.error("[Clerk to MongoDB Sync Error]", error);
    return null;
  }
}
