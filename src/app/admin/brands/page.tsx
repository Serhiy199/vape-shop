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
import { getAdminBrandsPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { brands, selectedBrand } = await getAdminBrandsPageData(params.selected);

  const activeCount = brands.filter((brand) => brand.isActive).length;
  const brandsWithProducts = brands.filter(
    (brand) => brand._count.products > 0,
  ).length;
  const totalProducts = brands.reduce(
    (sum, brand) => sum + brand._count.products,
    0,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Бренди"
        title="Бренди вже читаються як окрема сутність адмінки"
        description="Ми підключили реальний read-side для брендів: список, сортування, стан активності та пов'язані товари. Це знімає залежність від коду на наступному CRUD-кроці."
        badges={["Етап 5", "Catalog core"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: brands.length.toString(),
            note: "Уже бачимо реальний перелік брендів з бази, а не placeholder-и.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Це майбутня опора для швидкого toggle активності в списку.",
          },
          {
            label: "З товарами",
            value: brandsWithProducts.toString(),
            note: "Дає швидкий сигнал, які бренди вже реально використовуються в каталозі.",
          },
          {
            label: "Товарів",
            value: totalProducts.toString(),
            note: "Сумарний обсяг товарів, прив'язаних до брендів.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin/products", label: "Відкрити товари", variant: "outline" },
          { href: "/admin", label: "Повернутися до огляду", variant: "outline" },
        ]}
        note="Наступним кроком тут додамо create/edit/delete брендів, швидке керування isActive та sortOrder."
      />

      <AdminSectionCard
        title="Список і деталі брендів"
        description="Ліва колонка дає огляд брендів, права — detail panel для обраного бренду і пов'язаних товарів."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Бренди каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Уже зараз видно порядок сортування, активність і наповнення
                    товарами.
                  </p>
                </div>
                <Badge variant="outline">{brands.length} записів</Badge>
              </div>

              <AdminListTable
                items={brands}
                columns={[
                  {
                    key: "name",
                    header: "Бренд",
                    cell: (brand) => (
                      <div className="space-y-1">
                        <Link
                          href={`/admin/brands?selected=${brand.id}`}
                          className="font-medium hover:underline"
                        >
                          {brand.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">{brand.slug}</p>
                      </div>
                    ),
                  },
                  {
                    key: "sortOrder",
                    header: "Порядок",
                    className: "w-24",
                    cell: (brand) => brand.sortOrder,
                  },
                  {
                    key: "status",
                    header: "Стан",
                    className: "w-40",
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
                    title="Бренди ще не додані"
                    description="Після першого CRUD-кроку ця сторінка стане основним місцем керування брендами без втручання в код."
                  />
                }
              />
            </div>
          }
          detail={
            selectedBrand ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Деталі бренду</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Detail panel уже показує живі дані бренду та його зв'язок із
                    каталогом.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Назва",
                      value: selectedBrand.name,
                      note:
                        selectedBrand.description ?? "Опис бренду поки не заповнений.",
                    },
                    {
                      label: "Slug",
                      value: selectedBrand.slug,
                    },
                    {
                      label: "Порядок сортування",
                      value: selectedBrand.sortOrder.toString(),
                    },
                    {
                      label: "Статус",
                      value: selectedBrand.isActive ? "Активний" : "Неактивний",
                      note:
                        "На наступному кроці саме тут і в списку з'явиться керування isActive та sortOrder.",
                    },
                    {
                      label: "Пов'язані товари",
                      value: selectedBrand._count.products.toString(),
                    },
                  ]}
                />

                <AdminSectionCard
                  title="Останні активні товари бренду"
                  description="Цей блок допомагає одразу перевірити, де бренд уже використовується в каталозі."
                >
                  <div className="space-y-3">
                    {selectedBrand.products.length ? (
                      selectedBrand.products.map((product) => (
                        <div
                          key={product.id}
                          className="rounded-2xl border border-border/70 bg-card/70 p-4"
                        >
                          <p className="font-medium">{product.title}</p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {product.slug}
                          </p>
                        </div>
                      ))
                    ) : (
                      <AdminEmptyState
                        title="У бренду ще немає активних товарів"
                        description="Це нормальний стан для нового бренду або бренду, який тимчасово не використовується."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <AdminEmptyState
                icon={getAdminModuleIcon("brands")}
                title="Немає обраного бренду"
                description="Після появи першого бренду тут автоматично з'явиться детальний перегляд."
              />
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
