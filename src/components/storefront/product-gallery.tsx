"use client";

import { ImageIcon } from "lucide-react";

import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { cn } from "@/lib/utils";

export type StorefrontProductGalleryImage = {
  alt: string | null;
  id: string;
  isPrimary: boolean;
  url: string;
};

export function StorefrontProductGallery({
  activeImage,
  images,
  onActiveImageChange,
  title,
}: {
  activeImage?: StorefrontProductGalleryImage | null;
  images: StorefrontProductGalleryImage[];
  onActiveImageChange?: (image: StorefrontProductGalleryImage) => void;
  title: string;
}) {
  const primaryImage = activeImage ?? images[0];

  return (
    <div className="space-y-3">
      <StorefrontCard className="grid aspect-square place-items-center p-4">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={primaryImage.alt ?? title}
            className="h-full w-full rounded-lg object-contain"
          />
        ) : (
          <span className="bg-muted text-muted-foreground grid size-24 place-items-center rounded-xl">
            <ImageIcon className="size-12" />
          </span>
        )}
      </StorefrontCard>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((image) => {
            const isActive = primaryImage?.url === image.url;

            return (
              <button
                key={image.id}
                className={cn(
                  "bg-card grid aspect-square place-items-center overflow-hidden rounded-lg border p-2 transition",
                  isActive
                    ? "border-primary ring-primary/20 ring-2"
                    : "border-border/70 hover:border-primary/50",
                )}
                onClick={() => onActiveImageChange?.(image)}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt ?? title}
                  className="h-full w-full object-contain"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
