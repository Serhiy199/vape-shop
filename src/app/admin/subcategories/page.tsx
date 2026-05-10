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
  const { categories, selectedSubcategory, subcategories } =
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
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Підкатегорії"
        title="Керування підкатегоріями каталогу"
        description="Створюйте підкатегорії, прив'язуйте їх до категорій та керуйте активністю без фізичного видалення записів."
        badges={["categoryId обов'язковий", "soft status"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: subcategories.length.toString(),
            note: "Усі підкатегорії в адмінці, незалежно від активності.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Ці записи можуть використовуватися у публічному каталозі.",
          },
          {
            label: "Поля",
            value: totalFields.toString(),
            note: "Скільки характеристик уже прив'язано до підкатегорій.",
          },
          {
            label: "Товари",
            value: totalProducts.toString(),
            note: "Показує, де зміна categoryId буде заблокована.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/admin/categories",
            label: "Категорії",
            variant: "outline",
          },
          {
            href: "/admin/fields",
            label: "Поля підкатегорій",
            variant: "outline",
          },
        ]}
        note="Підкатегорії не видаляються фізично. Для приховування використовуйте перемикач активності."
      />

      <AdminSectionCard
        title="Створення та редагування"
        description="Форма створення доступна завжди, а редагування з'являється після вибору підкатегорії зі списку."
      >
        <AdminSubcategoryCrud
          categories={categoryOptions}
          selectedSubcategory={
            selectedSubcategory
              ? {
                  categoryId: selectedSubcategory.categoryId,
                  description: selectedSubcategory.description,
                  id: selectedSubcategory.id,
                  isActive: selectedSubcategory.isActive,
                  name: selectedSubcategory.name,
                  productsCount: selectedSubcategory._count.products,
                  seoDescription: selectedSubcategory.seoDescription,
                  seoTitle: selectedSubcategory.seoTitle,
                  slug: selectedSubcategory.slug,
                  sortOrder: selectedSubcategory.sortOrder,
                }
              : null
          }
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Список підкатегорій"
        description="Тут видно назву, категорію, slug, статус і кількість пов'язаних записів."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Підкатегорії каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Оберіть рядок, щоб відкрити деталі й форму редагування.
                  </p>
                </div>
                <Badge variant="outline">{subcategories.length} записів</Badge>
              </div>

              <AdminListTable
                items={subcategories}
                columns={[
                  {
                    key: "subcategory",
                    header: "Підкатегорія",
                    cell: (subcategory) => (
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/admin/subcategories?selected=${subcategory.id}`}
                          className="font-medium hover:underline"
                        >
                          {subcategory.name}
                        </Link>
                        <p className="text-muted-foreground truncate text-xs">
                          {subcategory.slug}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "category",
                    header: "Категорія",
                    cell: (subcategory) => (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {subcategory.category.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {subcategory.category.slug}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Статус",
                    className: "w-36",
                    cell: (subcategory) => (
                      <Badge
                        variant={subcategory.isActive ? "secondary" : "outline"}
                      >
                        {subcategory.isActive ? "Активна" : "Неактивна"}
                      </Badge>
                    ),
                  },
                  {
                    key: "usage",
                    header: "Зв'язки",
                    className: "w-32",
                    cell: (subcategory) =>
                      `${subcategory._count.fields} полів / ${subcategory._count.products} товарів`,
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("subcategories")}
                    title="Підкатегорії ще не створені"
                    description={
                      categories.length
                        ? "Створіть першу підкатегорію через форму вище."
                        : "Спочатку створіть категорію, а потім додайте до неї підкатегорію."
                    }
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
                    Зв&apos;язки з товарами враховуються під час зміни
                    категорії.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Назва",
                      value: selectedSubcategory.name,
                      note:
                        selectedSubcategory.description ??
                        "Опис підкатегорії ще не заповнений.",
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
                      label: "Статус",
                      value: selectedSubcategory.isActive
                        ? "Активна"
                        : "Неактивна",
                    },
                    {
                      label: "Порядок",
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
                      label: "Зв'язки",
                      value: `${selectedSubcategory._count.fields} полів / ${selectedSubcategory._count.products} товарів`,
                      note:
                        selectedSubcategory._count.products > 0
                          ? "Зміну категорії для цієї підкатегорії буде заблоковано."
                          : "Категорію можна змінити без ризику для товарів.",
                    },
                  ]}
                />

                <AdminSectionCard
                  title="Поля підкатегорії"
                  description="Пов'язані характеристики товарів для цієї гілки каталогу."
                >
                  <div className="space-y-3">
                    {selectedSubcategory.fields.length ? (
                      selectedSubcategory.fields.map((field) => (
                        <div
                          key={field.id}
                          className="border-border/70 bg-card/70 flex items-start justify-between gap-3 rounded-lg border p-4"
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
                              <Badge variant="secondary">
                                Обов&apos;язкове
                              </Badge>
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
                        title="Полів ще немає"
                        description="Це нормальний стан для нової підкатегорії. Поля можна додати в окремому розділі."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <AdminEmptyState
                icon={getAdminModuleIcon("subcategories")}
                title="Немає обраної підкатегорії"
                description="Оберіть запис зі списку, щоб побачити деталі, зв'язки та попередження щодо зміни категорії."
              />
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
