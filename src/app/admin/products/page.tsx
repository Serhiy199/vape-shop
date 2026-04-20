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
import { AdminProductCrud } from "@/features/catalog/components/admin-product-crud";
import { getAdminProductsPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

function formatPrice(value: { toString(): string }) {
  return `${value.toString()} грн`;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { brands, categories, fields, products, selectedProduct, subcategories } =
    await getAdminProductsPageData(params.selected);

  const activeCount = products.filter((product) => product.isActive).length;
  const inStockCount = products.filter(
    (product) => product.availability === "IN_STOCK",
  ).length;
  const featuredCount = products.filter(
    (product) =>
      product.isFeaturedHit || product.isFeaturedNew || product.isFeaturedSale,
  ).length;
  const productsWithBrands = products.filter((product) => product.brand).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Товари"
        title="Product management skeleton уже працює на реальних даних"
        description="Сторінка товарів більше не є заглушкою: список, detail panel і каркас форми вже підключені до реального query/service/action шару. Наступним кроком ми розкладемо форму на повний multi-step wizard."
        badges={["Етап 7", "CRUD skeleton"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: products.length.toString(),
            note: "У списку вже відображаються реальні товари з каталогу, щойно вони з'являться в базі.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Soft delete для товарів уже підключений через service/action шар.",
          },
          {
            label: "В наявності",
            value: inStockCount.toString(),
            note: "Дає швидкий огляд реального availability-стану товарів.",
          },
          {
            label: "З флагами",
            value: featuredCount.toString(),
            note: `Товарів із мітками new/sale/hit: ${featuredCount}. Із брендом: ${productsWithBrands}.`,
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin/brands", label: "Відкрити бренди", variant: "outline" },
          {
            href: "/admin/subcategories",
            label: "Відкрити підкатегорії",
            variant: "outline",
          },
          { href: "/admin/fields", label: "Відкрити поля", variant: "outline" },
        ]}
        note="Цей модуль уже сидить на реальному read-side і готовий до покрокового розгортання create/update flow для товарів."
      />

      <AdminSectionCard
        title="Список і деталі товарів"
        description="Ліворуч уже працює реальний список товарів, праворуч — detail panel з базовими даними, SEO, flags, зображеннями та skeleton-формою керування."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Товари каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Уже зараз видно назву, категорію, бренд, ціну, флаги та стан
                    доступності кожного товару.
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
                          href={`/admin/products?selected=${product.id}`}
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
                    header: "Бренд",
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
                    title="Товари ще не додані"
                    description="Read-side уже готовий. Щойно з'являться перші товари, ця сторінка одразу стане центром керування каталогом."
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
                    Detail panel уже показує повний admin payload товару: зв'язки,
                    ціни, flags, SEO, зображення та dynamic fields.
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
                      label: "Бренд",
                      value: selectedProduct.brand?.name ?? "Без бренду",
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
                  <Badge variant={selectedProduct.isActive ? "secondary" : "outline"}>
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
                </div>

                <AdminProductCrud
                  brands={brands.map((brand) => ({
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                  }))}
                  categories={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  }))}
                  fields={fields.map((field) => ({
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
                  }))}
                  selectedProduct={{
                    availability: selectedProduct.availability,
                    brand: selectedProduct.brand
                      ? {
                          id: selectedProduct.brand.id,
                          name: selectedProduct.brand.name,
                        }
                      : null,
                    category: {
                      id: selectedProduct.category.id,
                      name: selectedProduct.category.name,
                    },
                    description: selectedProduct.description,
                    fieldValues: selectedProduct.fieldValues.map((fieldValue) => ({
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
                      valueBoolean: fieldValue.valueBoolean,
                      valueNumber: fieldValue.valueNumber,
                      valueText: fieldValue.valueText,
                    })),
                    id: selectedProduct.id,
                    images: selectedProduct.images.map((image) => ({
                      alt: image.alt,
                      id: image.id,
                      isPrimary: image.isPrimary,
                      publicId: image.publicId,
                      sortOrder: image.sortOrder,
                      url: image.url,
                    })),
                    isActive: selectedProduct.isActive,
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
                      name: selectedProduct.subcategory.name,
                    },
                    title: selectedProduct.title,
                  }}
                  subcategories={subcategories.map((subcategory) => ({
                    category: {
                      id: subcategory.category.id,
                      name: subcategory.category.name,
                    },
                    id: subcategory.id,
                    name: subcategory.name,
                    slug: subcategory.slug,
                  }))}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <AdminEmptyState
                  icon={getAdminModuleIcon("products")}
                  title="Немає обраного товару"
                  description="Щойно ви виберете товар зі списку, тут з'являться його деталі та skeleton-форми редагування."
                />

                <AdminProductCrud
                  brands={brands.map((brand) => ({
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                  }))}
                  categories={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  }))}
                  fields={fields.map((field) => ({
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
                  }))}
                  selectedProduct={null}
                  subcategories={subcategories.map((subcategory) => ({
                    category: {
                      id: subcategory.category.id,
                      name: subcategory.category.name,
                    },
                    id: subcategory.id,
                    name: subcategory.name,
                    slug: subcategory.slug,
                  }))}
                />
              </div>
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
