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
  status: "active" | "suspended" | "pending" | "rejected";
  approvalStatus?: "approved" | "pending" | "rejected";
  nominatedBy?: {
    name?: string;
    email?: string;
    role?: string;
    country?: string;
    date?: string;
  };
  rejectionReason?: string;
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
    id: "geo-adm-country-af-milion",
    name: "Milion Tesfahun (Afghanistan Country Lead)",
    email: "tesfahunmilion8@gmail.com",
    role: "country_admin",
    assignedCountry: "Afghanistan",
    countryFlag: "🇦🇫",
    status: "active",
    permissions: ["all.country", "city_admin.manage", "business.approve", "business.verify", "country.analytics.read"],
    createdAt: "2024-03-01",
    lastActive: "Just now",
    managedListingsCount: 0,
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
    name: "Selamawit Nega",
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
  let callerName: string | undefined = searchParams.get("callerName") || undefined;
  let callerEmail: string | undefined = searchParams.get("callerEmail") || undefined;

  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    if (userId) {
      let clerkEmail: string | undefined;
      try {
        if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder")) {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(userId);
          clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
          if (!callerName && (clerkUser.firstName || clerkUser.lastName)) {
            callerName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
          }
          if (!callerEmail && clerkEmail) callerEmail = clerkEmail;
          const meta = (clerkUser.publicMetadata || {}) as any;
          if (meta.role) callerRole = meta.role;
          if (meta.assignedCountry) callerCountry = meta.assignedCountry;
          if (meta.assignedCity) callerCity = meta.assignedCity;
        }
      } catch (e) {
        // Clerk user lookup error non-fatal
      }

      await connectToDatabase();
      const dbUser = (await UserModel.findOne({
        $or: [
          { id: userId },
          { clerkId: userId },
          ...(clerkEmail ? [{ email: clerkEmail }] : []),
        ],
      }).lean()) as any;

      if (dbUser) {
        if (dbUser.role) callerRole = dbUser.role;
        if (dbUser.assignedCountry) callerCountry = dbUser.assignedCountry;
        if (dbUser.assignedCity) callerCity = dbUser.assignedCity;
        if (!callerName && dbUser.name) callerName = dbUser.name;
        if (!callerEmail && dbUser.email) callerEmail = dbUser.email;
      }

      // Check roster by email if still unresolved
      if (!callerCountry && clerkEmail) {
        const rosterMatch = GEO_ADMINS_ROSTER.find(
          (a) => a.email.toLowerCase() === clerkEmail
        );
        if (rosterMatch) {
          callerRole = rosterMatch.role;
          callerCountry = rosterMatch.assignedCountry;
          callerCity = rosterMatch.assignedCity;
          if (!callerName) callerName = rosterMatch.name;
        }
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

  return { callerRole, callerCountry, callerCity, callerName, callerEmail };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterRole = searchParams.get("role");
    const filterCountry = searchParams.get("country");
    const filterCity = searchParams.get("city");

    const { callerRole, callerCountry, callerCity } = await resolveCallerJurisdiction(req);

    await connectToDatabase();
    const dbUsers = await UserModel.find({
      role: { $in: ["super_admin", "country_admin", "city_admin", "admin"] },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const dbUsersMap = new Map<string, any>();
    dbUsers.forEach((doc) => {
      if (doc.email) dbUsersMap.set(doc.email.toLowerCase(), doc);
    });

    const fromDb: GeoAdminRecord[] = dbUsers.map((doc: any) => ({
      id: doc.clerkId || doc.id || `adm-${doc._id}`,
      name: doc.name || "Administrator",
      email: doc.email || "",
      role: doc.role as any,
      assignedCountry: doc.assignedCountry,
      assignedCity: doc.assignedCity,
      countryFlag: getCountryFlag(doc.assignedCountry),
      status: doc.approvalStatus === "pending"
        ? "pending"
        : doc.approvalStatus === "rejected"
        ? "rejected"
        : doc.isActive !== false ? "active" : "suspended",
      approvalStatus: doc.approvalStatus || (doc.isActive !== false ? "approved" : "pending"),
      nominatedBy: doc.nominatedBy,
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

    // Keep roster items that are not already present in DB
    const remainingRoster: GeoAdminRecord[] = GEO_ADMINS_ROSTER.filter(
      (r) => !dbUsersMap.has(r.email.toLowerCase())
    ).map((r) => ({
      ...r,
      approvalStatus: r.approvalStatus || "approved",
    }));

    let allAdmins = [...fromDb, ...remainingRoster];

    // ── 1. CITY ADMIN SCOPE ──────────────────────────────────────────────────
    // City Admin needs their assigned City Admin profile and their Country Lead liaison
    if (callerRole === "city_admin") {
      const cityScope = filterCity || callerCity || "Addis Ababa";
      const countryScope = filterCountry || callerCountry || "Ethiopia";

      const countryLead = allAdmins.find(
        (a) =>
          a.role === "country_admin" &&
          a.assignedCountry?.toLowerCase() === countryScope.toLowerCase()
      );

      const cityAdmins = allAdmins.filter(
        (a) =>
          a.role === "city_admin" &&
          a.assignedCountry?.toLowerCase() === countryScope.toLowerCase() &&
          a.assignedCity?.toLowerCase() === cityScope.toLowerCase()
      );

      const matchingAdmins = [
        ...(countryLead ? [countryLead] : []),
        ...cityAdmins,
      ];

      const activeCityAdmin = cityAdmins.find(
        (a) => a.approvalStatus !== "pending" && a.status === "active"
      ) || cityAdmins[0];

      const targetCountryObj = COUNTRIES_WITH_CITIES.find(
        (c) => c.name.toLowerCase() === countryScope.toLowerCase()
      );

      return NextResponse.json({
        success: true,
        scope: "city_admin",
        assignedCityAdmin: activeCityAdmin,
        assignedCountryAdmin: countryLead,
        admins: matchingAdmins,
        pendingNominations: cityAdmins.filter((a) => a.approvalStatus === "pending"),
        stats: {
          totalCountryAdmins: countryLead ? 1 : 0,
          totalCityAdmins: cityAdmins.filter((a) => a.status === "active").length,
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
                assignedLeadAdmin: countryLead,
              },
            ]
          : [],
      });
    }

    // ── 2. COUNTRY ADMIN SCOPE ───────────────────────────────────────────────
    // Country Admin views their own Country Lead record AND all City Admins in their borders
    if (callerRole === "country_admin") {
      const countryScope = callerCountry || filterCountry || "Ethiopia";

      const countryLead = allAdmins.find(
        (a) =>
          a.role === "country_admin" &&
          a.assignedCountry?.toLowerCase() === countryScope.toLowerCase()
      );

      const scopedAdmins = allAdmins.filter(
        (a) =>
          (a.role === "city_admin" || a.role === "country_admin") &&
          a.assignedCountry?.toLowerCase() === countryScope.toLowerCase()
      );

      const targetCountryObj = COUNTRIES_WITH_CITIES.find(
        (c) => c.name.toLowerCase() === countryScope.toLowerCase()
      );

      const activeCityAdmins = scopedAdmins.filter(
        (a) => a.role === "city_admin" && a.approvalStatus !== "pending" && a.status === "active"
      );
      const pendingNominations = scopedAdmins.filter(
        (a) => a.role === "city_admin" && a.approvalStatus === "pending"
      );

      return NextResponse.json({
        success: true,
        scope: "country_admin",
        assignedCountryAdmin: countryLead,
        admins: scopedAdmins,
        pendingNominations,
        stats: {
          totalCountryAdmins: countryLead ? 1 : 0,
          totalCityAdmins: activeCityAdmins.length,
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
                assignedLeadAdmin: countryLead,
              },
            ]
          : [],
      });
    }

    // ── 3. BUSINESS OWNER / STOREFRONT LOCATION QUERY ────────────────────────
    // When queried by a merchant or with explicit city & country parameters
    if (
      callerRole === "owner" ||
      callerRole === "merchant" ||
      (filterCountry && filterCity && filterRole === "location_lookup")
    ) {
      const targetCountry = filterCountry || callerCountry || "Ethiopia";
      const targetCity = filterCity || callerCity || "Addis Ababa";

      const countryLead = allAdmins.find(
        (a) =>
          a.role === "country_admin" &&
          a.assignedCountry?.toLowerCase() === targetCountry.toLowerCase()
      );

      const cityAdmin = allAdmins.find(
        (a) =>
          a.role === "city_admin" &&
          a.assignedCountry?.toLowerCase() === targetCountry.toLowerCase() &&
          a.assignedCity?.toLowerCase() === targetCity.toLowerCase() &&
          a.approvalStatus !== "pending" &&
          a.status === "active"
      ) || allAdmins.find(
        (a) =>
          a.role === "city_admin" &&
          a.assignedCountry?.toLowerCase() === targetCountry.toLowerCase() &&
          a.assignedCity?.toLowerCase() === targetCity.toLowerCase()
      );

      const allCityAdmins = allAdmins.filter(
        (a) =>
          a.role === "city_admin" &&
          a.assignedCountry?.toLowerCase() === targetCountry.toLowerCase() &&
          a.assignedCity?.toLowerCase() === targetCity.toLowerCase()
      );

      return NextResponse.json({
        success: true,
        scope: "storefront_lookup",
        country: targetCountry,
        city: targetCity,
        assignedCountryAdmin: countryLead || null,
        assignedCityAdmin: cityAdmin || null,
        cityAdmins: allCityAdmins,
        admins: [
          ...(countryLead ? [countryLead] : []),
          ...allCityAdmins,
        ],
        jurisdiction: {
          country: targetCountry,
          city: targetCity,
          hasCountryLead: Boolean(countryLead),
          hasCityAdmin: Boolean(cityAdmin),
          status: cityAdmin ? "Active & Assigned" : "Municipal Bureau Monitored",
        },
      });
    }

    // ── 4. SUPER ADMIN / GLOBAL GOVERNANCE ───────────────────────────────────
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

    const activeCityAdmins = cityAdmins.filter(
      (a) => a.approvalStatus !== "pending" && a.status === "active"
    );
    const pendingNominations = allAdmins.filter(
      (a) => a.approvalStatus === "pending"
    );

    const assignedCountries = Array.from(
      new Set(countryMainAdmins.map((a) => a.assignedCountry).filter(Boolean))
    );

    return NextResponse.json({
      success: true,
      admins: allAdmins,
      pendingNominations,
      stats: {
        totalCountryAdmins: countryMainAdmins.length,
        totalCityAdmins: activeCityAdmins.length,
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
    return NextResponse.json({ admins: GEO_ADMINS_ROSTER, pendingNominations: [], error: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const { callerRole, callerCountry, callerCity, callerName, callerEmail } = await resolveCallerJurisdiction(req);

    const body = await req.json();
    const { name, email, role, assignedCountry, assignedCity, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required." },
        { status: 400 }
      );
    }

    // STRICT JURISDICTION ENFORCEMENT:
    // City admin can ONLY nominate city_admin within their own city & country.
    if (callerRole === "city_admin") {
      if (role !== "city_admin") {
        return NextResponse.json(
          { error: "City Admins may only nominate administrators within their municipal jurisdiction." },
          { status: 403 }
        );
      }
      const myCity = callerCity || "Addis Ababa";
      const myCountry = callerCountry || "Ethiopia";
      if (
        assignedCity?.toLowerCase() !== myCity.toLowerCase() ||
        assignedCountry?.toLowerCase() !== myCountry.toLowerCase()
      ) {
        return NextResponse.json(
          { error: `City Admins can only nominate administrators for their assigned city (${myCity}, ${myCountry}).` },
          { status: 403 }
        );
      }
    }

    // Country admin CANNOT appoint country_admin or super_admin!
    // Country admin can ONLY nominate city_admin within their own country.
    if (callerRole === "country_admin") {
      if (role !== "city_admin") {
        return NextResponse.json(
          { error: "Country Admins are not permitted to appoint Country Leads or Super Admins. You may only nominate City Admins within your country." },
          { status: 403 }
        );
      }
      const myCountry = callerCountry || "Ethiopia";
      if (assignedCountry?.toLowerCase() !== myCountry.toLowerCase()) {
        return NextResponse.json(
          { error: `Country Admins can only nominate City Admins within their assigned country (${myCountry}).` },
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

    // If appointed by country_admin or city_admin, it is a NOMINATION pending Super Admin approval!
    // If appointed by super_admin, it is APPROVED immediately and posted live!
    const isNomination = callerRole === "country_admin" || callerRole === "city_admin";
    const approvalStatus: "approved" | "pending" = isNomination ? "pending" : "approved";
    const status: "active" | "pending" = isNomination ? "pending" : "active";
    const isActive = !isNomination;
    const nominatedBy = isNomination
      ? {
          name: callerName || (callerRole === "city_admin" ? `${cleanCity} Municipal Bureau` : `${cleanCountry || "Country"} Lead Admin`),
          email: callerEmail || "",
          role: callerRole,
          country: cleanCountry,
          city: cleanCity,
          date: new Date().toISOString(),
        }
      : undefined;

    let permissions: string[] = [];
    if (role === "super_admin") {
      permissions = ["all", "country_admin.manage", "city_admin.manage", "platform.manage"];
    } else if (role === "country_admin") {
      permissions = ["city_admin.manage", "business.approve", "business.verify", "country.analytics.read"];
    } else {
      // For city admin: only grant active permissions immediately if Super Admin approved!
      permissions = isNomination ? [] : ["business.approve", "business.verify", "review.moderate"];
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
              role: isNomination ? "pending_city_admin" : role,
              assignedCountry: cleanCountry,
              assignedCity: cleanCity,
              country: cleanCountry,
              city: cleanCity,
              approvalStatus,
              nominatedBy,
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
              role: isNomination ? "pending_city_admin" : role,
              assignedCountry: cleanCountry,
              assignedCity: cleanCity,
              country: cleanCountry,
              city: cleanCity,
              approvalStatus,
              nominatedBy,
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
            country: cleanCountry,
            city: cleanCity,
            isActive,
            approvalStatus,
            nominatedBy,
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
      status,
      approvalStatus,
      nominatedBy,
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
      pendingApproval: isNomination,
      admin: newRecord,
      message: isNomination
        ? `City Admin nomination for ${cleanCity} (${cleanCountry}) submitted successfully! Awaiting Super Admin approval before being posted live.`
        : `${role === "country_admin" ? `${cleanCountry} Country Lead` : role === "city_admin" ? `City Admin for ${cleanCity}` : "Administrator"} assigned and posted live successfully!`,
    });
  } catch (error: any) {
    console.error("[Geo Admins API POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign geo-admin." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { callerRole } = await resolveCallerJurisdiction(req);

    // Only Super Admins have permission to approve or reject City Admin nominations
    if (callerRole !== "super_admin") {
      return NextResponse.json(
        { error: "Only Super Admins have permission to approve or reject City Admin nominations." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, action, rejectionReason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Admin ID and action ('approve' | 'reject') are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    let dbUser = await UserModel.findOne({ $or: [{ id }, { clerkId: id }] });
    const rosterIdx = GEO_ADMINS_ROSTER.findIndex((a) => a.id === id);
    let target = rosterIdx !== -1 ? GEO_ADMINS_ROSTER[rosterIdx] : null;

    if (!target && !dbUser) {
      return NextResponse.json({ error: "Nomination record not found." }, { status: 404 });
    }

    const targetEmail = (target?.email || dbUser?.email || "").toLowerCase();
    const targetCountry = target?.assignedCountry || dbUser?.assignedCountry || "Ethiopia";
    const targetCity = target?.assignedCity || dbUser?.assignedCity || "";
    const targetName = target?.name || dbUser?.name || "City Admin";

    if (action === "approve") {
      // 1. Sync full active permissions to Clerk
      try {
        if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder")) {
          const client = await clerkClient();
          const existingUsers = await client.users.getUserList({ emailAddress: [targetEmail] });
          if (existingUsers.data && existingUsers.data.length > 0) {
            await client.users.updateUserMetadata(existingUsers.data[0].id, {
              publicMetadata: {
                role: "city_admin",
                assignedCountry: targetCountry,
                assignedCity: targetCity,
                country: targetCountry,
                city: targetCity,
                approvalStatus: "approved",
                permissions: ["business.approve", "business.verify", "review.moderate"],
              },
            });
          }
        }
      } catch (err: any) {
        console.warn("[Clerk Geo-Admin Approval Sync Notice]", err?.message);
      }

      // 2. Update MongoDB
      if (dbUser) {
        dbUser.role = "city_admin";
        dbUser.approvalStatus = "approved";
        dbUser.isActive = true;
        await dbUser.save();
      } else {
        await UserModel.findOneAndUpdate(
          { email: targetEmail },
          {
            $set: {
              role: "city_admin",
              approvalStatus: "approved",
              isActive: true,
              assignedCountry: targetCountry,
              assignedCity: targetCity,
            },
          },
          { upsert: true }
        );
      }

      // 3. Update memory roster
      if (target) {
        target.role = "city_admin";
        target.status = "active";
        target.approvalStatus = "approved";
        target.lastActive = "Just now";
        target.permissions = ["business.approve", "business.verify", "review.moderate"];
      } else {
        target = {
          id: dbUser?.clerkId || dbUser?.id || id,
          name: targetName,
          email: targetEmail,
          role: "city_admin",
          assignedCountry: targetCountry,
          assignedCity: targetCity,
          countryFlag: getCountryFlag(targetCountry),
          status: "active",
          approvalStatus: "approved",
          permissions: ["business.approve", "business.verify", "review.moderate"],
          createdAt: new Date().toISOString().split("T")[0],
          lastActive: "Just now",
          managedListingsCount: 0,
        };
        GEO_ADMINS_ROSTER = [target, ...GEO_ADMINS_ROSTER.filter((a) => a.id !== id)];
      }

      return NextResponse.json({
        success: true,
        action: "approved",
        admin: target,
        message: `Successfully approved ${targetName} as City Admin for ${targetCity}, ${targetCountry}! Posted live to the platform.`,
      });
    } else if (action === "reject") {
      // 1. Update MongoDB
      if (dbUser) {
        dbUser.approvalStatus = "rejected";
        dbUser.isActive = false;
        await dbUser.save();
      }

      // 2. Remove from roster
      GEO_ADMINS_ROSTER = GEO_ADMINS_ROSTER.filter((a) => a.id !== id);

      return NextResponse.json({
        success: true,
        action: "rejected",
        message: `Nomination for ${targetName} (${targetCity}) has been rejected.`,
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Geo Admins API PATCH Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process nomination." },
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
