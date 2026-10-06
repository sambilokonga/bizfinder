import * as fs from "fs";
import * as path from "path";

// IMPORTANT: Load env BEFORE any other imports that read process.env
// Static imports are hoisted, so we use dynamic import() for the seed engine
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(`[Env] Loading ${envFile}...`);
      const content = fs.readFileSync(envPath, "utf-8");
      let loaded = 0;
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
            loaded++;
          }
        }
      }
      console.log(`[Env] Loaded ${loaded} variable(s) from ${envFile}`);
      break; // Stop after first found file
    }
  }
}

// Load env first (before any dynamic imports that read process.env)
loadEnv();

async function main() {
  console.log("=========================================");
  console.log("   BizFinder Database Seed Engine");
  console.log("=========================================");
  console.log(`Connecting URI: ${process.env.MONGODB_URI?.replace(/:([^@]+)@/, ":****@") ?? "(not set!)"}`);

  if (!process.env.MONGODB_URI) {
    console.error("[ERROR] MONGODB_URI is not set. Make sure .env.local exists.");
    process.exit(1);
  }

  // Dynamic import AFTER env is loaded so mongodb.ts reads the correct MONGODB_URI
  const { runDatabaseSeed } = await import("../src/lib/db/seed");

  try {
    const result = await runDatabaseSeed({ dropExisting: true });
    console.log("\n=========================================");
    console.log("   Seed Process Completed Successfully!");
    console.log("=========================================");
    console.log(`Target Database : ${result.database}`);
    console.log(`Duration        : ${(result.durationMs / 1000).toFixed(2)}s`);
    console.log(`Categories      : ${result.stats.categories}`);
    console.log(`Locations       : ${result.stats.locations}`);
    console.log(`Businesses      : ${result.stats.businesses}`);
    console.log(`Reviews         : ${result.stats.reviews}`);
    console.log(`Users           : ${result.stats.users}`);
    console.log(`Claims          : ${result.stats.claims}`);
    console.log(`Indexes Synced  : ${result.indexes.businessIndexes.join(", ")}`);
    console.log("=========================================\n");
    process.exit(0);
  } catch (error: any) {
    console.error("\n[FATAL] Seeding failed with error:", error.message ?? error);
    process.exit(1);
  }
}

main();

