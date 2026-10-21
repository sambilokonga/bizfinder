import { connectToDatabase } from "@/lib/db/mongodb";
import { LocationModel } from "@/lib/db/models/Location";
import { LocationItem } from "@/types/api";
import { COUNTRIES_WITH_CITIES } from "@/lib/data/countries-cities";
import { SUBCITIES_DATABASE } from "@/lib/data/subcities-database";

function docToLocation(doc: any): LocationItem {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.id,
    parentId: obj.parentId ?? null,
    name: obj.name,
    type: obj.type,
    latitude: obj.latitude,
    longitude: obj.longitude,
    countryCode: obj.countryCode,
  };
}

export async function getLocationsByType(type: string): Promise<LocationItem[]> {
  await connectToDatabase();
  const docs = await LocationModel.find({ type }).sort({ name: 1 }).lean();
  return docs.map(docToLocation);
}

export async function getLocationChildren(parentId: string): Promise<LocationItem[]> {
  await connectToDatabase();
  const docs = await LocationModel.find({ parentId }).sort({ name: 1 }).lean();
  return docs.map(docToLocation);
}

export async function getAllLocations(): Promise<LocationItem[]> {
  await connectToDatabase();
  const docs = await LocationModel.find({}).sort({ type: 1, name: 1 }).lean();
  return docs.map(docToLocation);
}

export async function getCitiesWithSubcities(): Promise<{
  city: LocationItem;
  subcities: LocationItem[];
}[]> {
  await connectToDatabase();
  const cities = await LocationModel.find({ type: "city" }).sort({ name: 1 }).lean();
  const result = await Promise.all(
    cities.map(async (city) => {
      const subcities = await LocationModel.find({ parentId: city.id, type: "subcity" })
        .sort({ name: 1 })
        .lean();
      return {
        city: docToLocation(city),
        subcities: subcities.map(docToLocation),
      };
    })
  );
  return result;
}

/**
 * Automatically ensures and registers geographic location nodes (Country, City, Subcity/District)
 * into MongoDB LocationModel whenever a business is added or uploaded by owners.
 * This guarantees the location is immediately registered and discoverable on both the
 * City Admin dashboard and Country Admin dashboard of that specific business's territory.
 */
export async function ensureBusinessLocationRegistered(params: {
  countryName?: string;
  cityName?: string;
  districtName?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{
  countryDoc: any;
  cityDoc: any;
  districtDoc?: any;
}> {
  const countryName = (params.countryName || "Ethiopia").trim();
  const cityName = (params.cityName || "Addis Ababa").trim();
  const districtName = (params.districtName || "").trim();
  const lat = Number(params.latitude) || 9.010793;
  const lng = Number(params.longitude) || 38.761252;

  await connectToDatabase();

  const countryEntry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  const countryCode = countryEntry?.code || (countryName.toLowerCase() === "ethiopia" ? "ET" : undefined);

  // 1. Ensure Country Node in MongoDB
  let countryDoc = await LocationModel.findOne({
    type: "country",
    name: { $regex: new RegExp(`^${countryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  });

  if (!countryDoc) {
    const countrySlug = countryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    countryDoc = await LocationModel.create({
      id: `loc-${countrySlug}`,
      parentId: null,
      name: countryName,
      type: "country",
      latitude: lat,
      longitude: lng,
      countryCode,
    });
  }

  // 2. Ensure City Node in MongoDB (linked to Country)
  let cityDoc = await LocationModel.findOne({
    type: "city",
    name: { $regex: new RegExp(`^${cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    $or: [{ parentId: countryDoc.id }, { countryCode }],
  });

  if (!cityDoc) {
    cityDoc = await LocationModel.findOne({
      type: "city",
      name: { $regex: new RegExp(`^${cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
  }

  if (!cityDoc) {
    const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    cityDoc = await LocationModel.create({
      id: `loc-${citySlug}-${Date.now().toString().slice(-4)}`,
      parentId: countryDoc.id,
      name: cityName,
      type: "city",
      latitude: lat,
      longitude: lng,
      countryCode,
    });
  }

  // 3. Ensure District / Subcity Node in MongoDB (linked to City)
  let districtDoc: any = null;
  if (districtName && districtName.toLowerCase() !== cityName.toLowerCase()) {
    districtDoc = await LocationModel.findOne({
      type: { $in: ["subcity", "district", "zone", "woreda"] },
      name: { $regex: new RegExp(`^${districtName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      $or: [{ parentId: cityDoc.id }, { parentId: countryDoc.id }],
    });

    if (!districtDoc) {
      const distSlug = districtName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      districtDoc = await LocationModel.create({
        id: `loc-${distSlug}-${Date.now().toString().slice(-4)}`,
        parentId: cityDoc.id,
        name: districtName,
        type: "subcity",
        latitude: lat,
        longitude: lng,
        countryCode,
      });
    }

    // Update in-memory subcities database for real-time consistency
    if (SUBCITIES_DATABASE[countryName]) {
      if (!SUBCITIES_DATABASE[countryName][cityName]) {
        SUBCITIES_DATABASE[countryName][cityName] = [];
      }
      if (!SUBCITIES_DATABASE[countryName][cityName].includes(districtName)) {
        SUBCITIES_DATABASE[countryName][cityName].push(districtName);
      }
    }
  }

  return { countryDoc, cityDoc, districtDoc };
}
