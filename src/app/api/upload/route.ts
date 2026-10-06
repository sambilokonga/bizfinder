import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Handle FormData multipart upload
    // ─────────────────────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "globalbiz/businesses";

      if (!file) {
        return NextResponse.json(
          { error: "No file provided in form data" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isCloudinaryConfigured()) {
        try {
          // ── Upload to Cloudinary ──
          const result = await uploadToCloudinary(buffer, { folder });
          return NextResponse.json({
            success: true,
            url: result.url,
            publicId: result.publicId,
            provider: "cloudinary",
            size: file.size,
            type: file.type,
          });
        } catch (cldErr: any) {
          console.warn(
            "[/api/upload] Cloudinary upload failed, falling back to local storage:",
            cldErr?.message
          );
        }
      }

      // ── Fallback: local filesystem ──
      console.warn(
        "[/api/upload] Saving file to local storage."
      );
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const originalName = file.name || "upload.jpg";
      const ext = path.extname(originalName) || ".jpg";
      const cleanBase = path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const uniqueFilename = `${Date.now()}-${cleanBase}${ext.toLowerCase()}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, uniqueFilename), buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFilename}`,
        provider: "local",
        size: file.size,
        type: file.type,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Handle JSON base64 upload
    // ─────────────────────────────────────────────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { base64, filename = "image.jpg", mimeType = "image/jpeg", folder = "globalbiz/businesses" } = body;

      if (!base64) {
        return NextResponse.json({ error: "Missing base64 data" }, { status: 400 });
      }

      // Ensure proper data URI format
      const dataUri = base64.startsWith("data:")
        ? base64
        : `data:${mimeType};base64,${base64}`;

      if (isCloudinaryConfigured()) {
        try {
          const result = await uploadToCloudinary(dataUri, { folder });
          return NextResponse.json({
            success: true,
            url: result.url,
            publicId: result.publicId,
            provider: "cloudinary",
            size: result.bytes,
            type: mimeType,
          });
        } catch (cldErr: any) {
          console.warn(
            "[/api/upload] Cloudinary base64 upload failed, falling back to local storage:",
            cldErr?.message
          );
        }
      }

      // ── Fallback: local filesystem ──
      console.warn("[/api/upload] CLOUDINARY_API_KEY not set – saving file locally.");
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const ext = path.extname(filename) || ".jpg";
      const cleanBase = path
        .basename(filename, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const uniqueFilename = `${Date.now()}-${cleanBase}${ext.toLowerCase()}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, uniqueFilename), buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFilename}`,
        provider: "local",
        size: buffer.length,
        type: mimeType,
      });
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Use multipart/form-data or application/json" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API /upload POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
