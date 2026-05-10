import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CatalogFilterSidebar,
  CatalogToolbar,
} from "@/components/storefront/catalog-controls";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import {
  StorefrontActionLink,
  StorefrontCard,
  StorefrontGrid,
  StorefrontPageHeader,
  StorefrontSection,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { normalizeCatalogFilters } from "@/lib/storefront/catalog-filters";
import {
  getActiveStorefrontCategoryBySlug,
  getActiveStorefrontCategoryWithSubcategoriesBySlug,
  getStorefrontCatalogFilterOptions,
  listActiveStorefrontProducts,
} from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: CategoryPageProps["params"];
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category =
    await getActiveStorefrontCategoryWithSubcategoriesBySlug(categorySlug);

  if (!category) {
    return {};
  }

  return {
    title: category.seoTitle || category.name,
    description:
      category.seoDescription ||
      `Купити ${category.name} в інтернет-магазині. Великий вибір, швидке оформлення та доставка по Україні.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const filters = normalizeCatalogFilters(await searchParams);
  const routeFilters = {
    ...filters,
    categorySlug,
  };
  const [category, filterOptions, products] = await Promise.all([
    getActiveStorefrontCategoryBySlug(categorySlug),
    getStorefrontCatalogFilterOptions({ categorySlug }),
    listActiveStorefrontProducts(routeFilters),
  ]);

  if (!category) {
    notFound();
  }

  const basePath = `/category/${categorySlug}`;

  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[
          { href: "/", label: "Головна" },
          { href: "/category", label: "Категорії" },
          { label: category.label },
        ]}
        eyebrow="Категорія"
        title={category.label}
        description={category.description}
        actions={
          <StorefrontActionLink
            href="/catalog"
            variant="outline"
            size="default"
          >
            Увесь каталог
          </StorefrontActionLink>
        }
      />

      <StorefrontSection tone="muted" spacing="sm">
        <StorefrontGrid variant="content">
          {category.links.map((link) => (
            <StorefrontCard key={link.href} interactive className="p-4">
              <Link href={link.href} className="space-y-2">
                <h2 className="font-semibold tracking-tight">{link.label}</h2>
                <p className={storefrontPatterns.bodyText}>
                  Перейти до підкатегорії та переглянути доступні товари.
                </p>
              </Link>
            </StorefrontCard>
          ))}
        </StorefrontGrid>
      </StorefrontSection>

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
              title={category.label}
            />
            <StorefrontProductGrid
              products={products}
              emptyTitle="У цій категорії ще немає активних товарів"
              emptyDescription="Додайте або активуйте товари цієї категорії в адмін-панелі."
            />
          </div>
        </div>
      </StorefrontSection>
    </>
  );
}
