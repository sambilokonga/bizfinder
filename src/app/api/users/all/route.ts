import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { SEED_USERS } from "@/lib/db/seed-data/users";

function docToUser(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id || obj.clerkId,
    clerkId: obj.clerkId,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    role: obj.role,
    avatarUrl: obj.avatarUrl,
    country: obj.assignedCountry || obj.country || "Global",
    city: obj.assignedCity || obj.city || "",
    assignedCountry: obj.assignedCountry,
    assignedCity: obj.assignedCity,
    claimedBusinessIds: obj.claimedBusinessIds ?? [],
    status: obj.isActive !== false ? "active" : "suspended",
    isActive: obj.isActive !== false,
    createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    await auth();
  } catch (_) {}

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const exportMode = searchParams.get("export") === "true";
  const limit = exportMode ? 5000 : Math.max(1, Math.min(100, Number(searchParams.get("limit") || "20")));
  const search = (searchParams.get("search") || "").trim();
  const countryParam = (searchParams.get("country") || "").trim();
  const cityParam = (searchParams.get("city") || "").trim();
  const roleParam = (searchParams.get("role") || "").trim();
  const skip = exportMode ? 0 : (page - 1) * limit;

  try {
    await connectToDatabase();

    const andClauses: any[] = [];

    // Search query
    if (search) {
      const regex = new RegExp(search, "i");
      andClauses.push({
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          { role: regex },
          { country: regex },
          { assignedCountry: regex },
          { city: regex },
          { assignedCity: regex },
        ],
      });
    }

    // Role filter
    if (roleParam && roleParam !== "all") {
      if (roleParam === "owners") andClauses.push({ role: "owner" });
      else if (roleParam === "customers" || roleParam === "users") andClauses.push({ role: "user" });
      else if (roleParam === "admins") andClauses.push({ role: { $in: ["admin", "super_admin", "country_admin", "city_admin"] } });
      else andClauses.push({ role: roleParam });
    }

    // Country filter
    if (countryParam && countryParam !== "all") {
      const countryRegex = new RegExp(`^${countryParam}$`, "i");
      andClauses.push({
        $or: [
          { assignedCountry: countryRegex },
          { country: countryRegex },
        ],
      });
    }

    // City filter
    if (cityParam && cityParam !== "all") {
      const cityRegex = new RegExp(`^${cityParam}$`, "i");
      andClauses.push({
        $or: [
          { assignedCity: cityRegex },
          { city: cityRegex },
        ],
      });
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};

    let [docs, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(query),
    ]);

    // Fallback to seed data if no documents in database and no narrow filters
    if (total === 0 && (!countryParam || countryParam === "all") && (!cityParam || cityParam === "all") && !search) {
      docs = SEED_USERS as any[];
      total = docs.length;
    }

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      users: docs.map(docToUser),
    });
  } catch (error: any) {
    console.error("[API /users/all GET]", error);

    // Fallback to seed data with memory filtering
    let filtered = [...SEED_USERS] as any[];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phone?.toLowerCase().includes(s) ||
          (u.country || u.assignedCountry || "").toLowerCase().includes(s) ||
          (u.city || u.assignedCity || "").toLowerCase().includes(s)
      );
    }

    if (roleParam && roleParam !== "all") {
      if (roleParam === "owners") filtered = filtered.filter((u) => u.role === "owner");
      else if (roleParam === "customers" || roleParam === "users") filtered = filtered.filter((u) => u.role === "user");
      else if (roleParam === "admins") filtered = filtered.filter((u) => ["admin", "super_admin", "country_admin", "city_admin"].includes(u.role));
      else filtered = filtered.filter((u) => u.role === roleParam);
    }

    if (countryParam && countryParam !== "all") {
      const cp = countryParam.toLowerCase();
      filtered = filtered.filter((u) => (u.country || u.assignedCountry || "").toLowerCase() === cp);
    }

    if (cityParam && cityParam !== "all") {
      const cip = cityParam.toLowerCase();
      filtered = filtered.filter((u) => (u.city || u.assignedCity || "").toLowerCase() === cip);
    }

    const total = filtered.length;
    const paged = exportMode ? filtered : filtered.slice(skip, skip + limit);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      users: paged.map(docToUser),
    });
  }
}
