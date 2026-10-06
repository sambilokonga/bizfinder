import { NextResponse } from "next/server";
import { runDatabaseSeed } from "@/lib/db/seed";
import { connectToDatabase } from "@/lib/db/mongodb";
import {
  BusinessModel,
  CategoryModel,
  LocationModel,
  ReviewModel,
  UserModel,
  ClaimModel,
} from "@/lib/db/models";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json(
        { success: false, error: "Database not connected" },
        { status: 503 }
      );
    }

    const [categories, locations, businesses, reviews, users, claims] = await Promise.all([
      CategoryModel.countDocuments(),
      LocationModel.countDocuments(),
      BusinessModel.countDocuments(),
      ReviewModel.countDocuments(),
      UserModel.countDocuments(),
      ClaimModel.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      database: mongoose.connection.name,
      counts: {
        categories,
        locations,
        businesses,
        reviews,
        users,
        claims,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to inspect database" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const dropExisting = body.dropExisting !== false; // default true

    const result = await runDatabaseSeed({ dropExisting });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API Seed Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Seeding failed",
      },
      { status: 500 }
    );
  }
}
