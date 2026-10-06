import { v2 as cloudinary } from "cloudinary";

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary Configuration
//
// Required environment variables in .env.local:
//   CLOUDINARY_CLOUD_NAME=dfdss8fuk
//   CLOUDINARY_API_KEY=<your API key from https://console.cloudinary.com>
//   CLOUDINARY_API_SECRET=f5a2mQpnTbD2pzm0UrzOxmD-SP0
//
// Your API Key is found at: Cloudinary Dashboard > Settings > Access Keys
// ─────────────────────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dfdss8fuk",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "f5a2mQpnTbD2pzm0UrzOxmD-SP0",
  secure: true,
});

export { cloudinary };

/**
 * Returns true if the API key is present and Cloudinary can perform signed uploads.
 */
export function isCloudinaryConfigured(): boolean {
  const key = process.env.CLOUDINARY_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
}

/**
 * Upload a Buffer or base64 data URI / public URL to Cloudinary (server-side, signed).
 *
 * Throws if CLOUDINARY_API_KEY is not set.
 */
export async function uploadToCloudinary(
  input: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not fully configured. " +
      "Please add CLOUDINARY_API_KEY to your .env.local file. " +
      "Find it at: https://console.cloudinary.com → Settings → Access Keys."
    );
  }

  const folder = options.folder || "globalbiz/businesses";

  if (typeof input === "string") {
    const result = await cloudinary.uploader.upload(input, {
      folder,
      public_id: options.publicId,
      tags: options.tags || ["globalbiz", "business"],
      resource_type: "auto",
      overwrite: true,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  }

  // Buffer → upload_stream
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        tags: options.tags || ["globalbiz", "business"],
        resource_type: "auto",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(new Error(error?.message || "Cloudinary upload failed"));
        }
        resolve({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );
    stream.end(input);
  });
}

/**
 * If the value is a base64 data URI, upload it to Cloudinary and return the
 * resulting CDN URL.  Otherwise return the original value unchanged (e.g.
 * already a public URL or empty string).
 *
 * Never throws – on failure it returns the original value so the rest of the
 * save operation can proceed.
 */
export async function uploadBase64IfPresent(
  value: string | undefined | null,
  folder = "globalbiz/businesses"
): Promise<string> {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();

  if (!trimmed.startsWith("data:")) {
    return trimmed; // already a public URL – nothing to do
  }

  if (!isCloudinaryConfigured()) {
    console.warn(
      "[Cloudinary] Skipping base64 upload: CLOUDINARY_API_KEY is not set in .env.local. " +
      "Image will be stored as a data URI. " +
      "Add your API key from https://console.cloudinary.com → Settings → Access Keys."
    );
    return trimmed; // Graceful degradation: store raw base64 for now
  }

  try {
    const res = await uploadToCloudinary(trimmed, { folder });
    console.log("[Cloudinary] Uploaded →", res.url);
    return res.url;
  } catch (err) {
    console.error("[Cloudinary] Upload failed, keeping original:", err);
    return trimmed;
  }
}

/**
 * Process all image fields on a business payload, uploading any base64 data
 * URIs to Cloudinary and replacing them with CDN URLs.
 *
 * Handles: logoUrl, coverUrl, media[], verificationDocuments[]
 */
export async function processBusinessImagesForCloudinary<T extends Record<string, any>>(
  data: T
): Promise<T> {
  const updated: any = { ...data };

  if (updated.logoUrl) {
    updated.logoUrl = await uploadBase64IfPresent(
      updated.logoUrl,
      "globalbiz/businesses/logos"
    );
  }

  if (updated.coverUrl) {
    updated.coverUrl = await uploadBase64IfPresent(
      updated.coverUrl,
      "globalbiz/businesses/covers"
    );
  }

  if (Array.isArray(updated.media) && updated.media.length > 0) {
    updated.media = await Promise.all(
      updated.media.map(async (m: any) => {
        if (!m?.url || typeof m.url !== "string") return m;
        const subFolder =
          m.type === "logo"
            ? "logos"
            : m.type === "cover"
            ? "covers"
            : "gallery";
        return { ...m, url: await uploadBase64IfPresent(m.url, `globalbiz/businesses/${subFolder}`) };
      })
    );
  }

  if (Array.isArray(updated.verificationDocuments) && updated.verificationDocuments.length > 0) {
    updated.verificationDocuments = await Promise.all(
      updated.verificationDocuments.map(async (doc: any) => {
        if (!doc?.url || typeof doc.url !== "string") return doc;
        return { ...doc, url: await uploadBase64IfPresent(doc.url, "globalbiz/businesses/documents") };
      })
    );
  }

  return updated as T;
}
