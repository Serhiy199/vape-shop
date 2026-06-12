"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";

import { currencyFormatter } from "@/components/storefront/product-card";
import type { StorefrontProductCardItem } from "@/components/storefront/product-types";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductRecommendationsStrip({
  className,
  products,
  title,
}: {
  className?: string;
  products: StorefrontProductCardItem[];
  title: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  if (products.length === 0) {
    return null;
  }

  function scrollProducts(direction: "next" | "prev") {
    scrollerRef.current?.scrollBy({
      behavior: "smooth",
      left: direction === "next" ? 340 : -340,
    });
  }

  return (
    <StorefrontCard className={cn("overflow-hidden p-0", className)}>
      <div className="border-border/70 border-b px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="grid grid-cols-[36px_minmax(0,1fr)_36px] gap-3 p-4">
        <StripArrow direction="prev" onClick={() => scrollProducts("prev")} />
        <div ref={scrollerRef} className="flex gap-3 overflow-x-auto pb-1">
          {products.map((product) => (
            <CompactRecommendationCard key={product.id} product={product} />
          ))}
        </div>
        <StripArrow direction="next" onClick={() => scrollProducts("next")} />
      </div>
    </StorefrontCard>
  );
}

function StripArrow({
  direction,
  onClick,
}: {
  direction: "next" | "prev";
  onClick: () => void;
}) {
  const Icon = direction === "next" ? ChevronRightIcon : ChevronLeftIcon;

  return (
    <Button
      aria-label={direction === "next" ? "Наступні товари" : "Попередні товари"}
      className="h-full min-h-[104px] rounded-lg"
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <Icon className="size-4" />
    </Button>
  );
}

function CompactRecommendationCard({
  product,
}: {
  product: StorefrontProductCardItem;
}) {
  return (
    <div className="border-border/70 bg-background flex min-w-[260px] flex-1 items-center gap-3 rounded-lg border p-3 sm:min-w-[320px]">
      <Link
        href={product.href}
        className="bg-muted/60 grid size-14 shrink-0 place-items-center overflow-hidden rounded-md"
        aria-label={product.title}
      >
        {product.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageSrc}
            alt={product.imageAlt ?? product.title}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageIcon className="text-muted-foreground size-6" />
        )}
      </Link>
      <div className="min-w-0 flex-1 space-y-3">
        <Link
          href={product.href}
          className="line-clamp-2 text-sm font-medium leading-5 hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold">
            {currencyFormatter.format(product.price)}
          </span>
          <Link
            href={product.href}
            className="border-border hover:bg-muted inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-xs font-medium transition"
          >
            Дивитись
          </Link>
        </div>
      </div>
    </div>
  );
}
