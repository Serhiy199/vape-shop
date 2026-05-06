"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-context";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("uk-UA", {
  currency: "UAH",
  maximumFractionDigits: 0,
  style: "currency",
});

export function StorefrontCartLink({
  className,
  showTotal = true,
}: {
  className?: string;
  showTotal?: boolean;
}) {
  const { isHydrated, itemCount, totalAmount } = useCart();
  const visibleItemCount = isHydrated ? itemCount : 0;
  const visibleTotalAmount = isHydrated ? totalAmount : 0;

  return (
    <Link
      href="/cart"
      className={cn(
        buttonVariants({ variant: "default" }),
        "relative h-11 gap-2 rounded-lg px-3 sm:px-4",
        className,
      )}
    >
      <ShoppingBagIcon className="size-4" />
      <span className={cn(!showTotal && "sr-only", "sm:inline")}>
        {showTotal ? currencyFormatter.format(visibleTotalAmount) : "Кошик"}
      </span>
      <Badge className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full p-0 text-[10px]">
        {visibleItemCount}
      </Badge>
    </Link>
  );
}
