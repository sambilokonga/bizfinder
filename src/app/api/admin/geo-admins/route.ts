import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@/types/user";

export interface GeoAdminRecord {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "country_admin" | "city_admin" | "admin";
  assignedCountry?: string;
  assignedCity?: string;
  countryFlag?: string;
  status: "active" | "suspended" | "pending";
  permissions: string[];
  createdAt: string;
  lastActive: string;
  managedListingsCount: number;
}

// In-memory seed geo-admins for instant out-of-the-box functionality
let GEO_ADMINS_ROSTER: GeoAdminRecord[] = [
  {
    id: "geo-adm-super-1",
    name: "Alex Rivera",
    email: "superadmin@bizfinder.et",
    role: "super_admin",
    status: "active",
    permissions: ["all", "country_admin.manage", "city_admin.manage", "platform.manage"],
    createdAt: "2024-01-01",
    lastActive: "Just now",
    managedListingsCount: 1540,
  },
  {
    id: "geo-adm-country-et-mastwal",
    name: "Mastwal (Ethiopia Country Lead)",
    email: "mastwal1627@gmail.com",
    role: "country_admin",
    assignedCountry: "Ethiopia",
    assignedCity: "Addis Ababa",
    countryFlag: "🇪🇹",
    status: "active",
    permissions: ["all.country", "city_admin.manage", "business.approve", "business.verify", "country.analytics.read"],
    createdAt: "2024-01-15",
    lastActive: "Just now",
    managedListingsCount: 500,
  },
  {
    id: "geo-adm-country-ca",
    name: "David Tremblay",
    email: "canada.lead@bizfinder.ca",
    role: "country_admin",
    assignedCountry: "Canada",
    countryFlag: "🇨🇦",
    status: "active",
    permissions: ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"],
    createdAt: "2024-02-01",
    lastActive: "1 hour ago",
    managedListingsCount: 280,
  },
  {
    id: "geo-adm-country-az",
    name: "Leyla Aliyeva",
    email: "azerbaijan.lead@bizfinder.az",
    role: "country_admin",
    assignedCountry: "Azerbaijan",
    countryFlag: "🇦🇿",
    status: "active",
    permissions: ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"],
    createdAt: "2024-02-10",
    lastActive: "3 hours ago",
    managedListingsCount: 195,
  },
  {
    id: "geo-adm-country-us",
    name: "Sarah Jenkins",
    email: "usa.lead@bizfinder.com",
    role: "country_admin",
    assignedCountry: "United States",
    countryFlag: "🇺🇸",
    status: "active",
    permissions: ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"],
    createdAt: "2024-01-20",
    lastActive: "30 mins ago",
    managedListingsCount: 450,
  },
  {
    id: "geo-adm-city-addis",
    name: "Elena Vance",
    email: "addis.admin@bizfinder.et",
    role: "city_admin",
    assignedCountry: "Ethiopia",
    assignedCity: "Addis Ababa",
    countryFlag: "🇪🇹",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-02-15",
    lastActive: "Just now",
    managedListingsCount: 184,
  },
  {
    id: "geo-adm-city-hawassa",
    name: "Kidus Assefa",
    email: "hawassa.admin@bizfinder.et",
    role: "city_admin",
    assignedCountry: "Ethiopia",
    assignedCity: "Hawassa",
    countryFlag: "🇪🇹",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-03-01",
    lastActive: "Yesterday",
    managedListingsCount: 64,
  },
  {
    id: "geo-adm-city-diredawa",
    name: "Yonas Berhanu",
    email: "diredawa.admin@bizfinder.et",
    role: "city_admin",
    assignedCountry: "Ethiopia",
    assignedCity: "Dire Dawa",
    countryFlag: "🇪🇹",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-03-05",
    lastActive: "3 hours ago",
    managedListingsCount: 42,
  },
  {
    id: "geo-adm-city-bahirdar",
    name: "Almaz Ayana",
    email: "bahirdar.admin@bizfinder.et",
    role: "city_admin",
    assignedCountry: "Ethiopia",
    assignedCity: "Bahir Dar",
    countryFlag: "🇪🇹",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-03-10",
    lastActive: "Just now",
    managedListingsCount: 58,
  },
  {
    id: "geo-adm-city-toronto",
    name: "Emily Watson",
    email: "toronto.admin@bizfinder.ca",
    role: "city_admin",
    assignedCountry: "Canada",
    assignedCity: "Toronto",
    countryFlag: "🇨🇦",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-02-18",
    lastActive: "2 hours ago",
    managedListingsCount: 142,
  },
  {
    id: "geo-adm-city-baku",
    name: "Rashad Mammadov",
    email: "baku.admin@bizfinder.az",
    role: "city_admin",
    assignedCountry: "Azerbaijan",
    assignedCity: "Baku",
    countryFlag: "🇦🇿",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-02-25",
    lastActive: "4 hours ago",
    managedListingsCount: 110,
  },
  {
    id: "geo-adm-city-nyc",
    name: "Michael Chang",
    email: "nyc.admin@bizfinder.com",
    role: "city_admin",
    assignedCountry: "United States",
    assignedCity: "New York City",
    countryFlag: "🇺🇸",
    status: "active",
    permissions: ["business.approve", "business.verify", "review.moderate"],
    createdAt: "2024-02-10",
    lastActive: "1 day ago",
    managedListingsCount: 220,
  },
];

