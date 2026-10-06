import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { BusinessModel } from "@/lib/db/models/Business";
import { UserModel } from "@/lib/db/models/User";
import {
  generateAll500CBEBranches,
  ETHIOPIA_30_CITY_ADMINS,
  CBE_CITY_DISTRIBUTION,
} from "@/lib/data/cbe-branches-generator";

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    await connectToDatabase();

    // 1. Generate all 500 CBE Branches
    const cbeBranches = generateAll500CBEBranches();
    const totalGenerated = cbeBranches.length;

    // 2. Ingest into MongoDB in optimized batches of 100
    const batchSize = 100;
    let totalUpserted = 0;

    for (let i = 0; i < cbeBranches.length; i += batchSize) {
      const batch = cbeBranches.slice(i, i + batchSize);
      const bulkOps = batch.map((b) => ({
        updateOne: {
          filter: { slug: b.slug },
          update: {
            $set: {
              ...b,
              status: "active",
              isVerified: true,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      await BusinessModel.bulkWrite(bulkOps, { ordered: false });
      totalUpserted += batch.length;
    }

    // 3. Assign Ethiopia Country Main Admin
    const ethiopiaCountryAdmin = {
      clerkId: "usr_ethiopia_lead_cbe",
      id: "usr_ethiopia_lead_cbe",
      email: "ethiopia.lead@bizfinder.et",
      name: "Marcus Holloway (Ethiopia National Lead)",
      role: "country_admin",
      assignedCountry: "Ethiopia",
      isActive: true,
    };

    await UserModel.findOneAndUpdate(
      { email: ethiopiaCountryAdmin.email },
      { $set: ethiopiaCountryAdmin },
      { upsert: true, new: true }
    );

    // Also seed CBE Corporate HQ Admin
    await UserModel.findOneAndUpdate(
      { email: "cbe.hq@bizfinder.et" },
      {
        $set: {
          clerkId: "usr_cbe_hq_admin",
          id: "usr_cbe_hq_admin",
          email: "cbe.hq@bizfinder.et",
          name: "Commercial Bank of Ethiopia (HQ Operations)",
          role: "country_admin",
          assignedCountry: "Ethiopia",
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );

    // 4. Assign All 30 City Admins for Ethiopia
    const cityAdminOps = ETHIOPIA_30_CITY_ADMINS.map((admin, idx) => ({
      updateOne: {
        filter: { email: admin.email },
        update: {
          $set: {
            clerkId: `usr_city_admin_et_${idx + 1}`,
            id: `usr_city_admin_et_${idx + 1}`,
            name: admin.name,
            email: admin.email,
            role: "city_admin",
            assignedCountry: "Ethiopia",
            assignedCity: admin.city,
            isActive: true,
          },
        },
        upsert: true,
      },
    }));

    await UserModel.bulkWrite(cityAdminOps as any, { ordered: false });

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    // 5. Compute City-by-City branch distribution summary
    const distributionSummary = Object.entries(CBE_CITY_DISTRIBUTION).map(
      ([city, info]) => {
        const assignedCityAdmin = ETHIOPIA_30_CITY_ADMINS.find(
          (a) => a.city.toLowerCase() === city.toLowerCase()
        );
        return {
          city,
          branchesCount: info.count,
          subcitiesCovered: info.subcities.length,
          assignedCityAdmin: assignedCityAdmin
            ? `${assignedCityAdmin.name} (${assignedCityAdmin.email})`
            : "Pending",
        };
      }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${totalUpserted} Commercial Bank of Ethiopia (CBE) branches across 30 cities and assigned the Ethiopia Country Main Admin and 30 City Admins!`,
      statistics: {
        totalBranchesUploaded: totalUpserted,
        totalEthiopianCities: 30,
        countryMainAdmin: {
          name: ethiopiaCountryAdmin.name,
          email: ethiopiaCountryAdmin.email,
          country: "Ethiopia",
          role: "country_admin",
        },
        totalCityAdminsAssigned: ETHIOPIA_30_CITY_ADMINS.length,
        durationSeconds: `${durationSeconds}s`,
      },
      distribution: distributionSummary,
    });
  } catch (error: any) {
    console.error("[CBE Seeding Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed Commercial Bank of Ethiopia branches.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const cbeCount = await BusinessModel.countDocuments({
      name: { $regex: /Commercial Bank of Ethiopia|CBE/i },
    });

    const cityAdmins = await UserModel.find({
      role: "city_admin",
      assignedCountry: "Ethiopia",
    }).lean();

    const countryAdmin = await UserModel.findOne({
      role: "country_admin",
      assignedCountry: "Ethiopia",
    }).lean();

    return NextResponse.json({
      success: true,
      cbeBranchesInDatabase: cbeCount,
      ethiopiaCountryMainAdmin: countryAdmin
        ? { name: (countryAdmin as any).name, email: (countryAdmin as any).email }
        : null,
      assignedCityAdminsCount: cityAdmins.length,
      cityAdmins: cityAdmins.map((a) => ({
        city: a.assignedCity,
        name: a.name,
        email: a.email,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
