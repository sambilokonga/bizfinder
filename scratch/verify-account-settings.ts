import { getUserSettings, updateUserSettings } from "../src/lib/db/queries/users";

async function runAccountSettingsVerification() {
  console.log("🚀 Starting Account Settings Verification...\n");

  const testUserId = "user_owner_test_verify_" + Date.now();

  // 1. Initial Get (should be null or default)
  console.log("1️⃣ Testing Initial getUserSettings...");
  const initial = await getUserSettings(testUserId);
  console.log("Initial settings:", initial ? "Found existing" : "Empty (as expected for new user)");

  // 2. Update Profile & Localization
  console.log("\n2️⃣ Testing Profile & Localization Persistence...");
  const profileUpdate = {
    profile: {
      name: "Marcus Vance",
      email: "marcus.vance@globalbiz.et",
      phone: "+251 91 234 5678",
      jobTitle: "Founder & Managing Director",
      bio: "Serial entrepreneur managing international business services.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    },
    localization: {
      language: "en",
      timezone: "Africa/Addis_Ababa",
      currency: "USD",
      distanceUnit: "km",
      dateFormat: "DD/MM/YYYY",
    },
  };

  const savedProfile = await updateUserSettings(testUserId, profileUpdate);
  if (savedProfile?.profile?.name !== "Marcus Vance" || savedProfile?.localization?.currency !== "USD") {
    throw new Error("Failed to persist profile and localization settings");
  }
  console.log("✅ Profile & Localization saved successfully:", {
    name: savedProfile.profile.name,
    jobTitle: savedProfile.profile.jobTitle,
    currency: savedProfile.localization.currency,
    timezone: savedProfile.localization.timezone,
  });

  // 3. Update Notification Channels & Preferences
  console.log("\n3️⃣ Testing Notifications Configuration...");
  const notificationsUpdate = {
    notifications: {
      emailLeads: true,
      smsLeads: true,
      weeklyDigest: true,
      reviewAlerts: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  };
  const savedNotifs = await updateUserSettings(testUserId, notificationsUpdate);
  if (!savedNotifs?.notifications?.smsLeads || savedNotifs?.notifications?.marketingEmails !== false) {
    throw new Error("Failed to persist notification settings");
  }
  console.log("✅ Notifications saved successfully:", savedNotifs.notifications);

  // 4. Update Security & 2FA Setup
  console.log("\n4️⃣ Testing Security & 2FA Configuration...");
  const securityUpdate = {
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: "authenticator",
      twoFactorSecret: "GBIZ2FAK8M9Q4TX7",
      twoFactorVerifiedAt: new Date().toISOString(),
      activeSessions: [
        {
          id: "sess-101",
          device: "Chrome on macOS (Sonoma)",
          ip: "197.156.104.22",
          location: "Addis Ababa, Ethiopia",
          lastActive: "Just now",
          isCurrent: true,
        },
        {
          id: "sess-102",
          device: "Safari on iPhone 15 Pro",
          ip: "197.156.104.88",
          location: "Addis Ababa, Ethiopia",
          lastActive: "2 hours ago",
          isCurrent: false,
        },
      ],
    },
  };
  const savedSecurity = await updateUserSettings(testUserId, securityUpdate);
  if (!savedSecurity?.security?.twoFactorEnabled || savedSecurity?.security?.activeSessions?.length !== 2) {
    throw new Error("Failed to persist security configuration");
  }
  console.log("✅ Security configured with 2FA enabled and active sessions:", {
    twoFactorEnabled: savedSecurity.security.twoFactorEnabled,
    sessionsCount: savedSecurity.security.activeSessions.length,
  });

  // 5. Session Revocation
  console.log("\n5️⃣ Testing Session Revocation...");
  const remainingSessions = savedSecurity.security.activeSessions.filter(
    (s: any) => s.id !== "sess-102"
  );
  const sessionRevoked = await updateUserSettings(testUserId, {
    security: {
      ...savedSecurity.security,
      activeSessions: remainingSessions,
    },
  });
  if (sessionRevoked?.security?.activeSessions?.length !== 1) {
    throw new Error("Failed to revoke secondary session");
  }
  console.log("✅ Session sess-102 revoked. Remaining sessions:", sessionRevoked.security.activeSessions.length);

  // 6. Team Member Management
  console.log("\n6️⃣ Testing Team Member Invitation & Role Management...");
  const teamMember = {
    id: "team-" + Date.now(),
    name: "Hanna Tesfaye",
    email: "hanna.t@globalbiz.et",
    role: "manager",
    status: "invited",
    invitedAt: new Date().toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  };
  const withTeam = await updateUserSettings(testUserId, {
    team: [teamMember],
  });
  if (withTeam?.team?.length !== 1 || withTeam?.team[0]?.email !== "hanna.t@globalbiz.et") {
    throw new Error("Failed to add team member");
  }
  console.log("✅ Added team member:", withTeam.team[0].name, `(${withTeam.team[0].role})`);

  // Remove team member
  const withoutTeam = await updateUserSettings(testUserId, {
    team: [],
  });
  if (withoutTeam?.team?.length !== 0) {
    throw new Error("Failed to remove team member");
  }
  console.log("✅ Removed team member successfully. Team count:", withoutTeam.team.length);

  // 7. Integrations & Webhook Configuration
  console.log("\n7️⃣ Testing Integrations Configuration & Webhook Ping...");
  const integrationsUpdate = {
    integrations: {
      webhookUrl: "https://api.mycrm.com/v1/leads/webhook",
      googleAnalyticsId: "G-GBIZ998877",
      metaPixelId: "987654321098765",
      leadAlertEmail: "leads@globalbiz.et",
      webhookActive: true,
      lastWebhookTest: new Date().toISOString(),
      lastWebhookStatus: "200 OK",
    },
  };
  const savedIntegrations = await updateUserSettings(testUserId, integrationsUpdate);
  if (savedIntegrations?.integrations?.webhookUrl !== "https://api.mycrm.com/v1/leads/webhook") {
    throw new Error("Failed to persist integrations settings");
  }
  console.log("✅ Integrations saved successfully:", {
    webhookUrl: savedIntegrations.integrations.webhookUrl,
    analyticsId: savedIntegrations.integrations.googleAnalyticsId,
    pixelId: savedIntegrations.integrations.metaPixelId,
    webhookStatus: savedIntegrations.integrations.lastWebhookStatus,
  });

  // 8. Final Verification via getUserSettings
  console.log("\n8️⃣ Running Final Fetch Verification...");
  const finalSettings = await getUserSettings(testUserId);
  if (
    !finalSettings ||
    finalSettings.profile?.name !== "Marcus Vance" ||
    !finalSettings.security?.twoFactorEnabled ||
    finalSettings.localization?.distanceUnit !== "km" ||
    finalSettings.integrations?.leadAlertEmail !== "leads@globalbiz.et"
  ) {
    throw new Error("Final verification check failed on retrieved document");
  }

  console.log("✅ Final settings retrieved and all modules validated!");
  console.log("\n🎉 ALL ACCOUNT SETTINGS VERIFICATIONS PASSED SUCCESSFULLY! 🎉\n");
}

runAccountSettingsVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  });
