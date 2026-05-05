import {
  HeartIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "lucide-react";

import type { StorefrontProductCardItem } from "@/components/storefront/product-types";
import { currencyFormatter } from "@/components/storefront/product-card";
import {
  StorefrontBadge,
  StorefrontCard,
} from "@/components/storefront/storefront-primitives";
import { Button } from "@/components/ui/button";

type ProductPurchaseHighlight = {
  label: string;
  value: string;
};

export function StorefrontProductPurchasePanel({
  highlights = [],
  product,
}: {
  highlights?: ProductPurchaseHighlight[];
  product: StorefrontProductCardItem;
}) {
  const isAvailable = product.availability === "in_stock";

  return (
    <StorefrontCard className="p-5 lg:sticky lg:top-40">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {product.badges?.map((badge) => (
            <StorefrontBadge
              key={badge}
              tone={badge === "sale" ? "sale" : badge === "hit" ? "hit" : "new"}
            >
              {badge === "sale" ? "Акція" : badge === "hit" ? "Топ" : "Новинка"}
            </StorefrontBadge>
          ))}
          <StorefrontBadge tone={isAvailable ? "stock" : "muted"}>
            {isAvailable ? "В наявності" : "Немає в наявності"}
          </StorefrontBadge>
        </div>

        <div className="space-y-1">
          {product.brand ? (
            <p className="text-muted-foreground text-sm">
              Бренд: {product.brand}
            </p>
          ) : null}
          <p className="text-3xl font-semibold tracking-tight">
            {currencyFormatter.format(product.price)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
          <Button className="h-12 gap-2 rounded-lg" disabled={!isAvailable}>
            <ShoppingCartIcon className="size-5" />
            {isAvailable ? "До кошика" : "Товар недоступний"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-full rounded-lg sm:w-12 lg:w-full xl:w-12"
          >
            <HeartIcon className="size-5" />
            <span className="sr-only">Додати в обране</span>
          </Button>
        </div>

        {highlights.length > 0 ? (
          <div className="border-border/70 bg-background grid gap-2 rounded-lg border p-4">
            {highlights.map((highlight) => (
              <div
                key={`${highlight.label}-${highlight.value}`}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{highlight.label}</span>
                <span className="max-w-[55%] text-right font-medium">
                  {highlight.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="border-border/70 bg-background grid gap-3 rounded-lg border p-4 text-sm">
          <span className="inline-flex gap-3">
            <TruckIcon className="text-primary size-5 shrink-0" />
            <span>
              <strong className="block">Доставка по Україні</strong>
              <span className="text-muted-foreground">
                Детальні умови будуть підключені на checkout етапі.
              </span>
            </span>
          </span>
          <span className="inline-flex gap-3">
            <ShieldCheckIcon className="text-primary size-5 shrink-0" />
            <span>
              <strong className="block">Перевірений товар</strong>
              <span className="text-muted-foreground">
                Дані товару керуються з адмін-панелі.
              </span>
            </span>
          </span>
        </div>
      </div>
    </StorefrontCard>
  );
}
