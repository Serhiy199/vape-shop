"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "lucide-react";

import type {
  StorefrontProductCardItem,
  StorefrontSelectedProductOption,
} from "@/components/storefront/product-types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-context";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";

const currencyFormatter = new Intl.NumberFormat("uk-UA", {
  currency: "UAH",
  maximumFractionDigits: 0,
  style: "currency",
});

export function ProductCardPurchaseControls({
  product,
}: {
  product: StorefrontProductCardItem;
}) {
  const { addItem } = useCart();
  const [selectedValueIds, setSelectedValueIds] = useState<
    Record<string, string>
  >(() => {
    if (!product.variantValueId) {
      return {};
    }

    const option = product.options?.find((currentOption) =>
      currentOption.values.some((value) => value.id === product.variantValueId),
    );

    return option ? { [option.id]: product.variantValueId } : {};
  });
  const [error, setError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const options = useMemo(
    () => product.options?.filter((option) => option.values.length > 0) ?? [],
    [product.options],
  );
  const selectedOptions = useMemo<StorefrontSelectedProductOption[]>(() => {
    return options.flatMap((option) => {
      const value = option.values.find(
        (currentValue) => currentValue.id === selectedValueIds[option.id],
      );

      if (!value) {
        return [];
      }

      return [
        {
          optionId: option.id,
          optionName: option.name,
          valueId: value.id,
          valueName: value.label,
          valueSlug: value.slug ?? null,
        },
      ];
    });
  }, [options, selectedValueIds]);
  const firstSelectedValue = options
    .flatMap((option) => option.values)
    .find((value) =>
      selectedOptions.some(
        (selectedOption) => selectedOption.valueId === value.id,
      ),
    );

  function handleSelectOption(optionId: string, valueId: string) {
    setSelectedValueIds((current) => ({
      ...current,
      [optionId]: valueId,
    }));
    setError(null);
  }

  function handleAddToCart() {
    const missingOption = options.find((option) => !selectedValueIds[option.id]);

    if (missingOption) {
      setError(`Оберіть ${missingOption.name}`);
      return;
    }

    addItem({
      availability: product.availability,
      imageAlt: product.imageAlt,
      imageSrc: firstSelectedValue?.image ?? product.imageSrc,
      price: product.price,
      productId: product.productId,
      selectedOptions,
      selectedOptionName: selectedOptions[0]?.optionName,
      selectedOptionValue: selectedOptions[0]?.valueName,
      selectedOptionValueId: selectedOptions[0]?.valueId,
      slug: product.slug,
      title: product.title,
    });
    setError(null);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.id} className="block space-y-1.5">
            <span className="text-foreground text-xs font-medium">
              {option.name}:
            </span>
            <select
              className="border-input bg-background h-9 w-full cursor-pointer rounded-lg border px-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={selectedValueIds[option.id] ?? ""}
              onChange={(event) =>
                handleSelectOption(option.id, event.target.value)
              }
              onClick={(event) => event.stopPropagation()}
            >
              <option value="">{`Оберіть ${option.name.toLowerCase()}`}</option>
              {option.values.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        {error ? (
          <p className="text-destructive text-xs font-medium" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-3">
        <span className="block text-right text-lg font-semibold tracking-tight">
          {currencyFormatter.format(product.price)}
        </span>

        <div className="flex items-center gap-2">
          <Button
            className="h-10 min-w-0 flex-1 cursor-pointer rounded-lg"
            onClick={(event) => {
              event.stopPropagation();
              handleAddToCart();
            }}
            type="button"
          >
            {isAdded ? (
              <CheckIcon className="size-4" />
            ) : (
              <ShoppingCartIcon className="size-4" />
            )}
            {isAdded ? "Додано" : "Додати до кошика"}
          </Button>
          <WishlistButton
            productId={product.productId}
            className="bg-background hover:bg-muted h-10 w-10 shrink-0 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
