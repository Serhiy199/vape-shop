"use client";

import { useTransition } from "react";
import { TrashIcon } from "lucide-react";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type { StorefrontProductCardItem } from "@/components/storefront/product-types";
import { Button } from "@/components/ui/button";
import { removeWishlistItemAction } from "@/features/account/actions/account";

export function WishlistProductActions({
  product,
}: {
  product: StorefrontProductCardItem;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const formData = new FormData();
    formData.set("productId", product.id);
    startTransition(() => {
      void removeWishlistItemAction(formData);
    });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <AddToCartButton product={product} className="rounded-lg" />
      <Button
        className="gap-2 rounded-lg"
        disabled={isPending}
        onClick={handleRemove}
        type="button"
        variant="outline"
      >
        <TrashIcon className="size-4" />
        Видалити
      </Button>
    </div>
  );
}