function getCountryFlag(countryName?: string): string {
  if (!countryName) return "🌐";
  const entry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return entry?.flag || "🌐";
}

async function resolveCallerJurisdiction(req: Request) {
  const { searchParams } = new URL(req.url);
  let callerRole: string = searchParams.get("callerRole") || "super_admin";
  let callerCountry: string | undefined = searchParams.get("callerCountry") || undefined;
  let callerCity: string | undefined = searchParams.get("callerCity") || undefined;

  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    if (userId) {
      await connectToDatabase();
      const dbUser = (await UserModel.findOne({
        $or: [{ id: userId }, { clerkId: userId }],
      }).lean()) as any;
      if (dbUser) {
        if (dbUser.role) callerRole = dbUser.role;
        if (dbUser.assignedCountry) callerCountry = dbUser.assignedCountry;
        if (dbUser.assignedCity) callerCity = dbUser.assignedCity;
      }
    }
  } catch (e) {
    // Demo or test environment fallback
  }

  // Explicit simulation override takes precedence when testing in admin panel
  const simRole = searchParams.get("simRole") || searchParams.get("callerRole");
  if (simRole) callerRole = simRole;
  const simCountry = searchParams.get("simCountry") || searchParams.get("callerCountry");
  if (simCountry && simCountry !== "all") callerCountry = simCountry;
  const simCity = searchParams.get("simCity") || searchParams.get("callerCity");
  if (simCity && simCity !== "all") callerCity = simCity;

  return { callerRole, callerCountry, callerCity };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterRole = searchParams.get("role");
    const filterCountry = searchParams.get("country");
    const filterCity = searchParams.get("city");

    const { callerRole, callerCountry } = await resolveCallerJurisdiction(req);

    // City Admins do not manage geo-admins
    if (callerRole === "city_admin") {
      return NextResponse.json({
        success: true,
        admins: [],
        message: "City Admins do not have access to administrative governance.",
        stats: { totalCountryAdmins: 0, totalCityAdmins: 0, totalSuperAdmins: 0, coveredCountriesCount: 0, totalGlobalCountries: 195, countryCoveragePercentage: "0.0" },
        countries: [],
      });
    }

    await connectToDatabase();
    const dbUsers = await UserModel.find({
      role: { $in: ["super_admin", "country_admin", "city_admin", "admin"] },
    }).lean();

    const existingEmails = new Set(GEO_ADMINS_ROSTER.map((a) => a.email.toLowerCase()));

    const fromDb: GeoAdminRecord[] = dbUsers
      .filter((doc) => !existingEmails.has((doc.email || "").toLowerCase()))
      .map((doc) => ({
        id: doc.clerkId || doc.id || `adm-${doc._id}`,
        name: doc.name || "Administrator",
        email: doc.email || "",
        role: doc.role as any,
        assignedCountry: doc.assignedCountry,
        assignedCity: doc.assignedCity,
        countryFlag: getCountryFlag(doc.assignedCountry),
        status: doc.isActive !== false ? "active" : "suspended",
        permissions:
          doc.role === "super_admin"
            ? ["all"]
            : doc.role === "country_admin"
            ? ["city_admin.manage", "business.approve", "business.verify"]
            : ["business.approve", "business.verify", "review.moderate"],
        createdAt: doc.createdAt
          ? new Date(doc.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        lastActive: "Recently",
        managedListingsCount: 0,
      }));

    let allAdmins = [...GEO_ADMINS_ROSTER, ...fromDb];

    // JURISDICTION ENFORCEMENT:
    // Country Admin can ONLY view City Admins under their country!
    if (callerRole === "country_admin") {
      const countryScope = callerCountry || "Ethiopia";
      allAdmins = allAdmins.filter(
        (a) =>
          a.role === "city_admin" &&
          a.assignedCountry?.toLowerCase() === countryScope.toLowerCase()
      );

      const targetCountryObj = COUNTRIES_WITH_CITIES.find(
        (c) => c.name.toLowerCase() === countryScope.toLowerCase()
      );

      return NextResponse.json({
        success: true,
        admins: allAdmins,
        stats: {
          totalCountryAdmins: 1,
          totalCityAdmins: allAdmins.length,
          totalSuperAdmins: 0,
          coveredCountriesCount: 1,
          totalGlobalCountries: 1,
          countryCoveragePercentage: "100.0",
        },
        countries: targetCountryObj
          ? [
              {
                name: targetCountryObj.name,
                flag: targetCountryObj.flag,
                citiesCount: targetCountryObj.cities.length,
                cities: targetCountryObj.cities,
                assignedLeadAdmin: undefined,
              },
            ]
          : [],
      });
    }

    // Super Admin / General Admin filters
    if (filterRole && filterRole !== "all") {
      allAdmins = allAdmins.filter((a) => a.role === filterRole);
    }
    if (filterCountry && filterCountry !== "all") {
      allAdmins = allAdmins.filter(
        (a) =>
          a.role === "super_admin" ||
          a.assignedCountry?.toLowerCase() === filterCountry.toLowerCase()
      );
    }
    if (filterCity && filterCity !== "all") {
      allAdmins = allAdmins.filter(
        (a) =>
          a.role === "super_admin" ||
          a.role === "country_admin" ||
          a.assignedCity?.toLowerCase() === filterCity.toLowerCase()
      );
    }

    const countryMainAdmins = allAdmins.filter((a) => a.role === "country_admin");
    const cityAdmins = allAdmins.filter((a) => a.role === "city_admin");
    const superAdmins = allAdmins.filter((a) => a.role === "super_admin");

    const assignedCountries = Array.from(
      new Set(countryMainAdmins.map((a) => a.assignedCountry).filter(Boolean))
    );

    return NextResponse.json({
      success: true,
      admins: allAdmins,
      stats: {
        totalCountryAdmins: countryMainAdmins.length,
        totalCityAdmins: cityAdmins.length,
        totalSuperAdmins: superAdmins.length,
        coveredCountriesCount: assignedCountries.length,
        totalGlobalCountries: COUNTRIES_WITH_CITIES.length, // 195
        countryCoveragePercentage: (
          (assignedCountries.length / COUNTRIES_WITH_CITIES.length) *
          100
        ).toFixed(1),
      },
      countries: COUNTRIES_WITH_CITIES.map((c) => ({
        name: c.name,
        flag: c.flag,
        citiesCount: c.cities.length,
        cities: c.cities,
        assignedLeadAdmin: countryMainAdmins.find(
          (a) => a.assignedCountry?.toLowerCase() === c.name.toLowerCase()
        ),
      })),
    });
  } catch (error: any) {
    console.error("[Geo Admins API GET Error]", error);
    return NextResponse.json({ admins: GEO_ADMINS_ROSTER, error: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const { callerRole, callerCountry } = await resolveCallerJurisdiction(req);

    // City Admin forbidden
    if (callerRole === "city_admin") {
      return NextResponse.json(
        { error: "City Admins do not have permission to appoint administrators." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, role, assignedCountry, assignedCity, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required." },
        { status: 400 }
      );
    }

    // JURISDICTION ENFORCEMENT FOR COUNTRY ADMIN:
    if (callerRole === "country_admin") {
      if (role !== "city_admin") {
        return NextResponse.json(
          { error: "Country Admins can only appoint City Admins under their country." },
          { status: 403 }
        );
      }
      const myCountry = callerCountry || "Ethiopia";
      if (assignedCountry?.toLowerCase() !== myCountry.toLowerCase()) {
        return NextResponse.json(
          { error: `Country Admins can only assign City Admins within their assigned country (${myCountry}).` },
          { status: 403 }
        );
      }
    }

    if (role === "country_admin" && !assignedCountry) {
      return NextResponse.json(
        { error: "Country Main Admin must have an assigned Country." },
        { status: 400 }
      );
    }

    if (role === "city_admin" && (!assignedCountry || !assignedCity)) {
      return NextResponse.json(
        { error: "City Admin must have both an assigned Country and City." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanCountry = assignedCountry ? assignedCountry.trim() : undefined;
    const cleanCity = assignedCity ? assignedCity.trim() : undefined;
    const flag = getCountryFlag(cleanCountry);

    let permissions: string[] = [];
    if (role === "super_admin") {
      permissions = ["all", "country_admin.manage", "city_admin.manage", "platform.manage"];
    } else if (role === "country_admin") {
      permissions = ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"];
    } else {
      permissions = ["business.approve", "business.verify", "review.moderate"];
    }

    // 1. Sync with Clerk
    let clerkUserId: string | null = null;
    try {
      if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder")) {
        const client = await clerkClient();
        const existingUsers = await client.users.getUserList({
          emailAddress: [cleanEmail],
        });

        if (existingUsers.data && existingUsers.data.length > 0) {
          const existing = existingUsers.data[0];
          clerkUserId = existing.id;
          await client.users.updateUserMetadata(existing.id, {
            publicMetadata: {
              role,
              assignedCountry: cleanCountry,
              assignedCity: cleanCity,
              permissions,
            },
          });
        } else {
          const nameParts = cleanName.split(" ");
          const newClerkUser = await client.users.createUser({
            emailAddress: [cleanEmail],
            firstName: nameParts[0] || cleanName,
            lastName: nameParts.slice(1).join(" ") || undefined,
            password: password?.trim() || undefined,
            skipPasswordRequirement: !password?.trim(),
            publicMetadata: {
              role,
              assignedCountry: cleanCountry,
              assignedCity: cleanCity,
              permissions,
            },
          });
          clerkUserId = newClerkUser.id;
        }
      }
    } catch (clerkErr: any) {
      console.warn("[Clerk Geo-Admin Sync Notice]", clerkErr?.message);
    }

    const effectiveId = clerkUserId || `geo-adm-${Date.now()}`;

    // 2. Persist to MongoDB
    try {
      await connectToDatabase();
      await UserModel.findOneAndUpdate(
        { email: cleanEmail },
        {
          $setOnInsert: { id: effectiveId, clerkId: effectiveId },
          $set: {
            name: cleanName,
            email: cleanEmail,
            role,
            assignedCountry: cleanCountry,
            assignedCity: cleanCity,
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
    } catch (dbErr: any) {
      console.warn("[MongoDB Geo-Admin Upsert Notice]", dbErr?.message);
    }

    // 3. Update memory roster
    const newRecord: GeoAdminRecord = {
      id: effectiveId,
      name: cleanName,
      email: cleanEmail,
      role,
      assignedCountry: cleanCountry,
      assignedCity: cleanCity,
      countryFlag: flag,
      status: "active",
      permissions,
      createdAt: new Date().toISOString().split("T")[0],
      lastActive: "Just now",
      managedListingsCount: 0,
    };

    GEO_ADMINS_ROSTER = [
      newRecord,
      ...GEO_ADMINS_ROSTER.filter((a) => a.email.toLowerCase() !== cleanEmail),
    ];

    return NextResponse.json({
      success: true,
      admin: newRecord,
      message: `${role === "country_admin" ? "Country Main Admin" : role === "city_admin" ? "City Admin" : "Administrator"} assigned successfully!`,
    });
  } catch (error: any) {
    console.error("[Geo Admins API POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign geo-admin." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { callerRole, callerCountry } = await resolveCallerJurisdiction(req);

    if (callerRole === "city_admin") {
      return NextResponse.json(
        { error: "City Admins do not have permission to revoke administrators." },
        { status: 403 }
      );
    }

    // If Country Admin, ensure the target is a City Admin under their country
    if (callerRole === "country_admin") {
      const target = GEO_ADMINS_ROSTER.find((a) => a.id === id);
      const myCountry = callerCountry || "Ethiopia";
      if (target && (target.role !== "city_admin" || target.assignedCountry?.toLowerCase() !== myCountry.toLowerCase())) {
        return NextResponse.json(
          { error: "Country Admins can only revoke City Admins under their assigned country." },
          { status: 403 }
        );
      }
    }

    GEO_ADMINS_ROSTER = GEO_ADMINS_ROSTER.filter((a) => a.id !== id);

    try {
      await connectToDatabase();
      await UserModel.findOneAndDelete({ $or: [{ id }, { clerkId: id }] });
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Admin assignment revoked." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
