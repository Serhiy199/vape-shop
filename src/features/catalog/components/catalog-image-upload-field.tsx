"use client";

import { useEffect, useRef, useState } from "react";

import { AdminField } from "@/components/admin/admin-form-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CatalogImageUploadFieldProps = {
  entitySlug: string;
  entityType: "category" | "subcategory";
  error?: string;
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onUploadingChange?: (value: boolean) => void;
};

type UploadResponse =
  | {
      success: true;
      data: {
        file: {
          publicId: string;
          url: string;
        };
      };
    }
  | {
      success: false;
      error?: {
        message?: string;
      };
    };

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const maxFileSizeBytes = 5 * 1024 * 1024;

export function CatalogImageUploadField({
  entitySlug,
  entityType,
  error,
  id,
  label,
  onChange,
  onUploadingChange,
  value,
}: CatalogImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const clearLocalPreview = () => {
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  };

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewUrl = localPreviewUrl ?? value;

  const handleUpload = async (file: File) => {
    setMessage(null);

    if (!entitySlug.trim()) {
      setMessage("Slug is required before upload.");
      return;
    }

    if (!allowedMimeTypes.has(file.type)) {
      setMessage("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > maxFileSizeBytes) {
      setMessage("Image must be 5 MB or smaller.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return nextPreviewUrl;
    });

    const formData = new FormData();
    formData.append("entitySlug", entitySlug);
    formData.append("entityType", entityType);
    formData.append("files", file);

    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const response = await fetch("/api/upload/catalog-images", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as UploadResponse;

      if (!response.ok) {
        clearLocalPreview();
        setMessage(
          payload.success
            ? "Image upload failed. The image was not saved."
            : (payload.error?.message ??
                "Image upload failed. The image was not saved."),
        );
        return;
      }

      if (!payload.success) {
        clearLocalPreview();
        setMessage(
          payload.error?.message ??
            "Image upload failed. The image was not saved.",
        );
        return;
      }

      onChange(payload.data.file.url);
      setMessage("Image uploaded.");
    } catch {
      clearLocalPreview();
      setMessage("Image upload failed. The image was not saved.");
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <AdminField
      label={label}
      htmlFor={id}
      error={error}
      hint={message ?? "JPEG, PNG, or WebP. Maximum size: 5 MB."}
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={(event) => {
              const [file] = Array.from(event.target.files ?? []);

              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading || !value}
            onClick={() => {
              onChange("");
              setMessage(null);
              setLocalPreviewUrl((current) => {
                if (current) {
                  URL.revokeObjectURL(current);
                }

                return null;
              });
            }}
          >
            Clear
          </Button>
        </div>

        {previewUrl ? (
          <div className="border-border/70 bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-muted border-border/70 h-20 w-20 shrink-0 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">
                {isUploading ? "Uploading..." : "Preview"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {value || "Local preview"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </AdminField>
  );
}
