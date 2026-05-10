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
  getStorefrontCatalogFilterOptions,
  listActiveStorefrontProducts,
} from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const filters = normalizeCatalogFilters(await searchParams);
  const [filterOptions, products] = await Promise.all([
    getStorefrontCatalogFilterOptions({
      categorySlug: filters.categorySlug,
    }),
    listActiveStorefrontProducts(filters),
  ]);

  return (
    <>
      <StorefrontPageHeader
        tone="catalog"
        className="border-b-0"
        breadcrumbs={[{ href: "/", label: "Головна" }, { label: "Каталог" }]}
        eyebrow="Каталог"
        title="Усі товари"
        summary={`Знайдено товарів: ${products.length}`}
        description="Повна вітрина активних товарів з пошуком, фільтрами й сортуванням для швидкого вибору."
      />

      <StorefrontSection tone="catalog" spacing="sm" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <CatalogFilterSidebar
            basePath="/catalog"
            filterOptions={filterOptions}
            filters={filters}
          />
          <div className="space-y-5">
            <CatalogToolbar
              basePath="/catalog"
              count={products.length}
              filterOptions={filterOptions}
              filters={filters}
              title="Каталог товарів"
            />
            <StorefrontProductGrid
              products={products}
              emptyTitle="У каталозі ще немає активних товарів"
              emptyDescription="Додайте товари в адмінці та увімкніть активність, щоб вони з'явилися тут."
            />
          </div>
        </div>
      </StorefrontSection>
    </>
  );
}
