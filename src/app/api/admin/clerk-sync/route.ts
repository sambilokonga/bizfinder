import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { syncAdminToClerk, ClerkGeoAdminPayload } from "@/lib/auth/clerk-sync";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { ETHIOPIA_30_CITY_ADMINS } from "@/lib/data/cbe-branches-generator";

export async function GET() {
  try {
    const isConfigured =
      !!process.env.CLERK_SECRET_KEY &&
      !process.env.CLERK_SECRET_KEY.includes("placeholder");

    if (!isConfigured) {
      return NextResponse.json({
        connected: false,
        message: "Clerk Secret Key is not configured in .env.local",
      });
    }

    const client = await clerkClient();
    const userList = await client.users.getUserList({ limit: 50 });

    const syncedAdmins = userList.data.map((u) => {
      const meta = (u.publicMetadata || {}) as any;
      return {
        id: u.id,
        email: u.emailAddresses?.[0]?.emailAddress || "",
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        role: meta.role || "user",
        assignedCountry: meta.assignedCountry || null,
        assignedCity: meta.assignedCity || null,
        jurisdiction: meta.jurisdiction || null,
        permissions: meta.permissions || [],
        createdAt: new Date(u.createdAt).toISOString(),
      };
    });

    return NextResponse.json({
      connected: true,
      publishableKeyPresent: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      totalClerkUsers: userList.totalCount || userList.data.length,
      syncedAdmins,
    });
  } catch (error: any) {
    console.error("[Clerk Sync Status GET Error]", error);
    return NextResponse.json({
      connected: false,
      error: error.message || "Failed to query Clerk API.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, admin, bulkAdmins } = body;

    // 1. Single Admin Sync
    if (action === "sync_single" && admin) {
      const result = await syncAdminToClerk(admin);
      return NextResponse.json(result);
    }

    // 2. Bulk Sync All Ethiopia Country & City Admins
    if (action === "sync_ethiopia_all") {
      const results = [];

      // Ethiopia Country Main Admin
      const ethiopiaCountryAdmin: ClerkGeoAdminPayload = {
        email: "ethiopia.lead@bizfinder.et",
        name: "Marcus Holloway (Ethiopia National Lead)",
        role: "country_admin",
        assignedCountry: "Ethiopia",
        permissions: ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"],
      };

      const hqRes = await syncAdminToClerk(ethiopiaCountryAdmin);
      results.push({ email: ethiopiaCountryAdmin.email, result: hqRes });

      // All 30 Ethiopian City Admins
      for (const cityAdm of ETHIOPIA_30_CITY_ADMINS) {
        const payload: ClerkGeoAdminPayload = {
          email: cityAdm.email,
          name: cityAdm.name,
          role: "city_admin",
          assignedCountry: "Ethiopia",
          assignedCity: cityAdm.city,
          permissions: ["business.approve", "business.verify", "review.moderate"],
        };
        const res = await syncAdminToClerk(payload);
        results.push({ email: cityAdm.email, city: cityAdm.city, result: res });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized Ethiopia Country Main Admin and all 30 City Admins into your Clerk Dashboard!`,
        totalProcessed: results.length,
        results,
      });
    }

    // 3. Sync from list provided in body
    if (action === "sync_custom_list" && Array.isArray(bulkAdmins)) {
      const results = [];
      for (const item of bulkAdmins) {
        const res = await syncAdminToClerk(item);
        results.push({ email: item.email, result: res });
      }
      return NextResponse.json({
        success: true,
        totalProcessed: results.length,
        results,
      });
    }

    return NextResponse.json(
      { error: "Invalid sync action specified." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Clerk Sync POST Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute Clerk synchronization." },
      { status: 500 }
    );
  }
}
