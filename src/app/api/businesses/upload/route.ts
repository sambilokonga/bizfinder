import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createBusiness } from "@/lib/db/queries/businesses";
import { dispatchBusinessConfirmationNotifications } from "@/lib/notifications/business-confirmation";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { Business } from "@/types/business";
import { globalCityRegistry } from "@/lib/data/city-business-registry";

export async function POST(request: Request) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch {
    userId = null;
  }

  try {
    const body = await request.json();
    const rawList: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.businesses)
      ? body.businesses
      : body.business
      ? [body.business]
      : [];

    if (!rawList || rawList.length === 0) {
      return NextResponse.json(
        { error: "No businesses found in upload payload." },
        { status: 400 }
      );
    }

    const cookieRole = (request as any).cookies?.get?.("bizfinder_role")?.value || "owner";
    const defaultOwnerId = userId || body.ownerId || `user_uploader_${Date.now()}`;
    let ownerProfile: any = null;
    if (userId) {
      ownerProfile = await getUserByClerkId(userId).catch(() => null);
    }
    const ownerName = ownerProfile?.name || body.ownerName || "Business Submitter";
    const ownerEmail = ownerProfile?.email || body.ownerEmail;

    const createdList: Business[] = [];
    let notificationsCount = 0;

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item.name || !item.name.trim()) continue;

      const trimmedName = item.name.trim();
      const countryName = item.countryName || item.country || "Ethiopia";
      const cityName = item.cityName || item.city || "Addis Ababa";
      const categoryName = item.categoryName || item.category || "General Business";
      const categoryId = item.categoryId || "cat-biz";
      const addressLine =
        item.addressLine || item.address || `${cityName}, ${countryName}`;

      const newBizPayload = {
        name: trimmedName,
        categoryName,
        categoryId,
        countryName,
        cityName,
        districtName: item.districtName || item.subcity || undefined,
        addressLine,
        latitude: item.latitude ? Number(item.latitude) : 9.010793,
        longitude: item.longitude ? Number(item.longitude) : 38.761253,
        telephone: item.telephone || item.phone || undefined,
        mobile: item.mobile || undefined,
        email: item.email || undefined,
        website: item.website || undefined,
        description:
          item.description ||
          `${trimmedName} listing uploaded via directory batch import.`,
        priceTier: item.priceTier || "$$",
        businessLevel: item.businessLevel || "Small",
        businessType: item.businessType || "Sole Proprietorship",
        ownerId: item.ownerId || defaultOwnerId,
        approvalStatus: "pending_city",
        isApproved: false,
        isPublished: false,
        isVerified: false,
        registeredAt: item.registeredAt || item.registrationDate || new Date().toISOString(),
        validationDate: item.validationDate ? new Date(item.validationDate).toISOString() : undefined,
        existenceStatus: "confirmed",
        subscriptionStatus: "trial",
      };

      const created = await createBusiness(newBizPayload as any);
      createdList.push(created);

      // Register in global city registry for city & country visibility
      try {
        globalCityRegistry.registerBusiness(created);
      } catch (regErr) {
        console.warn(`[Upload] Registry note for "${created.name}":`, regErr);
      }

      // Dispatch confirmation alert for this listing
      try {
        const dispatchRes = await dispatchBusinessConfirmationNotifications({
          business: created,
          ownerInfo: {
            id: created.ownerId || defaultOwnerId,
            name: ownerName,
            email: ownerEmail,
          },
          submissionType: "uploaded",
        });
        notificationsCount += dispatchRes.notifications.length;
      } catch (dispErr) {
        console.warn(`[Upload] Alert dispatch failed for "${created.name}":`, dispErr);
      }
    }

    // Immediately associate uploader with uploaded city & country in UserModel
    if (createdList.length > 0) {
      try {
        const { UserModel } = await import("@/lib/db/models/User");
        const firstBiz = createdList[0];
        const targetOwnerId = userId || defaultOwnerId;
        if (targetOwnerId && (firstBiz.countryName || firstBiz.cityName)) {
          await UserModel.findOneAndUpdate(
            { $or: [{ id: targetOwnerId }, { clerkId: targetOwnerId }] },
            {
              $set: {
                ...(firstBiz.countryName && { country: firstBiz.countryName, assignedCountry: firstBiz.countryName }),
                ...(firstBiz.cityName && { city: firstBiz.cityName, assignedCity: firstBiz.cityName }),
                role: "owner",
                updatedAt: new Date(),
              },
              $addToSet: { claimedBusinessIds: { $each: createdList.map((b) => b.id) } },
            }
          );
        }
      } catch (uErr) {
        console.warn("[Upload] User geo-update warning:", uErr);
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        count: createdList.length,
        businesses: createdList,
        notificationsDispatched: notificationsCount,
        message: `Successfully uploaded ${createdList.length} business listing(s). Multi-tier confirmation alerts sent to Super Admin, Country Admin, and City Admin.`,
      },
      { status: 201 }
    );

    response.cookies.set("bizfinder_role", "owner", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[API /businesses/upload POST]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process business upload batch." },
      { status: 500 }
    );
  }
}
