import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { eq } from "drizzle-orm";
import { db, mediaAssetsTable } from "@workspace/db";

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
}

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/mov",
  "video/quicktime",
]);

// Max file sizes (bytes)
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

export interface MediaUploadRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
  caption?: string;
}

export interface SignedUploadResult {
  uploadUrl: string;
  asset: {
    fileName: string;
    mimeType: string;
    fileSize: number;
    url: string;
    secureUrl: string | null;
    publicId: string | null;
    provider: string;
    width: number | null;
    height: number | null;
    duration: number | null;
    caption: string | null;
  };
}

/** Validate an upload request before issuing a signed URL. */
export function validateUploadRequest(req: MediaUploadRequest): { ok: true } | { ok: false; reason: string } {
  if (!ALLOWED_MIME_TYPES.has(req.mimeType)) {
    return { ok: false, reason: `Unsupported file type: ${req.mimeType}` };
  }
  const isImage = req.mimeType.startsWith("image/");
  const isVideo = req.mimeType.startsWith("video/");
  if (!isImage && !isVideo) {
    return { ok: false, reason: "Only image and video files are allowed" };
  }
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (req.fileSize > maxSize) {
    return { ok: false, reason: `File too large (max ${Math.round(maxSize / 1024 / 1024)} MB)` };
  }
  // Reject potentially dangerous extensions
  const dangerousExtensions = [".exe", ".sh", ".bat", ".cmd", ".com", ".ps1", ".vbs", ".js", ".jar"];
  const lowerName = req.fileName.toLowerCase();
  if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
    return { ok: false, reason: "File type not allowed for security reasons" };
  }
  return { ok: true };
}

/** Create a signed Cloudinary upload policy and record the asset placeholder. */
export async function createSignedUpload(req: MediaUploadRequest): Promise<SignedUploadResult> {
  if (!hasCloudinaryConfig) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }

  const validation = validateUploadRequest(req);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  const isImage = req.mimeType.startsWith("image/");
  const folder = "trivenix-partners";

  // Build signed upload options (never expose secret to client)
  const uploadOptions: Record<string, unknown> = {
    folder,
    resource_type: isImage ? "image" : "video",
    timeout: 120_000,
  };

  if (isImage) {
    uploadOptions["transformation"] = [
      { quality: "auto:good", fetch_format: "auto" },
    ];
  } else {
    uploadOptions["transformation"] = [
      { quality: "auto:good", fetch_format: "auto" },
    ];
  }

  // Generate a signed upload preset via Cloudinary API signature
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      resource_type: isImage ? "image" : "video",
    },
    process.env.CLOUDINARY_API_SECRET!,
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`;

  // Record a placeholder asset so we have a durable record even before upload completes
  const [asset] = await db.insert(mediaAssetsTable).values({
    fileName: req.fileName,
    mimeType: req.mimeType,
    fileSize: req.fileSize,
    url: "", // placeholder; updated after successful upload via webhook or manual confirmation
    secureUrl: null,
    publicId: null,
    provider: "cloudinary",
    width: null,
    height: null,
    duration: null,
    caption: req.caption ?? null,
  }).returning();

  return {
    uploadUrl,
    asset: {
      ...asset,
      url: asset.url,
      secureUrl: asset.secureUrl,
      publicId: asset.publicId,
      provider: asset.provider,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      caption: asset.caption,
    },
  };
}

/** Confirm an uploaded asset (called after successful client-side upload to Cloudinary). */
export async function confirmUploadedAsset(params: {
  publicId: string;
  secureUrl: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  mimeType: string;
  fileSize: number;
  fileName: string;
}) {
  const [asset] = await db
    .update(mediaAssetsTable)
    .set({
      url: params.secureUrl,
      secureUrl: params.secureUrl,
      publicId: params.publicId,
      width: params.width ?? null,
      height: params.height ?? null,
      duration: params.duration ?? null,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      fileName: params.fileName,
    })
    .where(eq(mediaAssetsTable.publicId, params.publicId))
    .returning();
  return asset;
}

/** Delete a media asset from Cloudinary and the database. */
export async function deleteMediaAsset(publicId: string): Promise<boolean> {
  const [asset] = await db
    .select()
    .from(mediaAssetsTable)
    .where(eq(mediaAssetsTable.publicId, publicId))
    .limit(1);
  if (!asset) return false;

  if (hasCloudinaryConfig && asset.publicId) {
    try {
      await cloudinary.uploader.destroy(asset.publicId, {
        resource_type: asset.mimeType.startsWith("video/") ? "video" : "image",
      });
    } catch (err) {
      console.error("[media] Cloudinary delete failed:", err instanceof Error ? err.message : String(err));
    }
  }

  await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, asset.id));
  return true;
}

export function isMediaConfigured(): boolean {
  return hasCloudinaryConfig;
}
