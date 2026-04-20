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
import { getAdminSubcategoriesPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

export default async function AdminSubcategoriesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { subcategories, selectedSubcategory } =
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
        title="Підкатегорії вже підключені до каталожного дерева"
        description="Екран читає реальні підкатегорії разом із батьківською категорією, порядком сортування, SEO та кількістю полів. Це основа для наступного CRUD-кроку."
        badges={["Етап 5", "CRUD наступним кроком"]}
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
            note: "Це майбутня база для швидкого toggle активності прямо зі списку.",
          },
          {
            label: "Поля",
            value: totalFields.toString(),
            note: "Показує, наскільки підкатегорії вже готові до роботи з product fields.",
          },
          {
            label: "Товари",
            value: totalProducts.toString(),
            note: "Допомагає бачити, які гілки каталогу вже використовуються товарами.",
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
        note="На наступному кроці тут з'являться create/edit/delete для підкатегорій, але вже поверх готового read-side і прив'язки до category."
      />

      <AdminSectionCard
        title="Список і деталі підкатегорій"
        description="Ліва колонка показує структуру дерева з батьківською категорією, права — деталі обраної підкатегорії й пов'язані поля."
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
                    Detail panel уже готовий під наступну форму create/edit без
                    повторної верстки.
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
              <AdminEmptyState
                icon={getAdminModuleIcon("subcategories")}
                title="Немає обраної підкатегорії"
                description="Після появи хоча б одного запису тут автоматично з'явиться детальний перегляд."
              />
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
