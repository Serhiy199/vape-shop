import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CatalogFilterSidebar,
  CatalogToolbar,
} from "@/components/storefront/catalog-controls";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import {
  StorefrontPageHeader,
  StorefrontSection,
} from "@/components/storefront/storefront-primitives";
import { normalizeCatalogFilters } from "@/lib/storefront/catalog-filters";
import {
  getActiveStorefrontBrandBySlug,
  getStorefrontCatalogFilterOptions,
  listActiveStorefrontProducts,
} from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

type BrandPageProps = {
  params: Promise<{
    brandSlug: string;
    categorySlug: string;
    subcategorySlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type StorefrontBrandPageData = NonNullable<
  Awaited<ReturnType<typeof getActiveStorefrontBrandBySlug>>
>;

function resolveBrandPageTitle(brand: StorefrontBrandPageData) {
  return brand.seoTitle || `${brand.subcategory.name} ${brand.name}`;
}

export async function generateMetadata({
  params,
}: {
  params: BrandPageProps["params"];
}): Promise<Metadata> {
  const { brandSlug, categorySlug, subcategorySlug } = await params;
  const brand = await getActiveStorefrontBrandBySlug({
    brandSlug,
    categorySlug,
    subcategorySlug,
  });

  if (!brand) {
    return {};
  }

  return {
    title: resolveBrandPageTitle(brand),
    description:
      brand.seoDescription ||
      `Купити ${brand.name} в категорії ${brand.subcategory.name}. Великий вибір, швидке оформлення та доставка по Україні.`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { brandSlug, categorySlug, subcategorySlug } = await params;
  const filters = normalizeCatalogFilters(await searchParams);
  const routeFilters = {
    ...filters,
    brandSlug,
    categorySlug,
    subcategorySlug,
  };

  const [brand, filterOptions, products] = await Promise.all([
    getActiveStorefrontBrandBySlug({
      brandSlug,
      categorySlug,
      subcategorySlug,
    }),
    getStorefrontCatalogFilterOptions({ categorySlug }),
    listActiveStorefrontProducts(routeFilters),
  ]);

  if (!brand) {
    notFound();
  }

  const basePath = `/category/${categorySlug}/${subcategorySlug}/${brandSlug}`;
  const title = resolveBrandPageTitle(brand);

  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[
          { href: "/", label: "Головна" },
          {
            href: `/category/${brand.subcategory.category.slug}`,
            label: brand.subcategory.category.name,
          },
          {
            href: `/category/${brand.subcategory.category.slug}/${brand.subcategory.slug}`,
            label: brand.subcategory.name,
          },
          { label: brand.name },
        ]}
        eyebrow="Виробник"
        title={title}
        description={brand.description ?? undefined}
      />

      <StorefrontSection>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <CatalogFilterSidebar
            basePath={basePath}
            filterOptions={filterOptions}
            filters={routeFilters}
          />
          <div>
            <CatalogToolbar
              basePath={basePath}
              count={products.length}
              filterOptions={filterOptions}
              filters={routeFilters}
              title={title}
            />
            <StorefrontProductGrid
              products={products}
              emptyTitle="У цього виробника ще немає активних товарів"
              emptyDescription="Додайте або активуйте товари цього виробника в адмін-панелі."
            />
          </div>
        </div>
      </StorefrontSection>
    </>
  );
}
