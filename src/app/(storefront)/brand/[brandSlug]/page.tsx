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
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type StorefrontBrandPageData = NonNullable<
  Awaited<ReturnType<typeof getActiveStorefrontBrandBySlug>>
>;

function resolveBrandPageTitle(brand: StorefrontBrandPageData) {
  return brand.seoTitle || brand.name;
}

function resolveBrandPageDescription(brand: StorefrontBrandPageData) {
  return (
    brand.seoDescription ||
    `Купити ${brand.name} в інтернет-магазині Voodoo Vape Shop. Великий вибір, швидке оформлення та доставка по Україні.`
  );
}

export async function generateMetadata({
  params,
}: {
  params: BrandPageProps["params"];
}): Promise<Metadata> {
  const { brandSlug } = await params;
  const brand = await getActiveStorefrontBrandBySlug({ brandSlug });

  if (!brand) {
    return {};
  }

  return {
    title: resolveBrandPageTitle(brand),
    description: resolveBrandPageDescription(brand),
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { brandSlug } = await params;
  const filters = normalizeCatalogFilters(await searchParams);
  const routeFilters = {
    ...filters,
    brandSlug,
  };

  const [brand, filterOptions, products] = await Promise.all([
    getActiveStorefrontBrandBySlug({ brandSlug }),
    getStorefrontCatalogFilterOptions(),
    listActiveStorefrontProducts(routeFilters),
  ]);

  if (!brand) {
    notFound();
  }

  const basePath = `/brand/${brandSlug}`;
  const title = resolveBrandPageTitle(brand);

  return (
    <>
      <StorefrontPageHeader
        tone="catalog"
        className="border-b-0"
        breadcrumbs={[
          { href: "/", label: "Головна" },
          { href: "/catalog", label: "Каталог" },
          { label: brand.name },
        ]}
        eyebrow="Виробник"
        title={title}
        summary={`Знайдено товарів: ${products.length}`}
        description={brand.description ?? undefined}
      />

      <StorefrontSection tone="catalog" spacing="sm" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <CatalogFilterSidebar
            basePath={basePath}
            filterOptions={filterOptions}
            filters={routeFilters}
          />
          <div className="space-y-5">
            <CatalogToolbar
              basePath={basePath}
              filterOptions={filterOptions}
              filters={routeFilters}
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
