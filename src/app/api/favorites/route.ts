import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { BusinessModel } from "@/lib/db/models/Business";
import { docToBusiness } from "@/lib/db/queries/businesses";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        success: true,
        savedBusinessIds: [],
        businesses: [],
      });
    }

    await connectToDatabase();
    const user = (await UserModel.findOne({
      $or: [{ clerkId: userId }, { id: userId }],
    }).lean()) as any;

    const savedBusinessIds: string[] = user?.savedBusinessIds || [];

    if (savedBusinessIds.length === 0) {
      return NextResponse.json({
        success: true,
        savedBusinessIds: [],
        businesses: [],
      });
    }

    // Fetch full business details from DB or fall back to seeds
    const dbBusinesses = await BusinessModel.find({
      $or: [
        { id: { $in: savedBusinessIds } },
        { slug: { $in: savedBusinessIds } },
      ],
    }).lean();

    const dbMap = new Map<string, any>();
    (dbBusinesses || []).forEach((b: any) => {
      const biz = docToBusiness(b);
      dbMap.set(b.id, biz);
      if (b.slug) dbMap.set(b.slug, biz);
    });

    const seedMap = new Map<string, any>();
    SEED_BUSINESSES.forEach((b) => {
      seedMap.set(b.id, b);
      if (b.slug) seedMap.set(b.slug, b);
    });

    const businesses = savedBusinessIds
      .map((id) => dbMap.get(id) || seedMap.get(id))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      savedBusinessIds,
      businesses,
    });
  } catch (error: any) {
    console.error("[API /api/favorites GET]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, action } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      // Guest mode: acknowledge request so local storage takes effect
      return NextResponse.json({
        success: true,
        isGuest: true,
        businessId,
        message: "Saved locally (Sign in to sync across devices)",
      });
    }

    await connectToDatabase();

    // Ensure user document exists in MongoDB before modifying arrays
    let user = (await UserModel.findOne({
      $or: [{ clerkId: userId }, { id: userId }],
    }).lean()) as any;

    if (!user) {
      let clerkEmail = `${userId}@user.bizfinder.local`;
      let clerkName = "Community Member";
      let clerkAvatar: string | undefined = undefined;

      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          clerkEmail =
            clerkUser.primaryEmailAddress?.emailAddress ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            clerkEmail;
          clerkName =
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
            clerkUser.username ||
            clerkName;
          clerkAvatar = clerkUser.imageUrl;
        }
      } catch (err) {
        console.warn("[API /api/favorites POST] Clerk currentUser lookup fallback:", err);
      }

      await UserModel.findOneAndUpdate(
        { $or: [{ clerkId: userId }, { id: userId }] },
        {
          $setOnInsert: {
            id: userId,
            clerkId: userId,
            name: clerkName,
            email: clerkEmail,
            role: "user",
            avatarUrl: clerkAvatar,
            claimedBusinessIds: [],
            savedBusinessIds: [],
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );

      user = (await UserModel.findOne({
        $or: [{ clerkId: userId }, { id: userId }],
      }).lean()) as any;
    }

    const cleanId = String(businessId).trim();

    // Find any matching business to obtain both canonical id and slug
    const matchingBiz = (await BusinessModel.findOne({
      $or: [{ id: cleanId }, { slug: cleanId }],
    }).lean()) as any;

    const idsToMatch = [cleanId];
    if (matchingBiz?.id && matchingBiz.id !== cleanId) idsToMatch.push(matchingBiz.id);
    if (matchingBiz?.slug && matchingBiz.slug !== cleanId) idsToMatch.push(matchingBiz.slug);
    const canonicalId = matchingBiz?.id || cleanId;

    const currentSaved: string[] = (user?.savedBusinessIds || []).map((id: any) => String(id).trim());
    const isCurrentlySaved = idsToMatch.some((id) => currentSaved.includes(id));

    let nextSaved: string[];
    let shouldSave: boolean;

    if (action === "add") {
      shouldSave = true;
      const updated = (await UserModel.findOneAndUpdate(
        { $or: [{ clerkId: userId }, { id: userId }] },
        { $addToSet: { savedBusinessIds: canonicalId } },
        { new: true }
      ).lean()) as any;
      nextSaved = (updated?.savedBusinessIds || []).map((id: any) => String(id).trim());
    } else if (action === "remove") {
      shouldSave = false;
      const updated = (await UserModel.findOneAndUpdate(
        { $or: [{ clerkId: userId }, { id: userId }] },
        { $pull: { savedBusinessIds: { $in: idsToMatch } } },
        { new: true }
      ).lean()) as any;
      nextSaved = (updated?.savedBusinessIds || []).map((id: any) => String(id).trim());
    } else {
      // Toggle
      shouldSave = !isCurrentlySaved;
      if (shouldSave) {
        const updated = (await UserModel.findOneAndUpdate(
          { $or: [{ clerkId: userId }, { id: userId }] },
          { $addToSet: { savedBusinessIds: canonicalId } },
          { new: true }
        ).lean()) as any;
        nextSaved = (updated?.savedBusinessIds || []).map((id: any) => String(id).trim());
      } else {
        const updated = (await UserModel.findOneAndUpdate(
          { $or: [{ clerkId: userId }, { id: userId }] },
          { $pull: { savedBusinessIds: { $in: idsToMatch } } },
          { new: true }
        ).lean()) as any;
        nextSaved = (updated?.savedBusinessIds || []).map((id: any) => String(id).trim());
      }
    }

    return NextResponse.json({
      success: true,
      isSaved: shouldSave,
      businessId: canonicalId,
      savedBusinessIds: nextSaved,
      message: shouldSave ? "Added to favorites" : "Removed from favorites",
    });
  } catch (error: any) {
    console.error("[API /api/favorites POST]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update favorites" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: true, isGuest: true, isSaved: false, savedBusinessIds: [] });
    }

    await connectToDatabase();
    const cleanId = String(businessId).trim();
    const matchingBiz = (await BusinessModel.findOne({
      $or: [{ id: cleanId }, { slug: cleanId }],
    }).lean()) as any;

    const idsToMatch = [cleanId];
    if (matchingBiz?.id && matchingBiz.id !== cleanId) idsToMatch.push(matchingBiz.id);
    if (matchingBiz?.slug && matchingBiz.slug !== cleanId) idsToMatch.push(matchingBiz.slug);

    const updated = (await UserModel.findOneAndUpdate(
      { $or: [{ clerkId: userId }, { id: userId }] },
      { $pull: { savedBusinessIds: { $in: idsToMatch } } },
      { new: true }
    ).lean()) as any;

    return NextResponse.json({
      success: true,
      isSaved: false,
      savedBusinessIds: (updated?.savedBusinessIds || []).map((id: any) => String(id).trim()),
    });
  } catch (error: any) {
    console.error("[API /api/favorites DELETE]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove favorite" },
      { status: 500 }
    );
  }
}

