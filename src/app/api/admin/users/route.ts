import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { UserRole } from "@/types/user";
import { SEED_USERS } from "@/lib/db/seed-data/users";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
  const roleFilter = searchParams.get("role") || "all";
  const searchQuery = (searchParams.get("search") || "").trim();
  const doSync = searchParams.get("sync") === "true";
  const exportMode = searchParams.get("export") === "true";
  const effectiveLimit = exportMode ? 5000 : limit;

  try {
    await connectToDatabase();

    // 1. Sync actual Clerk users into MongoDB when requested or during first load
    let clerkSyncedCount = 0;
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (clerkSecret && !clerkSecret.includes("placeholder")) {
      try {
        const client = await clerkClient();
        const clerkUsersResponse = await client.users.getUserList({
          limit: 100,
        });

        if (clerkUsersResponse.data && clerkUsersResponse.data.length > 0) {
          for (const cu of clerkUsersResponse.data) {
            const email = cu.emailAddresses?.[0]?.emailAddress?.toLowerCase();
            if (!email) continue;

            const meta = (cu.publicMetadata || {}) as any;
            const fullName =
              `${cu.firstName || ""} ${cu.lastName || ""}`.trim() ||
              email.split("@")[0];
            const role: UserRole = meta.role || "user";
            const assignedCountry = meta.assignedCountry || undefined;
            const assignedCity = meta.assignedCity || undefined;
            const phone = cu.phoneNumbers?.[0]?.phoneNumber || undefined;
            const avatarUrl = cu.imageUrl || undefined;
            const isSuspended = Boolean(cu.banned || cu.locked);

            await UserModel.findOneAndUpdate(
              { clerkId: cu.id },
              {
                $setOnInsert: {
                  id: cu.id,
                  createdAt: new Date(cu.createdAt),
                },
                $set: {
                  clerkId: cu.id,
                  name: fullName,
                  email,
                  role,
                  avatarUrl,
                  phone,
                  assignedCountry,
                  assignedCity,
                  isActive: !isSuspended,
                  updatedAt: new Date(),
                },
              },
              { upsert: true }
            );
            clerkSyncedCount++;
          }
        }
      } catch (clerkErr) {
        console.warn("[API /admin/users] Clerk sync warning:", clerkErr);
      }
    }

    const countryParam = searchParams.get("country");
    const cityParam = searchParams.get("city");
    const callerRole = searchParams.get("callerRole");

    // 2. Build MongoDB query
    const andClauses: any[] = [];

    // Role filtering
    if (callerRole === "country_admin") {
      if (roleFilter === "admins" || roleFilter === "city_admins") {
        andClauses.push({ role: "city_admin" });
      } else if (roleFilter === "customers") {
        andClauses.push({ role: "user" });
      } else if (roleFilter === "owners") {
        andClauses.push({ role: "owner" });
      } else if (roleFilter === "suspended") {
        andClauses.push({ isActive: false });
      }
    } else {
      if (roleFilter === "customers") {
        andClauses.push({ role: "user" });
      } else if (roleFilter === "owners") {
        andClauses.push({ role: "owner" });
      } else if (roleFilter === "city_admins") {
        andClauses.push({ role: "city_admin" });
      } else if (roleFilter === "admins") {
        andClauses.push({ role: { $in: ["admin", "super_admin", "country_admin", "city_admin"] } });
      } else if (roleFilter === "suspended") {
        andClauses.push({ isActive: false });
      }
    }

    // Country filtering (supports assignedCountry or country field, case-insensitive)
    if (countryParam && countryParam !== "all" && countryParam.trim()) {
      const countryRegex = new RegExp(`^${countryParam.trim()}$`, "i");
      andClauses.push({
        $or: [
          { assignedCountry: countryRegex },
          { country: countryRegex },
        ],
      });
    }

    // City filtering (supports assignedCity or city field, case-insensitive)
    if (cityParam && cityParam !== "all" && cityParam.trim()) {
      const cityRegex = new RegExp(`^${cityParam.trim()}$`, "i");
      andClauses.push({
        $or: [
          { assignedCity: cityRegex },
          { city: cityRegex },
        ],
      });
    }

    // Search query
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      andClauses.push({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { role: searchRegex },
          { phone: searchRegex },
          { assignedCountry: searchRegex },
          { country: searchRegex },
          { assignedCity: searchRegex },
          { city: searchRegex },
        ],
      });
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};

    // 3. Count documents and calculate pagination
    let total = await UserModel.countDocuments(query);
    const skip = exportMode ? 0 : (page - 1) * effectiveLimit;

    // 4. Retrieve list
    let docs = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(effectiveLimit)
      .lean();

    // If database returned 0 users and no filters applied yet (or fresh dev DB), seed with SEED_USERS
    if (total === 0 && (!countryParam || countryParam === "all") && (!cityParam || cityParam === "all") && !searchQuery) {
      let filteredSeed = [...SEED_USERS] as any[];
      if (roleFilter === "customers") filteredSeed = filteredSeed.filter((u) => u.role === "user");
      else if (roleFilter === "owners") filteredSeed = filteredSeed.filter((u) => u.role === "owner");
      else if (roleFilter === "admins") filteredSeed = filteredSeed.filter((u) => ["admin", "super_admin", "country_admin", "city_admin"].includes(u.role));
      else if (roleFilter === "city_admins") filteredSeed = filteredSeed.filter((u) => u.role === "city_admin");
      else if (roleFilter === "suspended") filteredSeed = filteredSeed.filter((u) => u.status === "suspended" || u.isActive === false);

      total = filteredSeed.length;
      docs = exportMode ? filteredSeed : filteredSeed.slice(skip, skip + effectiveLimit);
    }

    const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));

    // 5. Transform to format expected by Admin / Super Admin dashboard
    const users = docs.map((doc: any) => ({
      id: doc.id || doc.clerkId,
      clerkId: doc.clerkId,
      name: doc.name || "User",
      email: doc.email || "",
      role: doc.role || "user",
      country: doc.assignedCountry || doc.country || "Global",
      city: doc.assignedCity || doc.city || "",
      status: doc.isActive !== false && doc.status !== "suspended" ? "active" : "suspended",
      isActive: doc.isActive !== false && doc.status !== "suspended",
      avatarUrl: doc.avatarUrl,
      phone: doc.phone,
      claimedBusinessIds: doc.claimedBusinessIds ?? [],
      joinedAt: doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recently",
      createdAt: doc.createdAt,
      isClerkSynced: true,
    }));

    // Calculate role counts for filter badges
    const [allCount, customersCount, ownersCount, adminsCount, cityAdminsCount, suspendedCount] =
      await Promise.all([
        UserModel.countDocuments({}),
        UserModel.countDocuments({ role: "user" }),
        UserModel.countDocuments({ role: "owner" }),
        UserModel.countDocuments({
          role: { $in: ["admin", "super_admin", "country_admin", "city_admin"] },
        }),
        UserModel.countDocuments({ role: "city_admin" }),
        UserModel.countDocuments({ isActive: false }),
      ]);

    const finalAllCount = allCount || SEED_USERS.length;
    const finalCustomersCount = customersCount || SEED_USERS.filter((u) => u.role === "user").length;
    const finalOwnersCount = ownersCount || SEED_USERS.filter((u) => u.role === "owner").length;
    const finalAdminsCount = adminsCount || SEED_USERS.filter((u) => ["admin", "super_admin", "country_admin", "city_admin"].includes(u.role)).length;
    const finalCityAdminsCount = cityAdminsCount || SEED_USERS.filter((u) => u.role === "city_admin").length;
    const finalSuspendedCount = suspendedCount || SEED_USERS.filter((u) => u.status === "suspended" || u.isActive === false).length;

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      limit: effectiveLimit,
      totalPages,
      clerkSyncedCount,
      counts: {
        all: finalAllCount,
        customers: finalCustomersCount,
        owners: finalOwnersCount,
        admins: finalAdminsCount,
        cityAdmins: finalCityAdminsCount,
        suspended: finalSuspendedCount,
      },
    });
  } catch (error: any) {
    console.error("[API /admin/users GET Error]", error);

    // Resilient fallback to SEED_USERS with memory filtering and pagination
    const countryParam = searchParams.get("country");
    const cityParam = searchParams.get("city");
    let fallbackUsers = [...SEED_USERS] as any[];

    if (roleFilter === "customers") fallbackUsers = fallbackUsers.filter((u) => u.role === "user");
    else if (roleFilter === "owners") fallbackUsers = fallbackUsers.filter((u) => u.role === "owner");
    else if (roleFilter === "admins") fallbackUsers = fallbackUsers.filter((u) => ["admin", "super_admin", "country_admin", "city_admin"].includes(u.role));
    else if (roleFilter === "city_admins") fallbackUsers = fallbackUsers.filter((u) => u.role === "city_admin");
    else if (roleFilter === "suspended") fallbackUsers = fallbackUsers.filter((u) => u.status === "suspended" || u.isActive === false);

    if (countryParam && countryParam !== "all") {
      const c = countryParam.toLowerCase();
      fallbackUsers = fallbackUsers.filter((u) => (u.country || u.assignedCountry || "").toLowerCase() === c);
    }
    if (cityParam && cityParam !== "all") {
      const ci = cityParam.toLowerCase();
      fallbackUsers = fallbackUsers.filter((u) => (u.city || u.assignedCity || "").toLowerCase() === ci);
    }
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      fallbackUsers = fallbackUsers.filter((u) =>
        (u.name || "").toLowerCase().includes(sq) ||
        (u.email || "").toLowerCase().includes(sq) ||
        (u.phone || "").toLowerCase().includes(sq)
      );
    }

    const totalCount = fallbackUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / effectiveLimit));
    const skip = exportMode ? 0 : (page - 1) * effectiveLimit;
    const paginatedUsers = exportMode ? fallbackUsers : fallbackUsers.slice(skip, skip + effectiveLimit);

    return NextResponse.json({
      success: true,
      users: paginatedUsers.map((u) => ({
        ...u,
        country: u.country || u.assignedCountry || "Global",
        city: u.city || u.assignedCity || "",
        status: u.status || (u.isActive !== false ? "active" : "suspended"),
        isActive: u.isActive !== false && u.status !== "suspended",
        joinedAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Recently",
      })),
      total: totalCount,
      page,
      limit: effectiveLimit,
      totalPages,
      counts: {
        all: SEED_USERS.length,
        customers: SEED_USERS.filter((u) => u.role === "user").length,
        owners: SEED_USERS.filter((u) => u.role === "owner").length,
        admins: SEED_USERS.filter((u) => ["admin", "super_admin", "country_admin", "city_admin"].includes(u.role)).length,
        cityAdmins: SEED_USERS.filter((u) => u.role === "city_admin").length,
        suspended: SEED_USERS.filter((u) => u.status === "suspended" || u.isActive === false).length,
      },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, status, role, assignedCountry, assignedCity } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateFields: Record<string, any> = { updatedAt: new Date() };

    if (status !== undefined) {
      updateFields.isActive = status === "active";
    }
    if (role !== undefined) {
      updateFields.role = role;
    }
    if (assignedCountry !== undefined) {
      updateFields.assignedCountry = assignedCountry;
    }
    if (assignedCity !== undefined) {
      updateFields.assignedCity = assignedCity;
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { $or: [{ id: userId }, { clerkId: userId }] },
      { $set: updateFields },
      { new: true }
    ).lean();

    // Sync to Clerk if key configured
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (clerkSecret && !clerkSecret.includes("placeholder")) {
      try {
        const client = await clerkClient();
        const clerkId = (updatedUser as any)?.clerkId || userId;

        if (status !== undefined) {
          if (status === "suspended") {
            await client.users.banUser(clerkId);
          } else {
            await client.users.unbanUser(clerkId);
          }
        }

        if (role !== undefined || assignedCountry !== undefined || assignedCity !== undefined) {
          await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
              ...(role && { role }),
              ...(assignedCountry && { assignedCountry }),
              ...(assignedCity && { assignedCity }),
            },
          });
        }
      } catch (clerkErr) {
        console.warn("[API /admin/users PATCH] Clerk update warning:", clerkErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "User successfully updated in database and Clerk",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[API /admin/users PATCH Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
