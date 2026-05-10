import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import type { StorefrontCategory } from "@/components/storefront/storefront-config";
import {
  StorefrontBadge,
  StorefrontCard,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { cn } from "@/lib/utils";

const toneClasses: Record<StorefrontCategory["tone"], string> = {
  amber: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  green: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  rose: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
  slate: "bg-slate-500/10 text-slate-700 ring-slate-500/20",
};

export function StorefrontCategoryCard({
  category,
}: {
  category: StorefrontCategory;
}) {
  const Icon = category.icon;

  return (
    <StorefrontCard interactive className="group/card min-h-full p-4">
      <Link href={category.href} className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid size-12 place-items-center rounded-lg ring-1",
              toneClasses[category.tone],
            )}
          >
            <Icon className="size-6" />
          </span>
          <StorefrontBadge tone="muted">{category.stat}</StorefrontBadge>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{category.label}</h3>
          {category.description ? (
            <p className={storefrontPatterns.bodyText}>
              {category.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            {category.links.map((link) => (
              <span
                key={link.href}
                className="text-muted-foreground rounded-md bg-muted px-2.5 py-1 text-xs"
              >
                {link.label}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            Перейти в категорію
            <ArrowRightIcon className="size-4 transition group-hover/card:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </StorefrontCard>
  );
}
