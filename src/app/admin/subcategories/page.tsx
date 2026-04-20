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
import { AdminSubcategoryCrud } from "@/features/catalog/components/admin-subcategory-crud";
import { getAdminSubcategoriesPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

export default async function AdminSubcategoriesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { categories, subcategories, selectedSubcategory } =
    await getAdminSubcategoriesPageData(params.selected);

  const activeCount = subcategories.filter(
    (subcategory) => subcategory.isActive,
  ).length;
  const totalFields = subcategories.reduce(
    (sum, subcategory) => sum + subcategory._count.fields,
    0,
  );
  const totalProducts = subcategories.reduce(
    (sum, subcategory) => sum + subcategory._count.products,
    0,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Підкатегорії"
        title="CRUD для підкатегорій уже працює в адмінці"
        description="Тепер адміністратор може створювати, редагувати й видаляти підкатегорії всередині fixed categories, не торкаючись коду. Усі дії проходять через валідацію та write-side."
        badges={["Етап 5", "CRUD готовий"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: subcategories.length.toString(),
            note: "Бачимо всі підкатегорії каталогу, а не лише підготовлені заглушки.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Активність уже керується прямо з CRUD-форми, без ручних змін у коді.",
          },
          {
            label: "Поля",
            value: totalFields.toString(),
            note: "Показує, наскільки підкатегорії вже готові до роботи з product fields.",
          },
          {
            label: "Товари",
            value: totalProducts.toString(),
            note: "Допомагає бачити, які гілки каталогу вже реально використовуються.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/admin/categories",
            label: "Відкрити категорії",
            variant: "outline",
          },
          { href: "/admin/fields", label: "Відкрити поля", variant: "outline" },
        ]}
        note="Створення, оновлення і видалення вже працюють на цій сторінці; адміну не потрібно лізти в код, щоб керувати структурою підкатегорій."
      />

      <AdminSectionCard
        title="Список і деталі підкатегорій"
        description="Ліва колонка показує структуру дерева з батьківською категорією, права — деталі обраної підкатегорії та CRUD-інструменти."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Підкатегорії каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Уже зараз видно, в якій категорії живе підкатегорія та
                    наскільки вона заповнена.
                  </p>
                </div>
                <Badge variant="outline">{subcategories.length} записів</Badge>
              </div>

              <AdminListTable
                items={subcategories}
                columns={[
                  {
                    key: "name",
                    header: "Підкатегорія",
                    cell: (subcategory) => (
                      <div className="space-y-1">
                        <Link
                          href={`/admin/subcategories?selected=${subcategory.id}`}
                          className="font-medium hover:underline"
                        >
                          {subcategory.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {subcategory.category.name} / {subcategory.slug}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "fields",
                    header: "Поля",
                    className: "w-24",
                    cell: (subcategory) => subcategory._count.fields,
                  },
                  {
                    key: "status",
                    header: "Стан",
                    className: "w-40",
                    cell: (subcategory) => (
                      <Badge variant={subcategory.isActive ? "secondary" : "outline"}>
                        {subcategory.isActive ? "Активна" : "Неактивна"}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("subcategories")}
                    title="Підкатегорії ще не знайдені"
                    description="Щойно seed або перші CRUD-операції додадуть записи, ця сторінка одразу покаже структуру дерева."
                  />
                }
              />
            </div>
          }
          detail={
            selectedSubcategory ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Деталі підкатегорії</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Detail panel уже показує реальні дані, а нижче розміщена
                    робоча форма update/delete.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Назва",
                      value: selectedSubcategory.name,
                      note:
                        selectedSubcategory.description ??
                        "Опис підкатегорії поки не заповнений.",
                    },
                    {
                      label: "Категорія",
                      value: selectedSubcategory.category.name,
                      note: selectedSubcategory.category.slug,
                    },
                    {
                      label: "Slug",
                      value: selectedSubcategory.slug,
                    },
                    {
                      label: "Порядок сортування",
                      value: selectedSubcategory.sortOrder.toString(),
                    },
                    {
                      label: "SEO",
                      value:
                        selectedSubcategory.seoTitle ??
                        "SEO title ще не заповнений",
                      note:
                        selectedSubcategory.seoDescription ??
                        "SEO description ще не заповнений.",
                    },
                    {
                      label: "Наповнення",
                      value: `${selectedSubcategory._count.fields} полів / ${selectedSubcategory._count.products} товарів`,
                    },
                  ]}
                />

                <AdminSubcategoryCrud
                  categories={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  }))}
                  selectedSubcategory={{
                    id: selectedSubcategory.id,
                    category: {
                      id: selectedSubcategory.category.id,
                    },
                    description: selectedSubcategory.description,
                    isActive: selectedSubcategory.isActive,
                    name: selectedSubcategory.name,
                    seoDescription: selectedSubcategory.seoDescription,
                    seoTitle: selectedSubcategory.seoTitle,
                    slug: selectedSubcategory.slug,
                    sortOrder: selectedSubcategory.sortOrder,
                  }}
                />

                <AdminSectionCard
                  title="Пов'язані поля"
                  description="Можемо одразу побачити, наскільки підкатегорія підготовлена для характеристик товару."
                >
                  <div className="space-y-3">
                    {selectedSubcategory.fields.length ? (
                      selectedSubcategory.fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-card/70 p-4"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{field.label}</p>
                            <p className="text-muted-foreground text-xs">
                              {field.key}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{field.type}</Badge>
                            {field.isRequired ? (
                              <Badge variant="secondary">Обов'язкове</Badge>
                            ) : null}
                            {field.isFilterable ? (
                              <Badge variant="outline">Фільтр</Badge>
                            ) : null}
                            <Badge variant="outline">#{field.sortOrder}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <AdminEmptyState
                        title="Для підкатегорії ще немає полів"
                        description="Це нормальний стан для нових гілок каталогу. На етапі fields сюди можна буде швидко повертатися для контролю структури."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <div className="space-y-4">
                <AdminEmptyState
                  icon={getAdminModuleIcon("subcategories")}
                  title="Немає обраної підкатегорії"
                  description="Можна одразу створити нову підкатегорію нижче, або вибрати існуючу зі списку для редагування."
                />

                <AdminSubcategoryCrud
                  categories={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  }))}
                  selectedSubcategory={null}
                />
              </div>
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
