import Link from "next/link";
import { ImageIcon, StarIcon } from "lucide-react";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type {
  StorefrontProductBadge,
  StorefrontProductCardItem,
} from "@/components/storefront/product-types";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import {
  StorefrontBadge,
  StorefrontCard,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { cn } from "@/lib/utils";

const badgeLabels: Record<StorefrontProductBadge, string> = {
  hit: "Топ",
  new: "Новинка",
  sale: "Акція",
  discount: "Знижка",
};

const badgeTones: Record<
  StorefrontProductBadge,
  React.ComponentProps<typeof StorefrontBadge>["tone"]
> = {
  hit: "hit",
  new: "new",
  sale: "sale",
  discount: "sale",
};

export const currencyFormatter = new Intl.NumberFormat("uk-UA", {
  currency: "UAH",
  maximumFractionDigits: 0,
  style: "currency",
});

export function StorefrontProductCard({
  product,
}: {
  product: StorefrontProductCardItem;
}) {
  const isAvailable = product.availability === "in_stock";

  return (
    <StorefrontCard interactive className="group/card h-full p-3 sm:p-4">
      <div className="flex h-full flex-col gap-3">
        <div className="relative">
          <Link
            href={product.href}
            className="bg-muted/70 grid aspect-square place-items-center overflow-hidden rounded-lg"
            aria-label={product.title}
          >
            {product.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageSrc}
                alt={product.imageAlt ?? product.title}
                className="h-full w-full object-cover transition duration-300 group-hover/card:scale-[1.03]"
              />
            ) : (
              <span className="bg-card text-muted-foreground grid size-16 place-items-center rounded-lg shadow-sm">
                <ImageIcon className="size-8" />
              </span>
            )}
          </Link>

          {product.badges?.length ? (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
              {product.badges.map((badge) => (
                <StorefrontBadge key={badge} tone={badgeTones[badge]}>
                  {badgeLabels[badge]}
                </StorefrontBadge>
              ))}
            </div>
          ) : null}

          <WishlistButton
            productId={product.id}
            className="bg-card/90 absolute top-2 right-2 size-9"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground truncate text-xs font-medium tracking-[0.12em] uppercase">
                {product.brand ?? "Voodoo"}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  isAvailable
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isAvailable ? "В наявності" : "Немає"}
              </span>
            </div>

            <Link
              href={product.href}
              className={storefrontPatterns.productTitle}
            >
              {product.title}
            </Link>

            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating?.toFixed(1) ?? "5.0"}</span>
              <span>·</span>
              <span>{product.reviewCount ?? 0} відгуків</span>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <span className={storefrontPatterns.price}>
              {currencyFormatter.format(product.price)}
            </span>

            {isAvailable ? (
              <AddToCartButton
                className="h-10 w-full rounded-lg"
                product={product}
              />
            ) : (
              <Link
                href={product.href}
                className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-10 w-full items-center justify-center rounded-lg border px-3 text-sm font-medium transition"
              >
                Детальніше
              </Link>
            )}
          </div>
        </div>
      </div>
    </StorefrontCard>
  );
}
