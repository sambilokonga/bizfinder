import { connectToDatabase } from "@/lib/db/mongodb";
import { LocationModel } from "@/lib/db/models/Location";
import { LocationItem } from "@/types/api";

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
