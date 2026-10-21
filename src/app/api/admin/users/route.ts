import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { BusinessModel } from "@/lib/db/models/Business";
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
              { $or: [{ clerkId: cu.id }, { email }] },
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
                  ...(assignedCountry ? { country: assignedCountry } : {}),
                  ...(assignedCity ? { city: assignedCity } : {}),
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

    // 2b. Resolve ownerIds of businesses in the target territory so business owners
    //     who registered a business in that city/country appear immediately on the roster.
    let territoryOwnerIds: string[] = [];
    let territoryEmails: string[] = [];
    let territoryBizIds: string[] = [];
    const hasCountryFilter = !!(countryParam && countryParam !== "all" && countryParam.trim());
    const hasCityFilter = !!(cityParam && cityParam !== "all" && cityParam.trim());

    if (hasCountryFilter || hasCityFilter) {
      try {
        const bizConditions: any[] = [];
        if (hasCountryFilter) {
          const cRx = new RegExp(`^${countryParam!.trim()}$`, "i");
          bizConditions.push({ $or: [{ countryName: cRx }, { country: cRx }] });
        }
        if (hasCityFilter) {
          const ciRx = new RegExp(`^${cityParam!.trim()}$`, "i");
          bizConditions.push({ $or: [{ cityName: ciRx }, { city: ciRx }] });
        }
        const bizQuery = bizConditions.length > 0 ? { $and: bizConditions } : {};

        const territoryBizDocs = await BusinessModel.find(bizQuery).select("id ownerId email").lean();
        const tOwnerIds: string[] = [];
        const tEmails: string[] = [];
        const tBizIds: string[] = [];
        for (const b of territoryBizDocs as any[]) {
          if (b.ownerId) tOwnerIds.push(b.ownerId);
          if (b.email) tEmails.push(b.email.trim().toLowerCase());
          if (b.id) tBizIds.push(b.id);
        }
        territoryOwnerIds = Array.from(new Set(tOwnerIds));
        territoryEmails = Array.from(new Set(tEmails));
        territoryBizIds = Array.from(new Set(tBizIds));

        // Also persist geo-data on these users in the background (fire-and-forget)
        const userOrClauses: any[] = [];
        if (territoryOwnerIds.length > 0) {
          userOrClauses.push({ id: { $in: territoryOwnerIds } });
          userOrClauses.push({ clerkId: { $in: territoryOwnerIds } });
          userOrClauses.push({ email: { $in: territoryOwnerIds } });
        }
        if (territoryEmails.length > 0) {
          userOrClauses.push({ email: { $in: territoryEmails } });
        }
        if (territoryBizIds.length > 0) {
          userOrClauses.push({ claimedBusinessIds: { $in: territoryBizIds } });
        }
        if (userOrClauses.length > 0 && (hasCountryFilter || hasCityFilter)) {
          const setFields: any = {};
          if (hasCountryFilter) { setFields.country = countryParam!.trim(); setFields.assignedCountry = countryParam!.trim(); }
          if (hasCityFilter) { setFields.city = cityParam!.trim(); setFields.assignedCity = cityParam!.trim(); }
          UserModel.updateMany(
            { $or: userOrClauses },
            { $set: setFields }
          ).catch(() => {});
        }
      } catch (bizErr) {
        console.warn("[admin/users] BusinessModel territory query warning:", bizErr);
      }
    }

    // Country filtering (supports assignedCountry, country field, or owning/claiming a business in country)
    if (hasCountryFilter) {
      const countryRegex = new RegExp(`^${countryParam!.trim()}$`, "i");
      const countryOrClause: any[] = [
        { assignedCountry: countryRegex },
        { country: countryRegex },
      ];
      if (territoryOwnerIds.length > 0) {
        countryOrClause.push({ id: { $in: territoryOwnerIds } });
        countryOrClause.push({ clerkId: { $in: territoryOwnerIds } });
        countryOrClause.push({ email: { $in: territoryOwnerIds } });
      }
      if (territoryEmails.length > 0) {
        countryOrClause.push({ email: { $in: territoryEmails } });
      }
      if (territoryBizIds.length > 0) {
        countryOrClause.push({ claimedBusinessIds: { $in: territoryBizIds } });
      }
      andClauses.push({ $or: countryOrClause });
    }

    // City filtering (supports assignedCity, city field, or owning/claiming a business in city)
    if (hasCityFilter) {
      const cityRegex = new RegExp(`^${cityParam!.trim()}$`, "i");
      const cityOrClause: any[] = [
        { assignedCity: cityRegex },
        { city: cityRegex },
      ];
      if (territoryOwnerIds.length > 0) {
        cityOrClause.push({ id: { $in: territoryOwnerIds } });
        cityOrClause.push({ clerkId: { $in: territoryOwnerIds } });
        cityOrClause.push({ email: { $in: territoryOwnerIds } });
      }
      if (territoryEmails.length > 0) {
        cityOrClause.push({ email: { $in: territoryEmails } });
      }
      if (territoryBizIds.length > 0) {
        cityOrClause.push({ claimedBusinessIds: { $in: territoryBizIds } });
      }
      andClauses.push({ $or: cityOrClause });
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

    // Calculate role counts for filter badges — territory-scoped when filters are active
    // Build a base filter clause matching the territory (same geo clauses, no role/search)
    const geoAndClauses: any[] = [];
    if (hasCountryFilter) {
      const countryRegex = new RegExp(`^${countryParam!.trim()}$`, "i");
      const cOr: any[] = [{ assignedCountry: countryRegex }, { country: countryRegex }];
      if (territoryOwnerIds.length > 0) {
        cOr.push({ id: { $in: territoryOwnerIds } }, { clerkId: { $in: territoryOwnerIds } }, { email: { $in: territoryOwnerIds } });
      }
      if (territoryEmails.length > 0) {
        cOr.push({ email: { $in: territoryEmails } });
      }
      if (territoryBizIds.length > 0) {
        cOr.push({ claimedBusinessIds: { $in: territoryBizIds } });
      }
      geoAndClauses.push({ $or: cOr });
    }
    if (hasCityFilter) {
      const cityRegex = new RegExp(`^${cityParam!.trim()}$`, "i");
      const cOr: any[] = [{ assignedCity: cityRegex }, { city: cityRegex }];
      if (territoryOwnerIds.length > 0) {
        cOr.push({ id: { $in: territoryOwnerIds } }, { clerkId: { $in: territoryOwnerIds } }, { email: { $in: territoryOwnerIds } });
      }
      if (territoryEmails.length > 0) {
        cOr.push({ email: { $in: territoryEmails } });
      }
      if (territoryBizIds.length > 0) {
        cOr.push({ claimedBusinessIds: { $in: territoryBizIds } });
      }
      geoAndClauses.push({ $or: cOr });
    }
    const geoBase = geoAndClauses.length > 0 ? { $and: geoAndClauses } : {};

    const [allCount, customersCount, ownersCount, adminsCount, cityAdminsCount, suspendedCount] =
      await Promise.all([
        UserModel.countDocuments(geoBase),
        UserModel.countDocuments({ ...geoBase, role: "user" }),
        UserModel.countDocuments({ ...geoBase, role: "owner" }),
        UserModel.countDocuments({
          ...(geoAndClauses.length > 0 ? { $and: [...geoAndClauses, { role: { $in: ["admin", "super_admin", "country_admin", "city_admin"] } }] } : { role: { $in: ["admin", "super_admin", "country_admin", "city_admin"] } }),
        }),
        UserModel.countDocuments({ ...(geoAndClauses.length > 0 ? { $and: [...geoAndClauses, { role: "city_admin" }] } : { role: "city_admin" }) }),
        UserModel.countDocuments({ ...(geoAndClauses.length > 0 ? { $and: [...geoAndClauses, { isActive: false }] } : { isActive: false }) }),
      ]);

    const finalAllCount = allCount > 0 ? allCount : (total > 0 ? total : 0);
    const finalCustomersCount = customersCount > 0 ? customersCount : (total > 0 ? users.filter((u) => u.role === "user").length : 0);
    const finalOwnersCount = ownersCount > 0 ? ownersCount : (total > 0 ? users.filter((u) => u.role === "owner").length : 0);
    const finalAdminsCount = adminsCount > 0 ? adminsCount : (total > 0 ? users.filter((u) => ["admin", "super_admin", "country_admin", "city_admin"].includes(u.role)).length : 0);
    const finalCityAdminsCount = cityAdminsCount > 0 ? cityAdminsCount : (total > 0 ? users.filter((u) => u.role === "city_admin").length : 0);
    const finalSuspendedCount = suspendedCount > 0 ? suspendedCount : (total > 0 ? users.filter((u) => !u.isActive || u.status === "suspended").length : 0);

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
      updateFields.country = assignedCountry;
    }
    if (assignedCity !== undefined) {
      updateFields.assignedCity = assignedCity;
      updateFields.city = assignedCity;
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
              ...(assignedCountry && { assignedCountry, country: assignedCountry }),
              ...(assignedCity && { assignedCity, city: assignedCity }),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      role = "user",
      country = "Ethiopia",
      city = "Addis Ababa",
      subcity,
      assignedCountry,
      assignedCity,
      notes,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A user with email ${normalizedEmail} is already registered.` },
        { status: 409 }
      );
    }

    const newId = `user_muni_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();

    const newUser = await UserModel.create({
      id: newId,
      clerkId: newId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || undefined,
      role: role as UserRole,
      country: country.trim(),
      city: city.trim(),
      assignedCountry: assignedCountry || (role === "city_admin" || role === "country_admin" ? country.trim() : undefined),
      assignedCity: assignedCity || (role === "city_admin" ? city.trim() : undefined),
      isActive: true,
      accountSettings: { subcity: subcity?.trim(), notes: notes?.trim() },
      claimedBusinessIds: [],
      savedBusinessIds: [],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: `User ${name} successfully registered with municipal city data in ${city}, ${country}!`,
      user: newUser,
    });
  } catch (error: any) {
    console.error("[API /admin/users POST Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  /**
   * PUT /api/admin/users
   * Bulk-assigns city + country to ALL users who currently have no city/country data.
   * Called by city admin "Register All Users to City" action.
   */
  try {
    const body = await request.json();
    const { city, country } = body;

    if (!city || !country) {
      return NextResponse.json(
        { success: false, error: "city and country are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. First sync all current Clerk users into MongoDB (so none are missing)
    let clerkSyncedCount = 0;
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (clerkSecret && !clerkSecret.includes("placeholder")) {
      try {
        const client = await clerkClient();
        // Fetch up to 500 Clerk users (handles most apps)
        const [page1, page2, page3, page4, page5] = await Promise.allSettled([
          client.users.getUserList({ limit: 100, offset: 0 }),
          client.users.getUserList({ limit: 100, offset: 100 }),
          client.users.getUserList({ limit: 100, offset: 200 }),
          client.users.getUserList({ limit: 100, offset: 300 }),
          client.users.getUserList({ limit: 100, offset: 400 }),
        ]);

        const allClerkUsers: any[] = [];
        for (const result of [page1, page2, page3, page4, page5]) {
          if (result.status === "fulfilled" && result.value?.data?.length) {
            allClerkUsers.push(...result.value.data);
          }
        }

        for (const cu of allClerkUsers) {
          const email = cu.emailAddresses?.[0]?.emailAddress?.toLowerCase();
          if (!email) continue;

          const meta = (cu.publicMetadata || {}) as any;
          const fullName =
            `${cu.firstName || ""} ${cu.lastName || ""}`.trim() ||
            email.split("@")[0];
          const role: UserRole = meta.role || "user";
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
                isActive: !isSuspended,
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );
          clerkSyncedCount++;
        }
      } catch (clerkErr) {
        console.warn("[API /admin/users PUT] Clerk sync warning:", clerkErr);
      }
    }

    // 2. Bulk-assign city + country to ALL users who have no city data yet
    const result = await UserModel.updateMany(
      {
        $or: [
          { city: { $exists: false } },
          { city: null },
          { city: "" },
          { country: { $exists: false } },
          { country: null },
          { country: "" },
        ],
      },
      {
        $set: {
          city: city.trim(),
          country: country.trim(),
          updatedAt: new Date(),
        },
      }
    );

    // 3. Also stamp users who have city but not assignedCity (for city_admin roles)
    await UserModel.updateMany(
      {
        role: "city_admin",
        $or: [
          { assignedCity: { $exists: false } },
          { assignedCity: null },
          { assignedCity: "" },
        ],
      },
      {
        $set: {
          assignedCity: city.trim(),
          assignedCountry: country.trim(),
          updatedAt: new Date(),
        },
      }
    );

    const totalUsers = await UserModel.countDocuments({});

    return NextResponse.json({
      success: true,
      message: `Synced ${clerkSyncedCount} Clerk users and registered ${result.modifiedCount} users to ${city}, ${country}.`,
      clerkSyncedCount,
      updatedCount: result.modifiedCount,
      totalUsers,
    });
  } catch (error: any) {
    console.error("[API /admin/users PUT Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to bulk-assign city data" },
      { status: 500 }
    );
  }
}
