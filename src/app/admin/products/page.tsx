import Link from "next/link";

import {
  AdminDetailList,
  AdminListTable,
  AdminSplitLayout,
} from "@/components/admin/admin-data-primitives";
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

function buildProductHref(input: {
  brandId?: string;
  categoryId?: string;
  search?: string;
  selected?: string;
  subcategoryId?: string;
}) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set("search", input.search);
  }

  if (input.categoryId) {
    params.set("categoryId", input.categoryId);
  }

  if (input.subcategoryId) {
    params.set("subcategoryId", input.subcategoryId);
  }

  if (input.brandId) {
    params.set("brandId", input.brandId);
  }

  if (input.selected) {
    params.set("selected", input.selected);
  }

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
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

  const {
    brands,
    categories,
    fields,
    products,
    selectedProduct,
    subcategories,
  } = await getAdminProductsPageData(params.selected, activeFilters);

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
    subcategoryId: brand.subcategoryId,
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

      <AdminSectionCard
        title="Список і деталі товарів"
        description="Ліворуч живе відфільтрований список товарів, праворуч — detail panel і повний multi-step CRUD flow."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Товари каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Вибір товару в списку зберігає поточні query-фільтри, тому
                    навігація між list і detail залишається стабільною.
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
                          href={buildProductHref({
                            ...activeFilters,
                            selected: product.id,
                          })}
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
                    cell: (product) => product.brand?.name ?? "—",
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
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("products")}
                    title="Товари за поточними фільтрами не знайдені"
                    description="Спробуйте скинути filters або змінити пошук. Create wizard нижче все одно доступний навіть без результатів у списку."
                  />
                }
              />
            </div>
          }
          detail={
            selectedProduct ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Деталі товару</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Detail panel уже показує повний admin payload товару:
                    category, subcategory, brand, SEO, images і характеристики.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Назва",
                      value: selectedProduct.title,
                      note:
                        selectedProduct.description ??
                        "Опис товару поки не заповнений.",
                    },
                    {
                      label: "Категорія",
                      value: selectedProduct.category.name,
                      note: selectedProduct.subcategory.name,
                    },
                    {
                      label: "Виробник",
                      value: selectedProduct.brand?.name ?? "Без виробника",
                    },
                    {
                      label: "Ціна і статус",
                      value: `${formatPrice(selectedProduct.price)} / ${
                        selectedProduct.availability === "IN_STOCK"
                          ? "В наявності"
                          : "Немає в наявності"
                      }`,
                    },
                    {
                      label: "SEO",
                      value:
                        selectedProduct.seoTitle ??
                        "SEO title ще не заповнений",
                      note:
                        selectedProduct.seoDescription ??
                        "SEO description ще не заповнений.",
                    },
                    {
                      label: "Наповнення",
                      value: `${selectedProduct.images.length} фото / ${selectedProduct.fieldValues.length} характеристик`,
                      note: `Slug: ${selectedProduct.slug}`,
                    },
                  ]}
                />

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedProduct.isActive ? "secondary" : "outline"}
                  >
                    {selectedProduct.isActive ? "Активний" : "Неактивний"}
                  </Badge>
                  {selectedProduct.isFeaturedNew ? (
                    <Badge variant="secondary">New</Badge>
                  ) : null}
                  {selectedProduct.isFeaturedSale ? (
                    <Badge variant="secondary">Sale</Badge>
                  ) : null}
                  {selectedProduct.isFeaturedHit ? (
                    <Badge variant="secondary">Hit</Badge>
                  ) : null}
                  {selectedProduct.isFeaturedDiscount ? (
                    <Badge variant="secondary">Знижка</Badge>
                  ) : null}
                </div>

                <AdminProductCrud
                  brands={mappedBrands}
                  categories={mappedCategories}
                  fields={mappedFields}
                  selectedProduct={{
                    availability: selectedProduct.availability,
                    brand: selectedProduct.brand
                      ? {
                          id: selectedProduct.brand.id,
                          isActive: selectedProduct.brand.isActive,
                          name: selectedProduct.brand.name,
                          subcategoryId: selectedProduct.brand.subcategoryId,
                        }
                      : null,
                    category: {
                      id: selectedProduct.category.id,
                      isActive: selectedProduct.category.isActive,
                      name: selectedProduct.category.name,
                    },
                    description: selectedProduct.description,
                    fieldValues: selectedProduct.fieldValues.map(
                      (fieldValue) => ({
                        field: {
                          id: fieldValue.field.id,
                          key: fieldValue.field.key,
                          label: fieldValue.field.label,
                          type: fieldValue.field.type,
                        },
                        option: fieldValue.option
                          ? {
                              id: fieldValue.option.id,
                              label: fieldValue.option.label,
                            }
                          : null,
                        optionId: fieldValue.optionId,
                        valueJson: fieldValue.valueJson,
                        valueBoolean: fieldValue.valueBoolean,
                        valueNumber: fieldValue.valueNumber,
                        valueText: fieldValue.valueText,
                      }),
                    ),
                    id: selectedProduct.id,
                    images: selectedProduct.images.map((image) => ({
                      alt: image.alt,
                      id: image.id,
                      isPrimary: image.isPrimary,
                      publicId: image.publicId,
                      sortOrder: image.sortOrder,
                      url: image.url,
                    })),
                    option: selectedProduct.option
                      ? {
                          id: selectedProduct.option.id,
                          name: selectedProduct.option.name,
                          values: selectedProduct.option.values.map(
                            (value) => ({
                              id: value.id,
                              image: value.image,
                              imagePublicId: value.imagePublicId,
                              label: value.label,
                              sortOrder: value.sortOrder,
                            }),
                          ),
                        }
                      : null,
                    isActive: selectedProduct.isActive,
                    isFeaturedDiscount: selectedProduct.isFeaturedDiscount,
                    isFeaturedHit: selectedProduct.isFeaturedHit,
                    isFeaturedNew: selectedProduct.isFeaturedNew,
                    isFeaturedSale: selectedProduct.isFeaturedSale,
                    price: selectedProduct.price,
                    seoDescription: selectedProduct.seoDescription,
                    seoTitle: selectedProduct.seoTitle,
                    slug: selectedProduct.slug,
                    subcategory: {
                      categoryId: selectedProduct.subcategory.categoryId,
                      id: selectedProduct.subcategory.id,
                      isActive: selectedProduct.subcategory.isActive,
                      name: selectedProduct.subcategory.name,
                    },
                    title: selectedProduct.title,
                  }}
                  subcategories={mappedSubcategories}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <AdminEmptyState
                  icon={getAdminModuleIcon("products")}
                  title="Немає обраного товару"
                  description="Якщо список не порожній, виберіть товар ліворуч. Якщо список порожній, можна одразу створювати новий товар через wizard нижче."
                />

                <AdminProductCrud
                  brands={mappedBrands}
                  categories={mappedCategories}
                  fields={mappedFields}
                  selectedProduct={null}
                  subcategories={mappedSubcategories}
                />
              </div>
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
