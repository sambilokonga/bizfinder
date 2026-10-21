import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { CategoryModel } from "@/lib/db/models/Category";
import { globalCityRegistry, CityCategoryPetition } from "@/lib/data/city-business-registry";

// In-memory store for newly added or modified petitions during session
const runtimePetitions = new Map<string, CityCategoryPetition[]>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const country = searchParams.get("country");

    const key = city && city !== "all" ? `${city.toLowerCase()}::${(country || "").toLowerCase()}` : (country || "global").toLowerCase();
    
    // Check if customized at runtime
    if (runtimePetitions.has(key)) {
      return NextResponse.json({
        petitions: runtimePetitions.get(key),
        success: true,
      });
    }

    if (city && city !== "all") {
      const dynamicPetitions = globalCityRegistry.getPetitionsForCity(city, country || "Ethiopia");
      return NextResponse.json({
        petitions: dynamicPetitions,
        city,
        country: country || "Ethiopia",
        success: true,
      });
    }

    if (country && country !== "all") {
      const dynamicPetitions = globalCityRegistry.getPetitionsForCountry(country);
      return NextResponse.json({
        petitions: dynamicPetitions,
        country,
        success: true,
      });
    }

    const globalPetitions = globalCityRegistry.getPetitionsForCountry("Global");
    return NextResponse.json({
      petitions: globalPetitions,
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { city, country, categoryName, parentIndustry, justification, merchantCount } = body;

    if (!categoryName || !parentIndustry) {
      return NextResponse.json(
        { error: "categoryName and parentIndustry are required", success: false },
        { status: 400 }
      );
    }

    const geoLabel = city && city !== "all" ? city : country || "Global";
    const cityKey = city && city !== "all" ? `${city.toLowerCase()}::${(country || "").toLowerCase()}` : null;
    const countryKey = (country || "global").toLowerCase();

    const newPetition: CityCategoryPetition = {
      id: `pet-${geoLabel.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}-${Date.now().toString().slice(-4)}`,
      categoryName: categoryName.trim(),
      parentIndustry: parentIndustry.trim(),
      justification: justification?.trim() || `Municipal category expansion request for ${geoLabel}.`,
      merchantCount: Number(merchantCount) || 12,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: "under_review",
      proposedBy: `${geoLabel} Commercial Trade Association`,
      endorsementsCount: Math.round((Number(merchantCount) || 12) * 1.5),
    };

    // Store in globalCityRegistry
    globalCityRegistry.registerPetition(newPetition, city, country);

    // Store in runtimePetitions
    if (cityKey) {
      const existingCity = runtimePetitions.get(cityKey) || globalCityRegistry.getPetitionsForCity(city, country || "Ethiopia");
      runtimePetitions.set(cityKey, [newPetition, ...existingCity.filter(p => p.id !== newPetition.id)]);
    }
    const existingCountry = runtimePetitions.get(countryKey) || globalCityRegistry.getPetitionsForCountry(country || "Global");
    runtimePetitions.set(countryKey, [newPetition, ...existingCountry.filter(p => p.id !== newPetition.id)]);

    return NextResponse.json({ petition: newPetition, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, city, country } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required", success: false }, { status: 400 });
    }

    // Update in globalCityRegistry
    globalCityRegistry.updatePetitionStatus(id, status);

    const cityKey = city && city !== "all" ? `${city.toLowerCase()}::${(country || "").toLowerCase()}` : null;
    const countryKey = (country || "global").toLowerCase();

    let targetPetition: CityCategoryPetition | undefined;

    if (cityKey) {
      const list = runtimePetitions.get(cityKey) || globalCityRegistry.getPetitionsForCity(city, country || "Ethiopia");
      const updated = list.map((p) => {
        if (p.id === id) {
          targetPetition = { ...p, status };
          return targetPetition;
        }
        return p;
      });
      runtimePetitions.set(cityKey, updated);
    }

    const countryList = runtimePetitions.get(countryKey) || globalCityRegistry.getPetitionsForCountry(country || "Global");
    const updatedCountry = countryList.map((p) => {
      if (p.id === id) {
        targetPetition = { ...p, status };
        return targetPetition;
      }
      return p;
    });
    runtimePetitions.set(countryKey, updatedCountry);

    // If approved, automatically register the proposed category in MongoDB CategoryModel!
    if (status === "approved" && targetPetition) {
      try {
        await connectToDatabase();
        const catName = targetPetition.categoryName;
        const parentName = targetPetition.parentIndustry;
        const escapeReg = (s: string) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const existingCat = await CategoryModel.findOne({
          name: new RegExp(`^${escapeReg(catName)}$`, "i"),
        }).lean();

        if (!existingCat) {
          let parentId: string | null = null;
          let level = 1;
          if (parentName) {
            const parentDoc = await CategoryModel.findOne({
              name: new RegExp(`^${escapeReg(parentName)}$`, "i"),
            }).lean();
            if (parentDoc) {
              parentId = (parentDoc as any).id;
              level = 2;
            }
          }
          const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `cat-${Date.now()}`;
          await CategoryModel.create({
            id: `cat-${slug}`,
            parentId,
            name: catName,
            slug,
            icon: level === 1 ? "FolderTree" : "Tag",
            level,
            featured: false,
          });
        }
      } catch (catErr) {
        console.warn("[Petitions PUT] Auto-register category notice:", catErr);
      }
    }

    return NextResponse.json({ success: true, petition: targetPetition });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    globalCityRegistry.deletePetition(id);
    for (const [key, list] of runtimePetitions.entries()) {
      runtimePetitions.set(key, list.filter((p) => p.id !== id));
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}
