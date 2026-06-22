"use client";

import { StarIcon } from "lucide-react";
import Link from "next/link";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { currencyFormatter } from "@/components/storefront/product-card";
import { ProductRecommendationsStrip } from "@/components/storefront/product-recommendations-strip";
import type {
  StorefrontProductCardItem,
  StorefrontProductOption,
  StorefrontProductOptionValue,
  StorefrontSelectedProductOption,
} from "@/components/storefront/product-types";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import {
  StorefrontBadge,
  StorefrontCard,
} from "@/components/storefront/storefront-primitives";
import { cn } from "@/lib/utils";

export function StorefrontProductPurchasePanel({
  companionProducts = [],
  onSelectOptionValue,
  otherModelProducts = [],
  options = [],
  product,
  selectedOptionValue,
  selectedOptionValues = {},
  selectedOptions = [],
  title,
}: {
  companionProducts?: StorefrontProductCardItem[];
  onSelectOptionValue?: (
    option: StorefrontProductOption,
    value: StorefrontProductOptionValue,
  ) => void;
  otherModelProducts?: StorefrontProductCardItem[];
  options?: StorefrontProductOption[];
  product: StorefrontProductCardItem;
  selectedOptionValue?: StorefrontProductOptionValue | null;
  selectedOptionValues?: Record<string, StorefrontProductOptionValue>;
  selectedOptions?: StorefrontSelectedProductOption[];
  title: string;
}) {
  const isAvailable = product.availability === "in_stock";
  const firstOption = options[0] ?? null;
  const requiresOption = options.some((option) => option.values.length > 0);

  return (
    <StorefrontCard className="p-5">
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

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {title}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1">
              <StarIcon className="size-4 fill-primary text-primary" />
              5/5
            </span>
            {product.brand ? <span>Виробник: {product.brand}</span> : null}
          </div>
        </div>

        {options.map((option) =>
          option.values.length > 0 ? (
            <ProductOptionPicker
              key={option.id}
              isSeoOption={option.id === firstOption?.id}
              option={option}
              selectedValue={selectedOptionValues[option.id] ?? null}
              onSelectOptionValue={onSelectOptionValue}
            />
          ) : null,
        )}

        <p className="text-3xl font-semibold tracking-tight">
          {currencyFormatter.format(product.price)}
        </p>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
          <AddToCartButton
            className="h-12 rounded-lg"
            disabledReason={
              requiresOption && selectedOptions.length === 0
                ? "Оберіть продукт вище"
                : undefined
            }
            product={product}
            selectedOption={
              selectedOptionValue && firstOption
                ? {
                    image: selectedOptionValue.image ?? undefined,
                    label: selectedOptionValue.label,
                    name: firstOption.name,
                    valueId: selectedOptionValue.id,
                  }
                : null
            }
            selectedOptions={selectedOptions}
          />
          <WishlistButton
            productId={product.id}
            className="h-12 w-full sm:w-12 lg:w-full xl:w-12"
          />
        </div>

        <ProductRecommendationsStrip
          className="shadow-none"
          products={otherModelProducts}
          title="Інші моделі"
        />
        <ProductRecommendationsStrip
          className="shadow-none"
          products={companionProducts}
          title="Супутні товари"
        />
      </div>
    </StorefrontCard>
  );
}

