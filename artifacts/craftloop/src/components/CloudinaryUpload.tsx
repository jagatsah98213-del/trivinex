import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import type { MediaUploadResponse } from "@workspace/api-client-react/api.schemas";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type CloudinaryResult = {
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  duration?: number;
  error?: { message?: string };
};

type Props = {
  accept: string;
  onUploaded: (asset: { url: string; resourceType: "image" | "video" }) => void;
};

export function CloudinaryUpload({ accept, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const signed = await customFetch<MediaUploadResponse>("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signed.apiKey);
      formData.append("timestamp", String(signed.timestamp));
      formData.append("folder", signed.folder);
      formData.append("signature", signed.signature);

      const response = await fetch(signed.uploadUrl, {
        method: "POST",
        body: formData,
      });
      const uploaded = (await response.json()) as CloudinaryResult;
      if (!response.ok || !uploaded.public_id || !uploaded.secure_url) {
        throw new Error(uploaded.error?.message || "Cloudinary upload failed.");
      }

      await customFetch("/api/admin/media/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          publicId: uploaded.public_id,
          secureUrl: uploaded.secure_url,
          width: uploaded.width ?? null,
          height: uploaded.height ?? null,
          duration:
            typeof uploaded.duration === "number"
              ? Math.round(uploaded.duration)
              : null,
        }),
      });

      onUploaded({ url: uploaded.secure_url, resourceType: signed.resourceType });
      toast({ title: "Media uploaded to Cloudinary" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label="Choose a media file"
        disabled={uploading}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void uploadFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {uploading ? "Uploading…" : "Upload to Cloudinary"}
      </Button>
    </div>
  );
}
