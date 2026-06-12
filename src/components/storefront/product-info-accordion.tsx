"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { cn } from "@/lib/utils";

type ProductInfoAccordionProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  title: string;
};

export function ProductInfoAccordion({
  children,
  defaultOpen = false,
  title,
}: ProductInfoAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <StorefrontCard className="overflow-hidden p-0">
      <button
        type="button"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold transition hover:bg-muted/40 sm:px-6"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{title}</span>
        <span
          className={cn(
            "border-border bg-background inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition",
            isOpen && "border-primary text-primary",
          )}
        >
          <ChevronDownIcon
            className={cn("size-4 transition-transform", isOpen && "rotate-180")}
          />
        </span>
      </button>
      {isOpen ? (
        <div className="border-border/70 border-t px-5 py-6 sm:px-8">
          <div className="text-foreground space-y-4 text-sm leading-6 sm:text-base">
            {children}
          </div>
        </div>
      ) : null}
    </StorefrontCard>
  );
}
