import Link from "next/link";

import { AdminListTable } from "@/components/admin/admin-data-primitives";
import { getAdminModuleIcon } from "@/components/admin/admin-module-scaffold";
import {
  AdminActionsBar,
  AdminEmptyState,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatsGrid,
} from "@/components/admin/admin-primitives";
import { Badge } from "@/components/ui/badge";
import { AdminProductFilters } from "@/features/catalog/components/admin-product-filters";
import { AdminProductCrud } from "@/features/catalog/components/admin-product-crud";
import { getAdminProductsPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{
  brandId?: string;
  categoryId?: string;
  search?: string;
  selected?: string;
  subcategoryId?: string;
}>;

function formatPrice(value: { toString(): string }) {
  return `${value.toString()} грн`;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const activeFilters = {
    brandId: params.brandId,
    categoryId: params.categoryId,
    search: params.search,
    subcategoryId: params.subcategoryId,
  };

  const { brands, categories, fields, products, subcategories } =
    await getAdminProductsPageData(params.selected, activeFilters);

  const activeCount = products.filter((product) => product.isActive).length;
  const inStockCount = products.filter(
    (product) => product.availability === "IN_STOCK",
  ).length;
  const featuredCount = products.filter(
    (product) =>
      product.isFeaturedHit ||
      product.isFeaturedNew ||
      product.isFeaturedSale ||
      product.isFeaturedDiscount,
  ).length;
  const productsWithBrands = products.filter((product) => product.brand).length;

  const mappedBrands = brands.map((brand) => ({
    id: brand.id,
    isActive: brand.isActive,
    name: brand.name,
    slug: brand.slug,
  }));

  const mappedCategories = categories.map((category) => ({
    id: category.id,
    isActive: category.isActive,
    name: category.name,
    slug: category.slug,
  }));

  const mappedSubcategories = subcategories.map((subcategory) => ({
    category: {
      id: subcategory.category.id,
      isActive: subcategory.category.isActive,
      name: subcategory.category.name,
    },
    id: subcategory.id,
    isActive: subcategory.isActive,
    name: subcategory.name,
    slug: subcategory.slug,
  }));

  const mappedFields = fields.map((field) => ({
    helpText: field.helpText,
    id: field.id,
    isRequired: field.isRequired,
    key: field.key,
    label: field.label,
    options: field.options.map((option) => ({
      id: option.id,
      label: option.label,
      sortOrder: option.sortOrder,
      value: option.value,
    })),
    sortOrder: field.sortOrder,
    subcategoryId: field.subcategoryId,
    type: field.type,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Товари"
        title="Products page вже повністю підключена до query params і wizard flow"
        description="Сторінка товарів тепер читає фільтри, показує реальний список, detail panel і той самий multi-step create/edit flow без заглушок. Це вже повноцінний admin entrypoint для product management."
        badges={["Етап 7", "Products wired"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: products.length.toString(),
            note: "Список уже реагує на query-фільтри й показує тільки релевантні товари.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Soft delete для товарів уже працює через deactivate flow.",
          },
          {
            label: "В наявності",
            value: inStockCount.toString(),
            note: "Дає швидкий зріз availability по поточній вибірці.",
          },
          {
            label: "З флагами",
            value: featuredCount.toString(),
            note: `Товарів із мітками new/sale/hit: ${featuredCount}. Із виробником: ${productsWithBrands}.`,
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/admin/brands",
            label: "Відкрити виробників",
            variant: "outline",
          },
          {
            href: "/admin/subcategories",
            label: "Відкрити підкатегорії",
            variant: "outline",
          },
          {
            href: "/admin/fields",
            label: "Відкрити характеристики",
            variant: "outline",
          },
        ]}
        note="Фільтри, список, detail panel і product wizard уже працюють як єдина products page без розриву між read-side і write-side."
      />

      <AdminSectionCard
        title="Фільтри товарів"
        description="Тут підключено page wiring для query params: category, subcategory, brand і search."
      >
        <AdminProductFilters
          brands={brands.map((brand) => ({
            id: brand.id,
            name: brand.name,
          }))}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
          initialFilters={activeFilters}
          subcategories={subcategories.map((subcategory) => ({
            category: {
              id: subcategory.category.id,
            },
            id: subcategory.id,
            name: subcategory.name,
          }))}
        />
      </AdminSectionCard>

      <AdminProductCrud
        brands={mappedBrands}
        categories={mappedCategories}
        fields={mappedFields}
        mode="create"
        selectedProduct={null}
        subcategories={mappedSubcategories}
      />

      <AdminSectionCard
        title="Список товарів"
        description="Форма редагування більше не відкривається автоматично на вкладці товарів. Для змін відкрийте окрему сторінку товару."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Товари каталогу</p>
              <p className="text-muted-foreground text-sm leading-6">
                Список реагує на фільтри, а редагування відкривається окремою
                сторінкою.
              </p>
            </div>
            <Badge variant="outline">{products.length} записів</Badge>
          </div>

          <AdminListTable
            items={products}
            columns={[
              {
                key: "title",
                header: "Товар",
                cell: (product) => (
                  <div className="space-y-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.title}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {product.category.name} / {product.subcategory.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {product.slug}
                    </p>
                  </div>
                ),
              },
              {
                key: "price",
                header: "Ціна",
                className: "w-28",
                cell: (product) => formatPrice(product.price),
              },
              {
                key: "brand",
                header: "Виробник",
                className: "w-32",
                cell: (product) => product.brand?.name ?? "-",
              },
              {
                key: "status",
                header: "Стан",
                className: "w-40",
                cell: (product) => (
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        product.availability === "IN_STOCK"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {product.availability === "IN_STOCK"
                        ? "В наявності"
                        : "Немає"}
                    </Badge>
                    {!product.isActive ? (
                      <Badge variant="outline">Неактивний</Badge>
                    ) : null}
                  </div>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "w-32",
                cell: (product) => (
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="border-border bg-card hover:bg-muted inline-flex rounded-full border px-3 py-2 text-xs font-medium transition-colors"
                  >
                    Редагувати
                  </Link>
                ),
              },
            ]}
            emptyState={
              <AdminEmptyState
                icon={getAdminModuleIcon("products")}
                title="Товари за поточними фільтрами не знайдені"
                description="Скиньте фільтри або створіть новий товар у формі вище."
              />
            }
          />
        </div>
      </AdminSectionCard>
    </div>
  );
}
