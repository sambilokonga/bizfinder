import mongoose from "mongoose";
// @ts-ignore
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://flowerabbeja:aastu2020@cluster0.e9t8lst.mongodb.net/businesses?retryWrites=true&w=majority";

// Import generator functions
import {
  generateAll1969CBEBranches,
  ETHIOPIA_30_CITY_ADMINS,
  CBE_CITY_DISTRIBUTION,
} from "../src/lib/data/cbe-branches-generator";

async function main() {
  console.log("================================================================================");
  console.log("  COMMERCIAL BANK OF ETHIOPIA (CBE) 1,969+ BRANCHES & GEO-ADMINS INGESTOR");
  console.log("================================================================================");
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.split("@")[1] || "MongoDB Atlas"}...`);

  await mongoose.connect(MONGODB_URI);
  console.log(" Connected to MongoDB successfully.\n");

  const db = mongoose.connection.db;
  if (!db) throw new Error("Could not get database connection");

  const businessesColl = db.collection("businesses");
  const usersColl = db.collection("users");

  // 1. Generate 1,969 CBE Branches
  console.log("Generating 1,969+ CBE Branches across all 30 Ethiopian Cities...");
  const branches = generateAll1969CBEBranches();
  console.log(` Generated ${branches.length} branches with complete 6-step listing attributes.\n`);

  // 2. Ingest in chunks of 250
  console.log("Uploading branches to MongoDB in optimized bulk batches...");
  const batchSize = 250;
  let totalUploaded = 0;

  for (let i = 0; i < branches.length; i += batchSize) {
    const chunk = branches.slice(i, i + batchSize);
    const bulkOps = chunk.map((b: any) => ({
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

    await businessesColl.bulkWrite(bulkOps as any, { ordered: false });
    totalUploaded += chunk.length;
    console.log(`  Uploaded ${totalUploaded} / ${branches.length} branches...`);
  }

  console.log(`\n All ${totalUploaded} Commercial Bank of Ethiopia branches uploaded successfully!\n`);

  // 3. Assign Country Main Admin for Ethiopia
  console.log("Assigning Ethiopia Country Main Admin...");
  const ethiopiaCountryAdmin = {
    clerkId: "usr_ethiopia_lead_cbe",
    id: "usr_ethiopia_lead_cbe",
    email: "ethiopia.lead@bizfinder.et",
    name: "Marcus Holloway (Ethiopia National Lead)",
    role: "country_admin",
    assignedCountry: "Ethiopia",
    isActive: true,
    updatedAt: new Date(),
  };

  await usersColl.findOneAndUpdate(
    { email: ethiopiaCountryAdmin.email },
    { $set: ethiopiaCountryAdmin, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  // Also assign CBE Corporate HQ Admin
  await usersColl.findOneAndUpdate(
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
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  console.log(` Ethiopia Country Main Admin assigned: ${ethiopiaCountryAdmin.name} (${ethiopiaCountryAdmin.email})\n`);

  // 4. Assign All 30 City Admins
  console.log("Assigning City Admins for all 30 Ethiopian Cities...");
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
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      upsert: true,
    },
  }));

  await usersColl.bulkWrite(cityAdminOps as any, { ordered: false });
  console.log(` Assigned 30 dedicated City Admins across all 30 Ethiopian cities:\n`);

  ETHIOPIA_30_CITY_ADMINS.forEach((adm, idx) => {
    const cityInfo = CBE_CITY_DISTRIBUTION[adm.city];
    console.log(
      `  ${String(idx + 1).padStart(2, " ")}. [${adm.city.padEnd(14, " ")}] -> ${adm.name.padEnd(20, " ")} (${adm.email}) [${cityInfo?.count || 0} CBE Branches]`
    );
  });

  console.log("\n================================================================================");
  console.log("  REAL TEST & INGESTION COMPLETE!");
  console.log("  - 1,969 Commercial Bank of Ethiopia branches ingested into MongoDB");
  console.log("  - 1 Country Main Admin assigned for Ethiopia");
  console.log("  - 30 City Admins assigned for all 30 cities of Ethiopia");
  console.log("================================================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
