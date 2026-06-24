"use client";

import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CatalogTopTabItem = {
  count?: number;
  href: string;
  label: string;
  value: string;
};

type CatalogTopTabsProps = {
  activeValue?: string;
  className?: string;
  initialVisibleCount?: number;
  items: readonly CatalogTopTabItem[];
  showCount?: boolean;
};

export function CatalogTopTabs({
  activeValue,
  className,
  initialVisibleCount = 5,
  items,
  showCount = true,
}: CatalogTopTabsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOverflow = items.length > initialVisibleCount;
  const visibleItems = isExpanded ? items : items.slice(0, initialVisibleCount);

  if (!items.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border/70 bg-card overflow-hidden rounded-lg border shadow-sm",
        className,
      )}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {visibleItems.map((item) => {
          const isActive = item.value === activeValue;

          return (
            <Link
              key={item.value}
              href={item.href}
              className={cn(
                "border-border/70 hover:bg-muted/60 flex min-h-11 items-center justify-center border-b border-r px-3 py-2 text-center text-sm font-medium transition last:border-r-0",
                isActive && "text-primary",
              )}
            >
              <span className="min-w-0 truncate">{item.label}</span>
              {showCount && typeof item.count === "number" ? (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({item.count})
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {hasOverflow ? (
        <div className="flex justify-center border-t border-border/70 bg-card">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full rounded-none"
            onClick={() => setIsExpanded((current) => !current)}
          >
            Подивитись увесь список
            {isExpanded ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
