"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";

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
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const primaryImage = activeImage ?? images[0];
  const foundActiveIndex = images.findIndex(
    (image) => image.id === primaryImage?.id,
  );
  const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;
  const visibleCount = 4;
  const effectiveThumbnailStart =
    activeIndex < thumbnailStart
      ? activeIndex
      : activeIndex >= thumbnailStart + visibleCount
        ? Math.max(0, activeIndex - visibleCount + 1)
        : thumbnailStart;
  const visibleThumbnails = useMemo(
    () =>
      images.slice(
        effectiveThumbnailStart,
        effectiveThumbnailStart + visibleCount,
      ),
    [effectiveThumbnailStart, images],
  );

  const canGoPrev = effectiveThumbnailStart > 0;
  const canGoNext = effectiveThumbnailStart + visibleCount < images.length;
  const canNavigateImages = images.length > 1;

  function selectImageAt(index: number) {
    const image = images[index];

    if (image) {
      onActiveImageChange?.(image);
    }
  }

  return (
    <div className="space-y-4">
      <StorefrontCard className="grid aspect-[304/243] place-items-center overflow-hidden p-4 md:aspect-[740/456] lg:aspect-[570/456]">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={primaryImage.alt ?? title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="bg-muted text-muted-foreground grid size-24 place-items-center rounded-xl">
            <ImageIcon className="size-12" />
          </span>
        )}
      </StorefrontCard>

      {images.length > 1 ? (
        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2 lg:min-h-[120px]">
          <button
            type="button"
            className="bg-card text-muted-foreground hover:text-foreground border-border/70 grid min-h-20 place-items-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-35 lg:min-h-[120px]"
            disabled={!canNavigateImages}
            onClick={() => {
              const nextIndex =
                activeIndex === 0 ? images.length - 1 : activeIndex - 1;
              selectImageAt(nextIndex);

              if (canGoPrev || activeIndex === 0) {
                setThumbnailStart(
                  Math.max(0, effectiveThumbnailStart - visibleCount),
                );
              }
            }}
            aria-label="Попередні фото"
          >
            <ChevronLeftIcon className="size-5" />
          </button>

          <div className="grid grid-cols-4 gap-2">
            {visibleThumbnails.map((image) => {
              const isActive = primaryImage?.url === image.url;

              return (
                <button
                  key={image.id}
                  className={cn(
                    "bg-card grid aspect-[76/96] place-items-center overflow-hidden rounded-lg border p-2 transition lg:aspect-[96/120]",
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

          <button
            type="button"
            className="bg-card text-muted-foreground hover:text-foreground border-border/70 grid min-h-20 place-items-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-35 lg:min-h-[120px]"
            disabled={!canNavigateImages}
            onClick={() => {
              const nextIndex =
                activeIndex === images.length - 1 ? 0 : activeIndex + 1;
              selectImageAt(nextIndex);

              if (canGoNext || activeIndex === images.length - 1) {
                setThumbnailStart(
                  Math.min(
                    Math.max(0, images.length - visibleCount),
                    effectiveThumbnailStart + visibleCount,
                  ),
                );
              }
            }}
            aria-label="Наступні фото"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
