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

  function handleAddToCart() {
    if (isDisabled) {
      return;
    }

    addItem(
      {
        availability: product.availability,
        imageAlt: product.imageAlt,
        imageSrc: selectedOption?.image ?? product.imageSrc,
        price: product.price,
        productId: product.productId,
        selectedOptions,
        selectedOptionName: selectedOption?.name,
        selectedOptionValue: selectedOption?.label,
        selectedOptionValueId: selectedOption?.valueId,
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
