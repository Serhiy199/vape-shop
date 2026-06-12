"use client";

import { HeartIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type {
  StorefrontProductCardItem,
  StorefrontProductOption,
  StorefrontProductOptionValue,
} from "@/components/storefront/product-types";
import { currencyFormatter } from "@/components/storefront/product-card";
import {
  StorefrontBadge,
  StorefrontCard,
} from "@/components/storefront/storefront-primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductPurchaseHighlight = {
  label: string;
  value: string;
};

export function StorefrontProductPurchasePanel({
  highlights = [],
  onSelectOptionValue,
  option,
  product,
  selectedOptionValue,
}: {
  highlights?: ProductPurchaseHighlight[];
  onSelectOptionValue?: (value: StorefrontProductOptionValue) => void;
  option?: StorefrontProductOption | null;
  product: StorefrontProductCardItem;
  selectedOptionValue?: StorefrontProductOptionValue | null;
}) {
  const isAvailable = product.availability === "in_stock";
  const requiresOption = Boolean(option && option.values.length > 0);

  return (
    <StorefrontCard className="p-5 lg:sticky lg:top-40">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {product.badges?.map((badge) => (
            <StorefrontBadge
              key={badge}
              tone={
                badge === "sale" || badge === "discount"
                  ? "sale"
                  : badge === "hit"
                    ? "hit"
                    : "new"
              }
            >
              {badge === "sale"
                ? "Акція"
                : badge === "discount"
                  ? "Знижка"
                  : badge === "hit"
                    ? "Топ"
                    : "Новинка"}
            </StorefrontBadge>
          ))}
          <StorefrontBadge tone={isAvailable ? "stock" : "muted"}>
            {isAvailable ? "В наявності" : "Немає в наявності"}
          </StorefrontBadge>
        </div>

        <div className="space-y-1">
          {product.brand ? (
            <p className="text-muted-foreground text-sm">
              Виробник: {product.brand}
            </p>
          ) : null}
          <p className="text-3xl font-semibold tracking-tight">
            {currencyFormatter.format(product.price)}
          </p>
        </div>

        {option && option.values.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{option.name}</p>
              {selectedOptionValue ? (
                <span className="text-muted-foreground text-sm">
                  {selectedOptionValue.label}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,88px))] gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptionValue?.id === value.id;

                return (
                  <button
                    key={value.id}
                    className={cn(
                      "bg-background hover:border-primary/60 w-[88px] rounded-lg border text-left transition",
                      isSelected
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border/70",
                    )}
                    onClick={() => onSelectOptionValue?.(value)}
                    type="button"
                  >
                    <span className="bg-muted/70 grid h-[72px] place-items-center overflow-hidden rounded-t-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={value.image}
                        alt={value.label}
                        className="max-h-full max-w-full object-contain"
                      />
                    </span>
                    <span className="block truncate px-1.5 py-1 text-center text-[11px] font-medium leading-4">
                      {value.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
          <AddToCartButton
            className="h-12 rounded-lg"
            disabledReason={
              requiresOption && !selectedOptionValue
                ? "Оберіть продукт вище"
                : undefined
            }
            product={product}
            selectedOption={
              selectedOptionValue && option
                ? {
                    image: selectedOptionValue.image,
                    label: selectedOptionValue.label,
                    name: option.name,
                    valueId: selectedOptionValue.id,
                  }
                : null
            }
          />
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
