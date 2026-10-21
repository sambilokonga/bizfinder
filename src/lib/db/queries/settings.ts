import { connectToDatabase } from "@/lib/db/mongodb";
import { SystemSettingModel } from "@/lib/db/models/SystemSetting";
import { ISystemSettingsData, DEFAULT_SYSTEM_SETTINGS } from "@/types/settings";

export interface SettingsQueryOptions {
  scope?: "global" | "country" | "city";
  country?: string;
  city?: string;
}

function sanitizeKey(str?: string): string {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export function computeSettingsDocId(options?: SettingsQueryOptions): { id: string; scope: "global" | "country" | "city"; country?: string; city?: string } {
  const country = options?.country && options.country !== "all" ? options.country.trim() : undefined;
  const city = options?.city && options.city !== "all" ? options.city.trim() : undefined;
  const scope = options?.scope;

  if (city && (country || scope === "city")) {
    const cKey = sanitizeKey(country || "general");
    const cityKey = sanitizeKey(city);
    return {
      id: `city_settings_${cKey}_${cityKey}`,
      scope: "city",
      country,
      city,
    };
  }

  if (country || scope === "country") {
    const cKey = sanitizeKey(country || "general");
    return {
      id: `country_settings_${cKey}`,
      scope: "country",
      country,
      city: undefined,
    };
  }

  return {
    id: "global_system_settings",
    scope: "global",
    country: undefined,
    city: undefined,
  };
}

// In-memory runtime cache for quick responses and fallback when MongoDB is cold
const runtimeSettingsMap: Record<string, Partial<ISystemSettingsData>> = {
  global_system_settings: { ...DEFAULT_SYSTEM_SETTINGS },
};

export async function getSystemSettings(options?: SettingsQueryOptions): Promise<ISystemSettingsData> {
  const target = computeSettingsDocId(options);

  try {
    await connectToDatabase();

    // 1. Always load base global settings
    let baseDoc = await SystemSettingModel.findOne({ id: "global_system_settings" }).lean();
    if (!baseDoc) {
      try {
        baseDoc = await SystemSettingModel.create({
          ...DEFAULT_SYSTEM_SETTINGS,
          id: "global_system_settings",
          scope: "global",
        });
      } catch {
        // Ignored if race condition
      }
    }

    const globalSettings: ISystemSettingsData = {
      ...DEFAULT_SYSTEM_SETTINGS,
      ...((baseDoc as any) || {}),
      id: "global_system_settings",
      scope: "global",
    };
    runtimeSettingsMap["global_system_settings"] = globalSettings;

    if (target.scope === "global") {
      return {
        ...globalSettings,
        updatedAt: (baseDoc as any)?.updatedAt ? new Date((baseDoc as any).updatedAt).toISOString() : new Date().toISOString(),
      };
    }

    // 2. If Country scope requested, merge country override on top of global
    let countryOverrides: Partial<ISystemSettingsData> = {};
    if (target.country) {
      const countryDocId = `country_settings_${sanitizeKey(target.country)}`;
      const countryDoc = await SystemSettingModel.findOne({ id: countryDocId }).lean();
      if (countryDoc) {
        countryOverrides = (countryDoc as any) || {};
      } else if (runtimeSettingsMap[countryDocId]) {
        countryOverrides = runtimeSettingsMap[countryDocId];
      }
    }

    if (target.scope === "country") {
      return {
        ...globalSettings,
        ...countryOverrides,
        id: target.id,
        scope: "country",
        country: target.country,
        updatedAt: (countryOverrides as any)?.updatedAt ? new Date((countryOverrides as any).updatedAt).toISOString() : globalSettings.updatedAt,
      };
    }

    // 3. If City scope requested, merge city override on top of country & global
    let cityOverrides: Partial<ISystemSettingsData> = {};
    const cityDoc = await SystemSettingModel.findOne({ id: target.id }).lean();
    if (cityDoc) {
      cityOverrides = (cityDoc as any) || {};
    } else if (runtimeSettingsMap[target.id]) {
      cityOverrides = runtimeSettingsMap[target.id];
    }

    return {
      ...globalSettings,
      ...countryOverrides,
      ...cityOverrides,
      id: target.id,
      scope: "city",
      country: target.country,
      city: target.city,
      updatedAt: (cityOverrides as any)?.updatedAt ? new Date((cityOverrides as any).updatedAt).toISOString() : (countryOverrides as any)?.updatedAt ? new Date((countryOverrides as any).updatedAt).toISOString() : globalSettings.updatedAt,
    };
  } catch (error) {
    console.warn("[Settings] Falling back to memory/default settings:", error);
    const globalFallback = { ...DEFAULT_SYSTEM_SETTINGS, ...(runtimeSettingsMap["global_system_settings"] || {}) };
    const countryFallback = target.country ? (runtimeSettingsMap[`country_settings_${sanitizeKey(target.country)}`] || {}) : {};
    const cityFallback = target.id ? (runtimeSettingsMap[target.id] || {}) : {};

    return {
      ...globalFallback,
      ...countryFallback,
      ...cityFallback,
      id: target.id,
      scope: target.scope,
      country: target.country,
      city: target.city,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function updateSystemSettings(
  updates: Partial<ISystemSettingsData>,
  updatedBy: string = "super_admin",
  options?: SettingsQueryOptions
): Promise<ISystemSettingsData> {
  const mergedOptions: SettingsQueryOptions = {
    scope: options?.scope || updates.scope,
    country: options?.country || updates.country,
    city: options?.city || updates.city,
  };
  const target = computeSettingsDocId(mergedOptions);

  const payload = {
    ...updates,
    id: target.id,
    scope: target.scope,
    country: target.country,
    city: target.city,
    updatedBy,
    updatedAt: new Date(),
  };

  try {
    await connectToDatabase();
    const doc = await SystemSettingModel.findOneAndUpdate(
      { id: target.id },
      { $set: payload },
      { new: true, upsert: true, runValidators: false }
    ).lean();

    runtimeSettingsMap[target.id] = {
      ...(runtimeSettingsMap[target.id] || {}),
      ...(doc as any),
      id: target.id,
      scope: target.scope,
      country: target.country,
      city: target.city,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };

    // Return the fully resolved/inherited settings for this scope
    return await getSystemSettings(mergedOptions);
  } catch (error) {
    console.warn("[Settings] Error updating Mongo, updating runtime cache:", error);
    runtimeSettingsMap[target.id] = {
      ...(runtimeSettingsMap[target.id] || {}),
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return await getSystemSettings(mergedOptions);
  }
}

export async function resetSystemSettings(
  updatedBy: string = "super_admin",
  options?: SettingsQueryOptions
): Promise<ISystemSettingsData> {
  const target = computeSettingsDocId(options);

  try {
    await connectToDatabase();
    await SystemSettingModel.deleteOne({ id: target.id });
    delete runtimeSettingsMap[target.id];

    if (target.scope === "global") {
      const created = await SystemSettingModel.create({
        ...DEFAULT_SYSTEM_SETTINGS,
        id: "global_system_settings",
        scope: "global",
        updatedBy,
      });
      runtimeSettingsMap["global_system_settings"] = {
        ...DEFAULT_SYSTEM_SETTINGS,
        updatedBy,
        updatedAt: created.updatedAt?.toISOString() || new Date().toISOString(),
      };
    }

    return await getSystemSettings(options);
  } catch (error) {
    console.warn("[Settings] Reset in memory only:", error);
    delete runtimeSettingsMap[target.id];
    return await getSystemSettings(options);
  }
}
