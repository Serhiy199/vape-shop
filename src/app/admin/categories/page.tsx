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
import { AdminCategoryUpdateForm } from "@/features/catalog/components/admin-category-update-form";
import { getAdminCategoriesPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { categories, selectedCategory } = await getAdminCategoriesPageData(
    params.selected,
  );

  const activeCount = categories.filter((category) => category.isActive).length;
  const totalSubcategories = categories.reduce(
    (sum, category) => sum + category._count.subcategories,
    0,
  );
  const totalProducts = categories.reduce(
    (sum, category) => sum + category._count.products,
    0,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Категорії"
        title="Керування категоріями каталогу"
        description="Категорії створюються і редагуються в адмінці. Фізичного видалення немає: видимість керується статусом active / inactive."
        badges={["Каталог", "Soft status"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Категорії",
            value: categories.length.toString(),
            note: "Усі категорії зберігаються в базі, навіть якщо вони неактивні.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Саме активні категорії мають відображатися на storefront.",
          },
          {
            label: "Підкатегорії",
            value: totalSubcategories.toString(),
            note: "Загальна кількість дочірніх розділів у дереві каталогу.",
          },
          {
            label: "Товари",
            value: totalProducts.toString(),
            note: "Показує, скільки товарів уже прив'язано до категорій.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/admin",
            label: "До огляду",
            variant: "outline",
          },
          {
            href: "/admin/subcategories",
            label: "Підкатегорії",
            variant: "outline",
          },
        ]}
        note="Видалення категорій не передбачене. Для приховування використовуйте перемикач активності."
      />

      <AdminSectionCard
        title="Створення та редагування"
        description="Форма створення доступна завжди. Після вибору категорії зі списку нижче з'являється редагування назви, фото та статусу."
      >
        <AdminCategoryUpdateForm
          category={
            selectedCategory
              ? {
                  description: selectedCategory.description,
                  id: selectedCategory.id,
                  image: selectedCategory.image,
                  isActive: selectedCategory.isActive,
                  name: selectedCategory.name,
                  seoDescription: selectedCategory.seoDescription,
                  seoTitle: selectedCategory.seoTitle,
                  slug: selectedCategory.slug,
                  sortOrder: selectedCategory.sortOrder,
                }
              : null
          }
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Список і деталі категорій"
        description="Список показує фото, назву, slug, статус і кількість пов'язаних сутностей. Деталі справа допомагають швидко перевірити вибрану категорію."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Категорії</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Вибір елемента працює через параметр <code>?selected=</code>
                    .
                  </p>
                </div>
                <Badge variant="outline">{categories.length} записів</Badge>
              </div>

              <AdminListTable
                items={categories}
                columns={[
                  {
                    key: "name",
                    header: "Категорія",
                    cell: (category) => (
                      <div className="flex items-center gap-3">
                        <div className="bg-muted border-border/70 h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                          {category.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={category.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/admin/categories?selected=${category.id}`}
                            className="font-medium hover:underline"
                          >
                            {category.name}
                          </Link>
                          <p className="text-muted-foreground truncate text-xs">
                            {category.slug}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "counts",
                    header: "Підкат. / товари",
                    className: "w-36",
                    cell: (category) =>
                      `${category._count.subcategories} / ${category._count.products}`,
                  },
                  {
                    key: "status",
                    header: "Статус",
                    className: "w-36",
                    cell: (category) => (
                      <Badge
                        variant={category.isActive ? "secondary" : "outline"}
                      >
                        {category.isActive ? "Активна" : "Неактивна"}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("categories")}
                    title="Категорій ще немає"
                    description="Створіть першу категорію у формі вище."
                  />
                }
              />
            </div>
          }
          detail={
            selectedCategory ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Деталі категорії</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Тут видно поточні дані категорії та її дочірні підкатегорії.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Назва",
                      value: selectedCategory.name,
                      note:
                        selectedCategory.description ??
                        "Опис поки не заповнений.",
                    },
                    {
                      label: "Slug",
                      value: selectedCategory.slug,
                    },
                    {
                      label: "Фото",
                      value: selectedCategory.image ? "Додано" : "Не додано",
                      note: selectedCategory.image ?? undefined,
                    },
                    {
                      label: "Наповнення",
                      value: `${selectedCategory._count.subcategories} підкатегорій / ${selectedCategory._count.products} товарів`,
                    },
                    {
                      label: "Статус",
                      value: selectedCategory.isActive
                        ? "Активна"
                        : "Неактивна",
                      note: "Статус змінюється перемикачем у формі редагування.",
                    },
                  ]}
                />

                <AdminSectionCard
                  title="Пов'язані підкатегорії"
                  description="Тут видно реальну структуру дерева всередині обраної категорії."
                >
                  <div className="space-y-3">
                    {selectedCategory.subcategories.length ? (
                      selectedCategory.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="border-border/70 bg-card/70 flex items-start justify-between gap-3 rounded-lg border p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-muted border-border/70 h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                              {subcategory.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={subcategory.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">{subcategory.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {subcategory.slug}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                subcategory.isActive ? "secondary" : "outline"
                              }
                            >
                              {subcategory.isActive ? "Активна" : "Неактивна"}
                            </Badge>
                            <Badge variant="outline">
                              {subcategory._count.products} товарів
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <AdminEmptyState
                        title="У категорії ще немає підкатегорій"
                        description="Після створення підкатегорій вони з'являться в цьому блоці."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <AdminEmptyState
                icon={getAdminModuleIcon("categories")}
                title="Немає обраної категорії"
                description="Створіть категорію або виберіть її зі списку, щоб побачити деталі."
              />
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
