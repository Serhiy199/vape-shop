"use client";

import { useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "lucide-react";

import type { StorefrontProductCardItem } from "@/components/storefront/product-types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-context";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  className,
  product,
  quantity = 1,
  size = "default",
}: {
  className?: string;
  product: StorefrontProductCardItem;
  quantity?: number;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const isAvailable = product.availability === "in_stock";

  function handleAddToCart() {
    if (!isAvailable) {
      return;
    }

    addItem(
      {
        availability: product.availability,
        imageAlt: product.imageAlt,
        imageSrc: product.imageSrc,
        price: product.price,
        productId: product.id,
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
      disabled={!isAvailable}
      onClick={handleAddToCart}
      size={size}
      type="button"
      variant={isAvailable ? "default" : "outline"}
    >
      {isAdded ? (
        <CheckIcon className="size-4" />
      ) : (
        <ShoppingCartIcon className="size-4" />
      )}
      {isAvailable ? (isAdded ? "Додано" : "До кошика") : "Товар недоступний"}
    </Button>
  );
}
