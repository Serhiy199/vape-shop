"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { repeatOrderAction } from "@/features/account/actions/account";
import { useCart } from "@/features/cart/cart-context";

export function RepeatOrderButton({
  className,
  orderId,
}: {
  className?: string;
  orderId: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRepeatOrder() {
    setMessage(null);
    startTransition(() => {
      void repeatOrderAction(orderId).then((result) => {
        if (!result.ok) {
          setMessage(result.error);
          return;
        }

        result.addedItems.forEach((item) => {
          const { quantity, ...product } = item;
          addItem(product, quantity);
        });
        router.push(`/cart?repeatOrder=${orderId}`);
      });
    });
  }

  return (
    <div className="space-y-2">
      <Button
        className={className}
        disabled={isPending}
        onClick={handleRepeatOrder}
        type="button"
        variant="outline"
      >
        <RotateCcwIcon className="size-4" />
        Повторити замовлення
      </Button>
      {message ? <p className="text-destructive text-sm">{message}</p> : null}
    </div>
  );
}
