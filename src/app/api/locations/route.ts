import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { LocationModel } from "@/lib/db/models/Location";
import { SEED_LOCATIONS } from "@/lib/db/seed-data/locations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const parentId = searchParams.get("parentId") || undefined;

  try {
    await connectToDatabase();
    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (parentId) filter.parentId = parentId;

    const docs = await LocationModel.find(filter).sort({ name: 1 }).lean();

    if (docs.length === 0) {
      let fallback = SEED_LOCATIONS as any[];
      if (type) fallback = fallback.filter((l) => l.type === type);
      if (parentId) fallback = fallback.filter((l) => l.parentId === parentId);
      return NextResponse.json({ locations: fallback });
    }

    const locations = docs.map((d: any) => ({
      id: d.id,
      parentId: d.parentId ?? null,
      name: d.name,
      type: d.type,
      latitude: d.latitude,
      longitude: d.longitude,
      countryCode: d.countryCode,
    }));

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("[API /locations GET]", error);
    return NextResponse.json({ locations: SEED_LOCATIONS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, parentId, latitude, longitude, countryCode } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required." }, { status: 400 });
    }

    await connectToDatabase();
    const cleanName = name.trim();
    const generatedId = `loc-${type}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newLocation = await LocationModel.create({
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
      location: newLocation,
      message: `Location "${cleanName}" created successfully!`,
    });
  } catch (error: any) {
    console.error("[API /locations POST]", error);
    return NextResponse.json({ error: error.message || "Failed to create location." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, parentId, latitude, longitude, countryCode } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required." }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await LocationModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      {
        $set: {
          name: name.trim(),
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
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      location: updated,
      message: `Location updated successfully.`,
    });
  } catch (error: any) {
    console.error("[API /locations PUT]", error);
    return NextResponse.json({ error: error.message || "Failed to update location." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await LocationModel.findOneAndDelete({ $or: [{ id }, { _id: id }] });

    if (!deleted) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Location "${deleted.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("[API /locations DELETE]", error);
    return NextResponse.json({ error: error.message || "Failed to delete location." }, { status: 500 });
  }
}
