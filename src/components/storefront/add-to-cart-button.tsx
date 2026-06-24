"use client";

import { useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "lucide-react";

import type {
  StorefrontProductCardItem,
  StorefrontSelectedProductOption,
} from "@/components/storefront/product-types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-context";
import { cn } from "@/lib/utils";

type SelectedCartOption = {
  image?: string;
  label: string;
  name: string;
  valueId: string;
};

function resolveVariantSelection(product: StorefrontProductCardItem) {
  if (!product.variantValueId) {
    return {
      selectedOption: null,
      selectedOptions: undefined,
    };
  }

  const option = product.options?.find((currentOption) =>
    currentOption.values.some((value) => value.id === product.variantValueId),
  );
  const value = option?.values.find(
    (currentValue) => currentValue.id === product.variantValueId,
  );

  if (!option || !value) {
    return {
      selectedOption: null,
      selectedOptions: undefined,
    };
  }

  return {
    selectedOption: {
      image: value.image ?? undefined,
      label: value.label,
      name: option.name,
      valueId: value.id,
    },
    selectedOptions: [
      {
        optionId: option.id,
        optionName: option.name,
        valueId: value.id,
        valueName: value.label,
        valueSlug: value.slug ?? null,
      },
    ],
  };
}

export function AddToCartButton({
  className,
  disabledReason,
  product,
  quantity = 1,
  selectedOption,
  selectedOptions,
  size = "default",
}: {
  className?: string;
  disabledReason?: string;
  product: StorefrontProductCardItem;
  quantity?: number;
  selectedOption?: SelectedCartOption | null;
  selectedOptions?: StorefrontSelectedProductOption[];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const isAvailable = product.availability === "in_stock";
  const isDisabled = !isAvailable || Boolean(disabledReason);
  const variantSelection = resolveVariantSelection(product);
  const resolvedSelectedOption =
    selectedOption ?? variantSelection.selectedOption;
  const resolvedSelectedOptions =
    selectedOptions ?? variantSelection.selectedOptions;

  function handleAddToCart() {
    if (isDisabled) {
      return;
    }

    addItem(
      {
        availability: product.availability,
        imageAlt: product.imageAlt,
        imageSrc: resolvedSelectedOption?.image ?? product.imageSrc,
        price: product.price,
        productId: product.productId,
        selectedOptions: resolvedSelectedOptions,
        selectedOptionName: resolvedSelectedOption?.name,
        selectedOptionValue: resolvedSelectedOption?.label,
        selectedOptionValueId: resolvedSelectedOption?.valueId,
        slug: product.slug,
        title: product.title,
      },
      quantity,
    );
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  }

  return (
    <Button
      className={cn("gap-2", className)}
      disabled={isDisabled}
      onClick={handleAddToCart}
      size={size}
      type="button"
      variant={isDisabled ? "outline" : "default"}
    >
      {isAdded ? (
        <CheckIcon className="size-4" />
      ) : (
        <ShoppingCartIcon className="size-4" />
      )}
      {isAvailable
        ? disabledReason || (isAdded ? "Додано" : "Додати до кошика")
        : "Товар недоступний"}
    </Button>
  );
}
