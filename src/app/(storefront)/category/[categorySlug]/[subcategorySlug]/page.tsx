import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CatalogFilterSidebar,
  CatalogToolbar,
} from "@/components/storefront/catalog-controls";
import { CatalogTopTabs } from "@/components/storefront/catalog-top-tabs";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import { SafeRichTextContent } from "@/components/storefront/safe-rich-text-content";
import {
  StorefrontCard,
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
        tone="catalog"
        className="border-b-0"
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
        summary={`Знайдено товарів: ${products.length}`}
      />

      <StorefrontSection tone="catalog" spacing="sm" className="pt-0">
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
              filterOptions={filterOptions}
              filters={routeFilters}
            />
            <StorefrontProductGrid
              products={products}
              emptyTitle="У цій підкатегорії ще немає активних товарів"
              emptyDescription="Додайте або активуйте товари цієї підкатегорії в адмін-панелі."
            />
            {subcategory.description ? (
              <StorefrontCard className="p-5">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Опис підкатегорії
                  </h2>
                  <SafeRichTextContent html={subcategory.description} />
                </div>
              </StorefrontCard>
            ) : null}
          </div>
        </div>
      </StorefrontSection>
    </>
  );
}
