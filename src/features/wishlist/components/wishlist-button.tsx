"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleWishlistAction } from "@/features/account/actions/account";
import { cn } from "@/lib/utils";

export function WishlistButton({
  className,
  productId,
  size = "icon",
}: {
  className?: string;
  productId: string;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setMessage(null);
    startTransition(() => {
      void toggleWishlistAction(productId).then((result) => {
        if (!result.ok) {
          setMessage(result.error);
          return;
        }

        setIsWishlisted(result.isWishlisted);
        setMessage(result.message);
        window.setTimeout(() => setMessage(null), 1800);
      });
    });
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size={size}
        className={cn("cursor-pointer rounded-lg", className)}
        aria-label="Додати товар в обране"
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        <HeartIcon
          className={cn("size-4", isWishlisted && "fill-primary text-primary")}
        />
      </Button>
      {message ? (
        <div className="border-border/70 bg-popover text-popover-foreground absolute right-0 z-20 mt-2 w-64 rounded-lg border p-3 text-sm shadow-lg">
          <p>{message}</p>
          {message.includes("увійдіть") ? (
            <Link className="text-primary mt-2 inline-block font-medium" href="/login">
              Увійти в акаунт
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
