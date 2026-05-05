"use client";

import Link from "next/link";
import { CheckIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import { StorefrontSearchForm } from "@/components/storefront/storefront-search-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  catalogAvailabilityOptions,
  catalogBadgeOptions,
  catalogBrandOptions,
  catalogPriceRangeOptions,
  catalogSortOptions,
  hasActiveCatalogFilters,
  type CatalogFilterState,
  type CatalogOption,
} from "@/lib/storefront/catalog-filters";
import { cn } from "@/lib/utils";

type CatalogControlsProps = {
  basePath: string;
  count: number;
  filters: CatalogFilterState;
  filterOptions?: CatalogFilterOptions;
  title?: string;
};

type CatalogFilterOptions = {
  brands: readonly CatalogOption[];
  categories: readonly CatalogOption[];
  subcategories: readonly CatalogOption[];
};

type FilterParamKey =
  | "availability"
  | "badge"
  | "brand"
  | "category"
  | "price"
  | "search"
  | "sort"
  | "subcategory";

const paramNameByFilter = {
  availability: "availability",
  badge: "badge",
  brandSlug: "brand",
  categorySlug: "category",
  priceRange: "price",
  search: "search",
  sort: "sort",
  subcategorySlug: "subcategory",
} as const;

const defaultFilterOptions: CatalogFilterOptions = {
  brands: catalogBrandOptions,
  categories: [],
  subcategories: [],
};

type FilterGroup = {
  key:
    | "availability"
    | "badge"
    | "brandSlug"
    | "categorySlug"
    | "priceRange"
    | "subcategorySlug";
  label: string;
  options: readonly CatalogOption[];
};

function resolveFilterGroups(
  filterOptions: CatalogFilterOptions,
): FilterGroup[] {
  const groups: FilterGroup[] = [
    {
      key: "availability",
      label: "Наявність",
      options: catalogAvailabilityOptions,
    },
    {
      key: "badge",
      label: "Добірка",
      options: catalogBadgeOptions,
    },
    {
      key: "priceRange",
      label: "Ціна",
      options: catalogPriceRangeOptions,
    },
    {
      key: "categorySlug",
      label: "Категорія",
      options: filterOptions.categories,
    },
    {
      key: "subcategorySlug",
      label: "Підкатегорія",
      options: filterOptions.subcategories,
    },
    {
      key: "brandSlug",
      label: "Бренд",
      options: filterOptions.brands,
    },
  ];

  return groups.filter((group) => group.options.length > 0);
}

function filtersToParams(filters: CatalogFilterState) {
  const params = new URLSearchParams();

  Object.entries(paramNameByFilter).forEach(([filterKey, paramKey]) => {
    const value = filters[filterKey as keyof CatalogFilterState];

    if (value) {
      params.set(paramKey, value);
    }
  });

  return params;
}

