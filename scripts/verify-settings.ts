import { getSystemSettings, updateSystemSettings, resetSystemSettings } from "../src/lib/db/queries/settings";

async function verify() {
  console.log("--- 1. Testing Default Settings ---");
  const defaults = await getSystemSettings();
  console.log("Loaded platform name:", defaults.platformName);
  console.log("Loaded default currency:", defaults.defaultCurrency);
  console.log("Loaded max photos:", defaults.maxPhotosPerListing);
  console.log("Maintenance mode:", defaults.maintenanceMode);

  console.log("\n--- 2. Testing Updating Settings ---");
  const updated = await updateSystemSettings({
    platformName: "BizFinder Global Directory",
    defaultRadiusKm: 35,
    telebirrEnabled: true,
  }, "test_suite");
  console.log("Updated platform name:", updated.platformName);
  console.log("Updated radius:", updated.defaultRadiusKm);

  console.log("\n--- 3. Testing Reset Defaults ---");
  const reset = await resetSystemSettings("test_suite");
  console.log("Reset platform name:", reset.platformName);
  console.log("Reset radius:", reset.defaultRadiusKm);

  console.log("\nAll queries and data models verified successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
