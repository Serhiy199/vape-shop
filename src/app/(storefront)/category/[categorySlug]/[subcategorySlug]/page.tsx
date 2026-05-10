import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CatalogFilterSidebar,
  CatalogToolbar,
} from "@/components/storefront/catalog-controls";
import { CatalogTopTabs } from "@/components/storefront/catalog-top-tabs";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import {
  StorefrontBadge,
  StorefrontCard,
  StorefrontGrid,
  StorefrontPageHeader,
  StorefrontSection,
} from "@/components/storefront/storefront-primitives";
import { normalizeCatalogFilters } from "@/lib/storefront/catalog-filters";
import {
  getActiveStorefrontSubcategoryBySlug,
  getStorefrontCatalogFilterOptions,
  listActiveStorefrontProducts,
} from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

type SubcategoryPageProps = {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: SubcategoryPageProps["params"];
}): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const subcategory = await getActiveStorefrontSubcategoryBySlug({
    categorySlug,
    subcategorySlug,
  });

  if (!subcategory) {
    return {};
  }

  return {
    title: subcategory.seoTitle || subcategory.name,
    description:
      subcategory.seoDescription ||
      `Купити ${subcategory.name} в категорії ${subcategory.category.name}. Великий вибір, швидке оформлення та доставка по Україні.`,
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const filters = normalizeCatalogFilters(await searchParams);
  const routeFilters = {
    ...filters,
    categorySlug,
    subcategorySlug,
  };
  const [subcategory, filterOptions, products] = await Promise.all([
    getActiveStorefrontSubcategoryBySlug({ categorySlug, subcategorySlug }),
    getStorefrontCatalogFilterOptions({ categorySlug }),
    listActiveStorefrontProducts(routeFilters),
  ]);

  if (!subcategory) {
    notFound();
  }

  const basePath = `/category/${categorySlug}/${subcategorySlug}`;
  const brandTabs = subcategory.brands.map((brand) => ({
    count: brand._count.products,
    href: `${basePath}/${brand.slug}`,
    label: brand.name,
    value: brand.slug,
  }));

  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[
          { href: "/", label: "Головна" },
          { href: "/category", label: "Категорії" },
          {
            href: `/category/${subcategory.category.slug}`,
            label: subcategory.category.name,
          },
          { label: subcategory.name },
        ]}
        eyebrow="Підкатегорія"
        title={subcategory.name}
        description={subcategory.description ?? undefined}
      />

      {subcategory.fields.length > 0 ? (
        <StorefrontSection tone="muted" spacing="sm">
          <StorefrontGrid variant="content">
            {subcategory.fields.map((field) => (
              <StorefrontCard key={field.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold tracking-tight">
                      {field.label}
                    </h2>
                    <StorefrontBadge tone="muted">{field.type}</StorefrontBadge>
                  </div>
                  {field.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {field.options.slice(0, 6).map((option) => (
                        <span
                          key={option.id}
                          className="text-muted-foreground bg-muted rounded-md px-2.5 py-1 text-xs"
                        >
                          {option.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Це поле доступне для уточнення товарів цієї підкатегорії.
                    </p>
                  )}
                </div>
              </StorefrontCard>
            ))}
          </StorefrontGrid>
        </StorefrontSection>
      ) : null}

      <StorefrontSection>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <CatalogFilterSidebar
            basePath={basePath}
            filterOptions={filterOptions}
            filters={routeFilters}
          />
          <div className="space-y-5">
            <CatalogTopTabs items={brandTabs} />
            <CatalogToolbar
              basePath={basePath}
              count={products.length}
              filterOptions={filterOptions}
              filters={routeFilters}
              title={subcategory.name}
            />
            <StorefrontProductGrid
              products={products}
              emptyTitle="У цій підкатегорії ще немає активних товарів"
              emptyDescription="Додайте або активуйте товари цієї підкатегорії в адмін-панелі."
            />
          </div>
        </div>
      </StorefrontSection>
    </>
  );
}
