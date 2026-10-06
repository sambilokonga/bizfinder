import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { MediaModel } from "@/lib/db/models/Media";
import { BusinessModel } from "@/lib/db/models/Business";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeThumbnail } from "@/lib/utils/youtube";
import { uploadBase64IfPresent } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// Initial seed media items to ensure real rich media is immediately available
function getInitialSeedMedia() {
  const list: any[] = [];
  let index = 1;

  for (const biz of SEED_BUSINESSES) {
    // 1. Cover
    if (biz.coverUrl) {
      list.push({
        id: `med-seed-cov-${biz.id || index}`,
        businessId: biz.id,
        businessName: biz.name,
        title: `${biz.name} – Exterior & Main Facade`,
        type: "Cover",
        url: biz.coverUrl,
        uploadedBy: "Admin",
        uploadedAt: "2026-08-15T10:00:00.000Z",
        status: "Approved",
        description: `Official cover showcase for ${biz.name}`,
        sortOrder: 0,
        featured: true,
      });
    }

    // 2. Logo
    if (biz.logoUrl) {
      list.push({
        id: `med-seed-log-${biz.id || index}`,
        businessId: biz.id,
        businessName: biz.name,
        title: `${biz.name} – Brand Logo`,
        type: "Logo",
        url: biz.logoUrl,
        uploadedBy: "Admin",
        uploadedAt: "2026-08-16T11:00:00.000Z",
        status: "Approved",
        description: `Official high-resolution brand badge for ${biz.name}`,
        sortOrder: 1,
      });
    }

    // 3. Media array items
    if (Array.isArray(biz.media)) {
      for (const m of biz.media) {
        if (!m.url) continue;
        const normalizedType =
          m.type === "cover"
            ? "Cover"
            : m.type === "logo"
            ? "Logo"
            : m.type === "video"
            ? "Video"
            : "Photo";

        list.push({
          id: m.id || `med-seed-item-${index++}`,
          businessId: biz.id,
          businessName: biz.name,
          title: m.title || `${biz.name} – Gallery Photo`,
          type: normalizedType,
          url: m.url,
          uploadedBy: "Business Owner",
          uploadedAt: m.uploadedAt || "2026-08-20T09:30:00.000Z",
          status: "Approved",
          description: `Gallery photo uploaded for ${biz.name}`,
          sortOrder: m.sortOrder || 2,
        });
      }
    }

    // 4. Video if present
    if (biz.youtubeVideoId) {
      const vId = extractYoutubeVideoId(biz.youtubeVideoId) || biz.youtubeVideoId;
      list.push({
        id: `med-seed-vid-${biz.id || index}`,
        businessId: biz.id,
        businessName: biz.name,
        title: `${biz.name} – Official Video Showcase Tour`,
        type: "Video",
        url: `https://www.youtube.com/watch?v=${vId}`,
        youtubeId: vId,
        thumbnailUrl: getYoutubeThumbnail(vId),
        uploadedBy: "Marketing Admin",
        uploadedAt: "2026-08-22T14:00:00.000Z",
        status: "Approved",
        description: `YouTube video tour for ${biz.name}`,
        sortOrder: 3,
      });
    }
  }

  // Add some pending and reported items for moderation demonstration
  if (list.length > 3) {
    list[2].status = "Pending";
    list[2].uploadedBy = "New Member Selam";
  }
  if (list.length > 5) {
    list[4].status = "Reported";
    list[4].description = "User reported copyright verification check.";
  }

  return list;
}

// In-memory fallback if MongoDB is unavailable
let memoryMediaStore: any[] = [];