function ProductOptionPicker({
  isSeoOption = false,
  onSelectOptionValue,
  option,
  selectedValue,
}: {
  isSeoOption?: boolean;
  onSelectOptionValue?: (
    option: StorefrontProductOption,
    value: StorefrontProductOptionValue,
  ) => void;
  option: StorefrontProductOption;
  selectedValue?: StorefrontProductOptionValue | null;
}) {
  const optionListClassName =
    option.displayType === "BUTTONS"
      ? "flex flex-wrap gap-2"
      : "grid grid-cols-[repeat(auto-fill,minmax(88px,88px))] gap-2";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{option.name}</p>
        {selectedValue ? (
          <span className="text-muted-foreground text-sm">
            {selectedValue.label}
          </span>
        ) : null}
      </div>

      {option.displayType === "SELECT" && !isSeoOption ? (
        <select
          className="border-input bg-background h-11 w-full rounded-lg border px-3 text-sm"
          value={selectedValue?.id ?? ""}
          onChange={(event) => {
            const value = option.values.find(
              (current) => current.id === event.target.value,
            );

            if (value) {
              onSelectOptionValue?.(option, value);
            }
          }}
        >
          {option.values.map((value) => (
            <option key={value.id} value={value.id}>
              {value.label}
            </option>
          ))}
        </select>
      ) : isSeoOption ? (
        <ul className={optionListClassName}>
          {option.values.map((value) => {
            const isSelected = selectedValue?.id === value.id;
            const href = value.slug ? `/product/${value.slug}` : null;

            if (option.displayType === "BUTTONS") {
              return (
                <li key={value.id}>
                  {href ? (
                    <Link
                      aria-current={isSelected ? "page" : undefined}
                      className={cn(
                        "bg-background hover:border-primary/60 block rounded-lg border px-3 py-2 text-sm font-medium transition",
                        isSelected
                          ? "border-primary ring-primary/20 ring-2"
                          : "border-border/70",
                      )}
                      href={href}
                    >
                      {value.label}
                    </Link>
                  ) : (
                    <button
                      className={cn(
                        "bg-background hover:border-primary/60 rounded-lg border px-3 py-2 text-sm font-medium transition",
                        isSelected
                          ? "border-primary ring-primary/20 ring-2"
                          : "border-border/70",
                      )}
                      onClick={() => onSelectOptionValue?.(option, value)}
                      type="button"
                    >
                      {value.label}
                    </button>
                  )}
                </li>
              );
            }

            return (
              <li key={value.id}>
                {href ? (
                  <Link
                    aria-current={isSelected ? "page" : undefined}
                    className={cn(
                      "bg-background hover:border-primary/60 block w-[88px] rounded-lg border text-left transition",
                      isSelected
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border/70",
                    )}
                    href={href}
                  >
                    <ProductOptionImageValue value={value} />
                  </Link>
                ) : (
                  <button
                    className={cn(
                      "bg-background hover:border-primary/60 w-[88px] rounded-lg border text-left transition",
                      isSelected
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border/70",
                    )}
                    onClick={() => onSelectOptionValue?.(option, value)}
                    type="button"
                  >
                    <ProductOptionImageValue value={value} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={optionListClassName}>
          {option.values.map((value) => {
            const isSelected = selectedValue?.id === value.id;

            if (option.displayType === "BUTTONS") {
              return (
                <button
                  key={value.id}
                  className={cn(
                    "bg-background hover:border-primary/60 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    isSelected
                      ? "border-primary ring-primary/20 ring-2"
                      : "border-border/70",
                  )}
                  onClick={() => onSelectOptionValue?.(option, value)}
                  type="button"
                >
                  {value.label}
                </button>
              );
            }

            return (
              <button
                key={value.id}
                className={cn(
                  "bg-background hover:border-primary/60 w-[88px] rounded-lg border text-left transition",
                  isSelected
                    ? "border-primary ring-primary/20 ring-2"
                    : "border-border/70",
                )}
                onClick={() => onSelectOptionValue?.(option, value)}
                type="button"
              >
                <ProductOptionImageValue value={value} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductOptionImageValue({
  value,
}: {
  value: StorefrontProductOptionValue;
}) {
  return (
    <>
      <span className="bg-muted/70 grid h-[72px] place-items-center overflow-hidden rounded-t-lg">
        {value.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.image}
            alt={value.label}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="px-2 text-center text-xs font-medium">
            {value.label}
          </span>
        )}
      </span>
      <span className="block truncate px-1.5 py-1 text-center text-[11px] font-medium leading-4">
        {value.label}
      </span>
    </>
  );
}
