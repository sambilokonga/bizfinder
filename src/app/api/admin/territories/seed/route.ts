import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { LocationModel } from "@/lib/db/models/Location";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { getSubcitiesForCity } from "@/lib/data/subcities-database";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const seededNodes: any[] = [];
    const seenIds = new Set<string>();

    // 1. Seed All 195 Countries
    for (const c of COUNTRIES_WITH_CITIES) {
      const countryId = `loc-c-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      if (!seenIds.has(countryId)) {
        seenIds.add(countryId);
        seededNodes.push({
          id: countryId,
          name: c.name,
          type: "country",
          parentId: null,
          latitude: c.name === "Ethiopia" ? 9.010793 : 20.0,
          longitude: c.name === "Ethiopia" ? 38.761252 : 0.0,
          countryCode: c.code,
        });
      }
    }

    // 2. Seed 30 Ethiopian Cities & Subcities
    const ethiopiaId = `loc-c-ethiopia`;
    const ethCities = getCitiesForCountry("Ethiopia");
    for (const city of ethCities) {
      const cityId = `loc-city-et-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      if (!seenIds.has(cityId)) {
        seenIds.add(cityId);
        seededNodes.push({
          id: cityId,
          name: city,
          type: "city",
          parentId: ethiopiaId,
          latitude: city === "Addis Ababa" ? 9.010793 : city === "Hawassa" ? 7.0504 : city === "Dire Dawa" ? 9.5931 : 8.5,
          longitude: city === "Addis Ababa" ? 38.761252 : city === "Hawassa" ? 38.4688 : city === "Dire Dawa" ? 41.8661 : 38.5,
          countryCode: "ET",
        });

        // Seed subcities if available
        const subcities = getSubcitiesForCity("Ethiopia", city);
        if (subcities && subcities.length > 0) {
          for (const sub of subcities) {
            const subId = `loc-sub-${city.toLowerCase().slice(0, 3)}-${sub.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            if (!seenIds.has(subId)) {
              seenIds.add(subId);
              seededNodes.push({
                id: subId,
                name: sub,
                type: "subcity",
                parentId: cityId,
                latitude: city === "Addis Ababa" ? 9.010793 : 8.5,
                longitude: city === "Addis Ababa" ? 38.761252 : 38.5,
                countryCode: "ET",
              });
            }
          }
        }
      }
    }

    // Upsert into MongoDB
    let insertedCount = 0;
    let updatedCount = 0;

    for (const node of seededNodes) {
      const res = await LocationModel.findOneAndUpdate(
        { id: node.id },
        { $set: node },
        { upsert: true, new: true }
      );
      if (res) insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seededNodes.length} territory nodes (195 Countries, 30 Ethiopian Cities & Subcities) into MongoDB!`,
      totalNodes: seededNodes.length,
      countriesCount: COUNTRIES_WITH_CITIES.length,
      citiesCount: ethCities.length,
    });
  } catch (error: any) {
    console.error("[Territory Seed API Error]", error);
    return NextResponse.json({ error: error.message || "Failed to seed territories." }, { status: 500 });
  }
}