async function syncMediaFromDatabase() {
  const db = await connectToDatabase();
  if (!db) {
    if (memoryMediaStore.length === 0) {
      memoryMediaStore = getInitialSeedMedia();
    }
    return;
  }

  try {
    const count = await MediaModel.countDocuments();
    if (count === 0) {
      // Seed initial media
      const initial = getInitialSeedMedia();
      await MediaModel.insertMany(initial, { ordered: false }).catch(() => {});
    } else {
      // Also inspect any businesses in MongoDB that might have new media
      const businesses = await BusinessModel.find({}, "id name logoUrl coverUrl media youtubeVideoId").lean();
      for (const biz of businesses) {
        if (biz.coverUrl) {
          await MediaModel.updateOne(
            { businessId: biz.id, type: "Cover" },
            {
              $setOnInsert: {
                id: `med-cov-${biz.id}`,
                businessId: biz.id,
                businessName: biz.name,
                title: `${biz.name} – Cover Header`,
                type: "Cover",
                url: biz.coverUrl,
                uploadedBy: "Admin",
                uploadedAt: new Date().toISOString(),
                status: "Approved",
                sortOrder: 0,
              },
            },
            { upsert: true }
          ).catch(() => {});
        }

        if (Array.isArray(biz.media)) {
          for (const m of biz.media) {
            if (!m.url) continue;
            const isVid = m.type === "video" || isYoutubeUrl(m.url);
            const vId = isVid ? extractYoutubeVideoId(m.url) : null;
            const normType =
              isVid
                ? "Video"
                : m.type === "cover"
                ? "Cover"
                : m.type === "logo"
                ? "Logo"
                : "Photo";

            await MediaModel.updateOne(
              { id: m.id },
              {
                $setOnInsert: {
                  id: m.id || `med-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  businessId: biz.id,
                  businessName: biz.name,
                  title: m.title || `${biz.name} ${isVid ? "Video Tour" : "Photo"}`,
                  type: normType,
                  url: m.url,
                  youtubeId: vId || undefined,
                  thumbnailUrl: m.thumbnailUrl || (vId ? getYoutubeThumbnail(vId) : undefined),
                  uploadedBy: "Owner",
                  uploadedAt: m.uploadedAt || new Date().toISOString(),
                  status: "Approved",
                  sortOrder: m.sortOrder || 1,
                },
              },
              { upsert: true }
            ).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error("[syncMediaFromDatabase] error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Paginated list (10 per page default)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await syncMediaFromDatabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    // Exact 10 at one page as required!
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const businessId = searchParams.get("businessId") || "";

    const db = await connectToDatabase();

    if (db) {
      const filter: any = {};

      if (type && type !== "all") {
        if (type === "photos") {
          filter.type = { $in: ["Photo", "Logo"] };
        } else if (type === "videos") {
          filter.type = "Video";
        } else if (type === "covers") {
          filter.type = "Cover";
        } else if (type === "logos") {
          filter.type = "Logo";
        } else {
          // capitalized match
          filter.type = new RegExp(`^${type}$`, "i");
        }
      }

      if (status && status !== "all") {
        filter.status = new RegExp(`^${status}$`, "i");
      }

      if (businessId) {
        filter.businessId = businessId;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { businessName: { $regex: search, $options: "i" } },
          { uploadedBy: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const total = await MediaModel.countDocuments(filter);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const skip = (page - 1) * limit;

      const media = await MediaModel.find(filter)
        .sort({ createdAt: -1, sortOrder: 1, uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Aggregate global counts for tabs
      const [allCount, photosCount, videosCount, coversCount, pendingCount, reportedCount, approvedCount] =
        await Promise.all([
          MediaModel.countDocuments(),
          MediaModel.countDocuments({ type: { $in: ["Photo", "Logo"] } }),
          MediaModel.countDocuments({ type: "Video" }),
          MediaModel.countDocuments({ type: "Cover" }),
          MediaModel.countDocuments({ status: "Pending" }),
          MediaModel.countDocuments({ status: "Reported" }),
          MediaModel.countDocuments({ status: "Approved" }),
        ]);

      return NextResponse.json({
        success: true,
        media,
        total,
        page,
        limit,
        totalPages,
        counts: {
          all: allCount,
          photos: photosCount,
          videos: videosCount,
          covers: coversCount,
          pending: pendingCount,
          reported: reportedCount,
          approved: approvedCount,
        },
      });
    }

    // Memory Fallback
    if (memoryMediaStore.length === 0) {
      memoryMediaStore = getInitialSeedMedia();
    }

    let filtered = [...memoryMediaStore];

    if (type && type !== "all") {
      if (type === "photos") {
        filtered = filtered.filter((m) => m.type === "Photo" || m.type === "Logo");
      } else if (type === "videos") {
        filtered = filtered.filter((m) => m.type === "Video");
      } else if (type === "covers") {
        filtered = filtered.filter((m) => m.type === "Cover");
      } else {
        filtered = filtered.filter((m) => m.type.toLowerCase() === type.toLowerCase());
      }
    }

    if (status && status !== "all") {
      filtered = filtered.filter((m) => m.status.toLowerCase() === status.toLowerCase());
    }

    if (businessId) {
      filtered = filtered.filter((m) => m.businessId === businessId);
    }

    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(search) ||
          m.businessName?.toLowerCase().includes(search) ||
          m.uploadedBy?.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      media: paginated,
      total,
      page,
      limit,
      totalPages,
      counts: {
        all: memoryMediaStore.length,
        photos: memoryMediaStore.filter((m) => m.type === "Photo" || m.type === "Logo").length,
        videos: memoryMediaStore.filter((m) => m.type === "Video").length,
        covers: memoryMediaStore.filter((m) => m.type === "Cover").length,
        pending: memoryMediaStore.filter((m) => m.status === "Pending").length,
        reported: memoryMediaStore.filter((m) => m.status === "Reported").length,
        approved: memoryMediaStore.filter((m) => m.status === "Approved").length,
      },
    });
  } catch (error: any) {
    console.error("[API /admin/media GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load media assets" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Register Actual Media item
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      type = "Photo",
      url,
      businessId,
      businessName,
      uploadedBy = "Admin",
      status = "Approved",
      description = "",
      youtubeId,
      sortOrder = 0,
      featured = false,
    } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and Media URL are required to register media." },
        { status: 400 }
      );
    }

    const isVid = type.toLowerCase() === "video" || isYoutubeUrl(url);
    const resolvedYtId = isVid ? (extractYoutubeVideoId(youtubeId) || extractYoutubeVideoId(url)) : null;

    // Upload to Cloudinary if the URL is a base64 data URI
    const subFolder = type === "Cover" ? "covers" : type === "Logo" ? "logos" : "gallery";
    const finalUrl = isVid ? url.trim() : await uploadBase64IfPresent(url.trim(), `globalbiz/businesses/${subFolder}`);

    const uniqueId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMediaData = {
      id: uniqueId,
      businessId: businessId || undefined,
      businessName: businessName || "General Platform Asset",
      title: title.trim(),
      type: isVid ? "Video" : type,
      url: finalUrl,
      uploadedBy: uploadedBy.trim(),
      uploadedAt: new Date().toISOString(),
      status,
      description: description.trim(),
      sortOrder: Number(sortOrder) || 0,
      youtubeId: resolvedYtId || undefined,
      thumbnailUrl: resolvedYtId ? getYoutubeThumbnail(resolvedYtId) : undefined,
      featured: Boolean(featured),
    };

    const db = await connectToDatabase();
    let savedMedia: any = newMediaData;

    if (db) {
      const doc = await MediaModel.create(newMediaData);
      savedMedia = doc.toObject();

      // If tied to a business, sync with BusinessModel
      if (businessId) {
        const business = await BusinessModel.findOne({ id: businessId });
        if (business) {
          const mediaEntry = {
            id: uniqueId,
            type: isVid ? "video" : type.toLowerCase(),
            url: finalUrl,
            thumbnailUrl: resolvedYtId ? getYoutubeThumbnail(resolvedYtId) : undefined,
            title: title.trim(),
            sortOrder: Number(sortOrder) || (business.media?.length || 0) + 1,
            uploadedAt: new Date().toISOString(),
          };

          const updateObj: any = {
            $push: { media: mediaEntry },
          };

          if (type === "Cover") {
            updateObj.coverUrl = url.trim();
          } else if (type === "Logo") {
            updateObj.logoUrl = url.trim();
          } else if (isVid && resolvedYtId) {
            updateObj.youtubeVideoId = resolvedYtId;
          }

          await BusinessModel.updateOne({ id: businessId }, updateObj);
        }
      }
    } else {
      memoryMediaStore.unshift(newMediaData);
    }

    return NextResponse.json(
      {
        success: true,
        media: savedMedia,
        message: `Media "${title}" registered successfully!`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /admin/media POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register media asset" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH: Update Media Status or Details (Approve, Report, Edit)
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, title, description, sortOrder, featured } = body;

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (featured !== undefined) updateData.featured = featured;

      const updated = await MediaModel.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, media: updated });
    }

    // In-memory fallback
    const item = memoryMediaStore.find((m) => m.id === id);
    if (!item) {
      return NextResponse.json({ error: "Media not found in store" }, { status: 404 });
    }

    if (status) item.status = status;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (sortOrder !== undefined) item.sortOrder = sortOrder;
    if (featured !== undefined) item.featured = featured;

    return NextResponse.json({ success: true, media: item });
  } catch (error: any) {
    console.error("[API /admin/media PATCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update media status" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE: Remove Media Asset
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      const mediaItem = await MediaModel.findOne({ id });
      if (mediaItem?.businessId) {
        // Also remove from BusinessModel
        await BusinessModel.updateOne(
          { id: mediaItem.businessId },
          { $pull: { media: { id } } }
        ).catch(() => {});
      }

      await MediaModel.deleteOne({ id });
      return NextResponse.json({ success: true, message: "Media deleted successfully" });
    }

    // Memory fallback
    memoryMediaStore = memoryMediaStore.filter((m) => m.id !== id);
    return NextResponse.json({ success: true, message: "Media removed from memory" });
  } catch (error: any) {
    console.error("[API /admin/media DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete media asset" },
      { status: 500 }
    );
  }
}
