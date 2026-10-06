import { connectToDatabase } from "@/lib/db/mongodb";
import { SystemSettingModel, ISystemSettingDoc } from "@/lib/db/models/SystemSetting";
import { ISystemSettingsData, DEFAULT_SYSTEM_SETTINGS } from "@/types/settings";

// In-memory runtime cache for quick response and fallback when MongoDB is cold
let runtimeSettingsCache: ISystemSettingsData = { ...DEFAULT_SYSTEM_SETTINGS };

export async function getSystemSettings(): Promise<ISystemSettingsData> {
  try {
    await connectToDatabase();
    const doc = await SystemSettingModel.findOne({ id: "global_system_settings" }).lean();
    if (doc) {
      const sanitized: ISystemSettingsData = {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...(doc as any),
        updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : new Date().toISOString(),
      };
      runtimeSettingsCache = sanitized;
      return sanitized;
    }

    // Initialize document in DB
    const created = await SystemSettingModel.create(DEFAULT_SYSTEM_SETTINGS);
    const result = {
      ...DEFAULT_SYSTEM_SETTINGS,
      ...(created.toObject() as any),
      updatedAt: created.updatedAt?.toISOString() || new Date().toISOString(),
    };
    runtimeSettingsCache = result;
    return result;
  } catch (error) {
    console.warn("[Settings] Falling back to memory/default settings:", error);
    return runtimeSettingsCache;
  }
}

export async function updateSystemSettings(
  updates: Partial<ISystemSettingsData>,
  updatedBy: string = "super_admin"
): Promise<ISystemSettingsData> {
  try {
    await connectToDatabase();
    const doc = await SystemSettingModel.findOneAndUpdate(
      { id: "global_system_settings" },
      { $set: { ...updates, updatedBy } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    const saved: ISystemSettingsData = {
      ...DEFAULT_SYSTEM_SETTINGS,
      ...(doc as any),
      updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : new Date().toISOString(),
    };
    runtimeSettingsCache = saved;
    return saved;
  } catch (error) {
    console.warn("[Settings] Error updating Mongo, updating runtime cache:", error);
    runtimeSettingsCache = {
      ...runtimeSettingsCache,
      ...updates,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };
    return runtimeSettingsCache;
  }
}

export async function resetSystemSettings(
  updatedBy: string = "super_admin"
): Promise<ISystemSettingsData> {
  try {
    await connectToDatabase();
    await SystemSettingModel.deleteOne({ id: "global_system_settings" });
    const created = await SystemSettingModel.create({ ...DEFAULT_SYSTEM_SETTINGS, updatedBy });
    runtimeSettingsCache = {
      ...DEFAULT_SYSTEM_SETTINGS,
      updatedBy,
      updatedAt: created.updatedAt?.toISOString() || new Date().toISOString(),
    };
    return runtimeSettingsCache;
  } catch (error) {
    console.warn("[Settings] Reset in memory only:", error);
    runtimeSettingsCache = {
      ...DEFAULT_SYSTEM_SETTINGS,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };
    return runtimeSettingsCache;
  }
}
