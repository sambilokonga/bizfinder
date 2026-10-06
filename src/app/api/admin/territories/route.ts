import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { LocationModel } from "@/lib/db/models/Location";
import { BusinessModel } from "@/lib/db/models/Business";
import { SEED_LOCATIONS } from "@/lib/db/seed-data/locations";
import { COUNTRIES_WITH_CITIES } from "@/lib/data/countries-cities";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const country = searchParams.get("country");

    await connectToDatabase();

    // Query filter
    const filter: Record<string, any> = {};
    if (type && type !== "all") filter.type = type;
    if (parentId && parentId !== "all") filter.parentId = parentId;
    if (search) filter.name = { $regex: search, $options: "i" };

    let docs = await LocationModel.find(filter).sort({ name: 1 }).lean();

    // If DB is empty, initialize with SEED_LOCATIONS and top countries
    if (docs.length === 0 && !search && !type && !parentId) {
      const initialLocations = [...SEED_LOCATIONS];
      // Add top countries if not present
      for (const c of COUNTRIES_WITH_CITIES.slice(0, 30)) {
        const id = `loc-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        if (!initialLocations.some((l) => l.id === id || l.name.toLowerCase() === c.name.toLowerCase())) {
          initialLocations.push({
            id,
            parentId: null,
            name: c.name,
            type: "country",
            latitude: 9.0,
            longitude: 38.0,
            countryCode: c.code,
          });
        }
      }

      try {
        await LocationModel.insertMany(initialLocations, { ordered: false });
        docs = await LocationModel.find(filter).sort({ name: 1 }).lean();
      } catch (insertErr) {
        docs = initialLocations as any[];
      }
    }

    // Dynamic business count aggregation
    let bizCountsByCity: Record<string, number> = {};
    let bizCountsByCountry: Record<string, number> = {};
    let bizCountsByDistrict: Record<string, number> = {};

    try {
      const cityAgg = await BusinessModel.aggregate([
        { $match: { cityName: { $exists: true, $ne: "" } } },
        { $group: { _id: { $toLower: "$cityName" }, count: { $sum: 1 } } },
      ]);
      cityAgg.forEach((item) => {
        if (item._id) bizCountsByCity[item._id] = item.count;
      });

      const countryAgg = await BusinessModel.aggregate([
        { $match: { countryName: { $exists: true, $ne: "" } } },
        { $group: { _id: { $toLower: "$countryName" }, count: { $sum: 1 } } },
      ]);
      countryAgg.forEach((item) => {
        if (item._id) bizCountsByCountry[item._id] = item.count;
      });

      const districtAgg = await BusinessModel.aggregate([
        { $match: { districtName: { $exists: true, $ne: "" } } },
        { $group: { _id: { $toLower: "$districtName" }, count: { $sum: 1 } } },
      ]);
      districtAgg.forEach((item) => {
        if (item._id) bizCountsByDistrict[item._id] = item.count;
      });
    } catch (aggErr) {
      console.warn("[Territories API Aggregation Notice]", aggErr);
    }

    // Map business count onto each territory node
    const formatted = docs.map((d: any) => {
      const nameKey = (d.name || "").toLowerCase();
      let bizCount = 0;
      if (d.type === "country") {
        bizCount = bizCountsByCountry[nameKey] || 0;
      } else if (d.type === "city") {
        bizCount = bizCountsByCity[nameKey] || 0;
      } else {
        bizCount = bizCountsByDistrict[nameKey] || bizCountsByCity[nameKey] || 0;
      }

      return {
        id: d.id || String(d._id),
        _id: String(d._id),
        parentId: d.parentId ?? null,
        name: d.name,
        type: d.type,
        latitude: d.latitude,
        longitude: d.longitude,
        countryCode: d.countryCode || undefined,
        businessCount: bizCount,
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
      };
    });

    // Node type counts
    const totalCountries = formatted.filter((f) => f.type === "country").length;
    const totalCities = formatted.filter((f) => f.type === "city").length;
    const totalSubcities = formatted.filter((f) => f.type === "subcity" || f.type === "zone").length;
    const totalDistricts = formatted.filter((f) => f.type === "district" || f.type === "woreda").length;
    const totalBusinesses = Object.values(bizCountsByCountry).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      territories: formatted,
      stats: {
        totalNodes: formatted.length,
        totalCountries,
        totalCities,
        totalSubcities,
        totalDistricts,
        totalBusinessesMapped: totalBusinesses,
      },
    });
  } catch (error: any) {
    console.error("[Territories API GET Error]", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch territory hierarchy",
      territories: SEED_LOCATIONS.map((l) => ({ ...l, businessCount: 0 })),
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, parentId, latitude, longitude, countryCode } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Territory name and type are required." }, { status: 400 });
    }

    await connectToDatabase();

    const cleanName = name.trim();
    const generatedId = `loc-${type}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newTerritory = await LocationModel.create({
      id: generatedId,
      name: cleanName,
      type,
      parentId: parentId || null,
      latitude: Number(latitude) || 9.010793,
      longitude: Number(longitude) || 38.761252,
      countryCode: countryCode ? countryCode.toUpperCase().trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      territory: {
        id: newTerritory.id,
        _id: String(newTerritory._id),
        name: newTerritory.name,
        type: newTerritory.type,
        parentId: newTerritory.parentId,
        latitude: newTerritory.latitude,
        longitude: newTerritory.longitude,
        countryCode: newTerritory.countryCode,
        businessCount: 0,
      },
      message: `Territory "${cleanName}" (${type}) created successfully!`,
    });
  } catch (error: any) {
    console.error("[Territories API POST Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create territory node." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, type, parentId, latitude, longitude, countryCode } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Territory ID and name are required." }, { status: 400 });
    }

    await connectToDatabase();

    const cleanName = name.trim();
    const updated = await LocationModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      {
        $set: {
          name: cleanName,
          ...(type ? { type } : {}),
          parentId: parentId !== undefined ? (parentId || null) : undefined,
          ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
          ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
          ...(countryCode !== undefined ? { countryCode: countryCode ? countryCode.toUpperCase() : undefined } : {}),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Territory not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      territory: updated,
      message: `Territory "${cleanName}" updated successfully.`,
    });
  } catch (error: any) {
    console.error("[Territories API PUT Error]", error);
    return NextResponse.json({ error: error.message || "Failed to update territory node." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Territory ID is required." }, { status: 400 });
    }

    await connectToDatabase();

    // Check if child nodes exist
    const childCount = await LocationModel.countDocuments({ parentId: id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: this territory has ${childCount} child geographic sub-nodes. Reassign or delete child nodes first.`,
        },
        { status: 400 }
      );
    }

    const deleted = await LocationModel.findOneAndDelete({ $or: [{ id }, { _id: id }] });

    if (!deleted) {
      return NextResponse.json({ error: "Territory node not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Territory node "${deleted.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("[Territories API DELETE Error]", error);
    return NextResponse.json({ error: error.message || "Failed to delete territory node." }, { status: 500 });
  }
}