function createCatalogHref(
  basePath: string,
  filters: CatalogFilterState,
  updates: Partial<Record<FilterParamKey, string | undefined>>,
) {
  const params = filtersToParams(filters);

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function getActiveValue(filters: CatalogFilterState, key: FilterGroup["key"]) {
  return filters[key];
}

function optionHref(
  basePath: string,
  filters: CatalogFilterState,
  key: FilterGroup["key"],
  option: CatalogOption,
) {
  const paramKey = paramNameByFilter[key];
  const value = option.value;
  const isActive = getActiveValue(filters, key) === value;

  const updates: Partial<Record<FilterParamKey, string | undefined>> = {
    [paramKey]: isActive ? undefined : value,
  };

  if (key === "categorySlug") {
    updates.subcategory = undefined;
  }

  if (key === "subcategorySlug" && option.parentSlug) {
    updates.category = option.parentSlug;
  }

  return createCatalogHref(basePath, filters, updates);
}

function findOptionLabel(
  options: readonly CatalogOption[],
  value: string | undefined,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function selectedFilterLabels(
  filters: CatalogFilterState,
  filterOptions: CatalogFilterOptions = defaultFilterOptions,
) {
  const labels: Array<{
    key: FilterParamKey;
    label: string;
  }> = [];

  if (filters.search) {
    labels.push({ key: "search", label: `Пошук: ${filters.search}` });
  }

  if (filters.availability) {
    labels.push({
      key: "availability",
      label:
        catalogAvailabilityOptions.find(
          (option) => option.value === filters.availability,
        )?.label ?? filters.availability,
    });
  }

  if (filters.badge) {
    labels.push({
      key: "badge",
      label:
        catalogBadgeOptions.find((option) => option.value === filters.badge)
          ?.label ?? filters.badge,
    });
  }

  if (filters.priceRange) {
    labels.push({
      key: "price",
      label:
        catalogPriceRangeOptions.find(
          (option) => option.value === filters.priceRange,
        )?.label ?? filters.priceRange,
    });
  }

  if (filters.brandSlug) {
    labels.push({
      key: "brand",
      label:
        findOptionLabel(filterOptions.brands, filters.brandSlug) ??
        filters.brandSlug,
    });
  }

  if (filters.categorySlug) {
    labels.push({
      key: "category",
      label: `Категорія: ${
        findOptionLabel(filterOptions.categories, filters.categorySlug) ??
        filters.categorySlug
      }`,
    });
  }

  if (filters.subcategorySlug) {
    labels.push({
      key: "subcategory",
      label: `Підкатегорія: ${
        findOptionLabel(filterOptions.subcategories, filters.subcategorySlug) ??
        filters.subcategorySlug
      }`,
    });
  }

  if (filters.sort) {
    labels.push({
      key: "sort",
      label:
        catalogSortOptions.find((option) => option.value === filters.sort)
          ?.label ?? filters.sort,
    });
  }

  return labels;
}

export function CatalogToolbar({
  basePath,
  count,
  filterOptions = defaultFilterOptions,
  filters,
  title = "Товари",
}: CatalogControlsProps) {
  const activeLabels = selectedFilterLabels(filters, filterOptions);

  return (
    <div className="border-border/70 bg-card mb-5 space-y-3 rounded-lg border p-3 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">
            {count} товарів у добірці
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <StorefrontSearchForm
            action={basePath}
            className="min-w-0 sm:w-80"
            defaultValue={filters.search}
            hiddenParams={{
              availability: filters.availability,
              badge: filters.badge,
              brand: filters.brandSlug,
              category: filters.categorySlug,
              price: filters.priceRange,
              sort: filters.sort,
              subcategory: filters.subcategorySlug,
            }}
            placeholder="Пошук у каталозі"
            submitLabel="OK"
          />
          <div className="flex flex-wrap gap-2">
            <MobileFiltersButton
              basePath={basePath}
              filterOptions={filterOptions}
              filters={filters}
            />
            <SortLink basePath={basePath} filters={filters} />
          </div>
        </div>
      </div>

      {activeLabels.length > 0 ? (
        <div className="border-border/70 flex flex-wrap items-center gap-2 border-t pt-3">
          {activeLabels.map((item) => (
            <Link
              key={`${item.key}-${item.label}`}
              href={createCatalogHref(basePath, filters, {
                [item.key]: undefined,
              })}
              className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition"
            >
              {item.label}
              <XIcon className="size-3" />
            </Link>
          ))}
          <Link
            href={basePath}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 rounded-full",
            )}
          >
            Очистити все
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function CatalogFilterSidebar({
  basePath,
  filterOptions = defaultFilterOptions,
  filters,
}: Pick<CatalogControlsProps, "basePath" | "filterOptions" | "filters">) {
  return (
    <aside className="hidden lg:block">
      <div className="border-border/70 bg-card sticky top-40 rounded-lg border p-4 shadow-sm">
        <CatalogFilterContent
          basePath={basePath}
          filterOptions={filterOptions}
          filters={filters}
        />
      </div>
    </aside>
  );
}

function MobileFiltersButton({
  basePath,
  filterOptions,
  filters,
}: Pick<CatalogControlsProps, "basePath" | "filterOptions" | "filters">) {
  const hasFilters = hasActiveCatalogFilters(filters);
  const activeFilterCount = selectedFilterLabels(filters, filterOptions).length;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-10 rounded-lg lg:hidden" />
        }
      >
        <SlidersHorizontalIcon className="size-4" />
        Фільтри
        {hasFilters ? (
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full text-[10px]">
            {activeFilterCount}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Фільтри каталогу</SheetTitle>
          <SheetDescription>
            Уточніть добірку за наявністю, ціною, брендом і типом товарів.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <CatalogFilterContent
            basePath={basePath}
            filterOptions={filterOptions}
            filters={filters}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SortLink({
  basePath,
  filters,
}: Pick<CatalogControlsProps, "basePath" | "filters">) {
  const currentSort = filters.sort ?? "newest";
  const nextSort = currentSort === "popular" ? "newest" : "popular";
  const label =
    catalogSortOptions.find((option) => option.value === currentSort)?.label ??
    "Нові надходження";

  return (
    <Link
      href={createCatalogHref(basePath, filters, { sort: nextSort })}
      className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-lg")}
    >
      {label}
    </Link>
  );
}

function CatalogFilterContent({
  basePath,
  filterOptions = defaultFilterOptions,
  filters,
}: Pick<CatalogControlsProps, "basePath" | "filterOptions" | "filters">) {
  const filterGroups = resolveFilterGroups(filterOptions);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">Фільтри</h2>
        <Link
          href={basePath}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-8 rounded-lg",
          )}
        >
          Очистити
        </Link>
      </div>

      <Separator />

      {filterGroups.map((group) => (
        <div key={group.label} className="space-y-3">
          <h3 className="text-sm font-medium">{group.label}</h3>
          <div className="grid gap-2">
            {group.options.map((option) => {
              const isActive =
                getActiveValue(filters, group.key) === option.value;

              return (
                <Link
                  key={option.value}
                  href={optionHref(basePath, filters, group.key, option)}
                  className={cn(
                    "text-muted-foreground hover:text-foreground border-border/70 bg-background hover:border-primary/30 flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
                    isActive && "border-primary/50 bg-primary/10 text-primary",
                  )}
                >
                  <span>
                    {option.label}
                    {typeof option.count === "number" ? (
                      <span className="text-muted-foreground ml-1">
                        ({option.count})
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "border-border grid size-4 place-items-center rounded-full border",
                      isActive &&
                        "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {isActive ? <CheckIcon className="size-3" /> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Сортування</h3>
        <div className="grid gap-2">
          {catalogSortOptions.map((option) => {
            const isActive = (filters.sort ?? "newest") === option.value;

            return (
              <Link
                key={option.value}
                href={createCatalogHref(basePath, filters, {
                  sort: isActive && filters.sort ? undefined : option.value,
                })}
                className={cn(
                  "text-muted-foreground hover:text-foreground border-border/70 bg-background hover:border-primary/30 flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
                  isActive && "border-primary/50 bg-primary/10 text-primary",
                )}
              >
                <span>{option.label}</span>
                <span
                  className={cn(
                    "border-border grid size-4 place-items-center rounded-full border",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isActive ? <CheckIcon className="size-3" /> : null}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
