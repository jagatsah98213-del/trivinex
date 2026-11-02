import { v2 as cloudinary } from "cloudinary";
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
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  resourceType: "image" | "video";
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
  const resourceType = isImage ? "image" : "video";
  const folder = "trivenix-partners";

  // Generate a signed upload preset via Cloudinary API signature
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  return {
    uploadUrl,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    signature,
    timestamp,
    folder,
    resourceType,
  };
}

/** Persist media metadata after a successful signed Cloudinary upload. */
export async function confirmUploadedAsset(params: {
  caption?: string | null;
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
    .insert(mediaAssetsTable)
    .values({
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      url: params.secureUrl,
      secureUrl: params.secureUrl,
      publicId: params.publicId,
      provider: "cloudinary",
      width: params.width ?? null,
      height: params.height ?? null,
      duration: params.duration ?? null,
      caption: params.caption ?? null,
    })
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
