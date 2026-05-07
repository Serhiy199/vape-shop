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
import { AdminBrandCrud } from "@/features/catalog/components/admin-brand-crud";
import { getAdminBrandsPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { brands, selectedBrand, subcategories } =
    await getAdminBrandsPageData(params.selected);

  const activeCount = brands.filter((brand) => brand.isActive).length;
  const brandsWithProducts = brands.filter(
    (brand) => brand._count.products > 0,
  ).length;
  const totalProducts = brands.reduce(
    (sum, brand) => sum + brand._count.products,
    0,
  );

  const subcategoryOptions = subcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    category: {
      name: subcategory.category.name,
    },
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Виробники"
        title="Виробники за підкатегоріями"
        description="Виробник створюється для конкретної підкатегорії та потім доступний у товарах цієї підкатегорії."
        badges={["Brand model", "Без фізичного delete"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: brands.length.toString(),
            note: "Усі виробники з бази, включно з неактивними.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Доступні для вибору при створенні товарів.",
          },
          {
            label: "З товарами",
            value: brandsWithProducts.toString(),
            note: "Виробники, які вже використовуються в каталозі.",
          },
          {
            label: "Товарів",
            value: totalProducts.toString(),
            note: "Сумарна кількість прив'язаних товарів.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin/products", label: "Відкрити товари", variant: "outline" },
          { href: "/admin/subcategories", label: "Підкатегорії", variant: "outline" },
        ]}
        note="Форма виробника не має SEO чи фото: тільки підкатегорія, назва та статус."
      />

      <AdminSectionCard
        title="Список і деталі виробників"
        description="Ліва колонка показує виробників, права — форму створення та редагування."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Виробники каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Виробник прив'язаний до підкатегорії, а не глобально до
                    всього магазину.
                  </p>
                </div>
                <Badge variant="outline">{brands.length} записів</Badge>
              </div>

              <AdminListTable
                items={brands}
                columns={[
                  {
                    key: "name",
                    header: "Виробник",
                    cell: (brand) => (
                      <div className="space-y-1">
                        <Link
                          href={`/admin/brands?selected=${brand.id}`}
                          className="font-medium hover:underline"
                        >
                          {brand.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {brand.slug}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "subcategory",
                    header: "Підкатегорія",
                    cell: (brand) => (
                      <div className="space-y-1">
                        <p className="text-sm">{brand.subcategory.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {brand.subcategory.category.name}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Статус",
                    className: "w-36",
                    cell: (brand) => (
                      <Badge variant={brand.isActive ? "secondary" : "outline"}>
                        {brand.isActive ? "Активний" : "Неактивний"}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("brands")}
                    title="Виробники ще не додані"
                    description="Створіть першого виробника у формі праворуч."
                  />
                }
              />
            </div>
          }
          detail={
            <div className="space-y-4">
              {selectedBrand ? (
                <>
                  <AdminDetailList
                    items={[
                      {
                        label: "Назва",
                        value: selectedBrand.name,
                      },
                      {
                        label: "Slug",
                        value: selectedBrand.slug,
                      },
                      {
                        label: "Підкатегорія",
                        value: selectedBrand.subcategory.name,
                        note: selectedBrand.subcategory.category.name,
                      },
                      {
                        label: "Статус",
                        value: selectedBrand.isActive
                          ? "Активний"
                          : "Неактивний",
                      },
                      {
                        label: "Пов'язані товари",
                        value: selectedBrand._count.products.toString(),
                      },
                    ]}
                  />

                  <AdminBrandCrud
                    selectedBrand={{
                      id: selectedBrand.id,
                      isActive: selectedBrand.isActive,
                      name: selectedBrand.name,
                      productsCount: selectedBrand._count.products,
                      slug: selectedBrand.slug,
                      subcategoryId: selectedBrand.subcategoryId,
                    }}
                    subcategories={subcategoryOptions}
                  />
                </>
              ) : (
                <>
                  <AdminEmptyState
                    icon={getAdminModuleIcon("brands")}
                    title="Оберіть виробника для редагування"
                    description="Або створіть нового виробника у формі нижче."
                  />

                  <AdminBrandCrud
                    selectedBrand={null}
                    subcategories={subcategoryOptions}
                  />
                </>
              )}
            </div>
          }
        />
      </AdminSectionCard>
    </div>
  );
}
