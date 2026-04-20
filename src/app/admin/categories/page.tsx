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
        title="Фіксовані категорії вже читаються з бази"
        description="На цьому кроці ми закріплюємо структуру каталогу: адмінка читає тільки fixed categories, показує їх порядок, SEO-стан і пов'язані підкатегорії. Create/delete для категорій свідомо не відкриваємо."
        badges={["Етап 5", "Read-side готовий"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Fixed categories",
            value: categories.length.toString(),
            note: "У список потрапляють лише категорії з бізнес-правилом isFixed=true.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Це допомагає швидко побачити, чи всі базові розділи увімкнені для каталогу.",
          },
          {
            label: "Підкатегорії",
            value: totalSubcategories.toString(),
            note: "Показує, наскільки повно наповнене дерево каталогу всередині fixed categories.",
          },
          {
            label: "Товари",
            value: totalProducts.toString(),
            note: "Дає швидкий сигнал, чи є наповнення в кожній кореневій категорії.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          { href: "/admin", label: "Повернутися до огляду", variant: "outline" },
          {
            href: "/admin/subcategories",
            label: "Відкрити підкатегорії",
            variant: "outline",
          },
        ]}
        note="Наступним кроком сюди ляже edit-form для name, slug, sortOrder та SEO, але вже без зміни самої fixed структури категорій."
      />

      <AdminSectionCard
        title="Список і деталі категорій"
        description="Ліва колонка показує реальні fixed categories з бази, права — деталі обраної категорії та її підкатегорії."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Fixed categories</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Вибір елемента працює через параметр <code>?selected=</code>,
                    щоб уже зараз мати стабільний read/detail сценарій.
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
                      <div className="space-y-1">
                        <Link
                          href={`/admin/categories?selected=${category.id}`}
                          className="font-medium hover:underline"
                        >
                          {category.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {category.slug}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "sortOrder",
                    header: "Порядок",
                    className: "w-28",
                    cell: (category) => category.sortOrder,
                  },
                  {
                    key: "status",
                    header: "Стан",
                    className: "w-40",
                    cell: (category) => (
                      <Badge variant={category.isActive ? "secondary" : "outline"}>
                        {category.isActive ? "Активна" : "Неактивна"}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("categories")}
                    title="Fixed categories ще не знайдено"
                    description="Для цього екрана ми очікуємо seeded категорії. Наступний крок — перевірити seed або додати початкові записи."
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
                    Це вже реальний detail panel для майбутньої форми редагування
                    fixed category.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Назва",
                      value: selectedCategory.name,
                      note:
                        selectedCategory.description ?? "Опис поки не заповнений.",
                    },
                    {
                      label: "Slug",
                      value: selectedCategory.slug,
                    },
                    {
                      label: "Порядок сортування",
                      value: selectedCategory.sortOrder.toString(),
                    },
                    {
                      label: "SEO",
                      value:
                        selectedCategory.seoTitle ?? "SEO title ще не заповнений",
                      note:
                        selectedCategory.seoDescription ??
                        "SEO description ще не заповнений.",
                    },
                    {
                      label: "Наповнення",
                      value: `${selectedCategory._count.subcategories} підкатегорій / ${selectedCategory._count.products} товарів`,
                    },
                    {
                      label: "Статус",
                      value: selectedCategory.isActive ? "Активна" : "Неактивна",
                      note:
                        "Create/delete для категорій не буде. На наступному кроці додамо лише safe update fixed categories.",
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
                          className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-card/70 p-4"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{subcategory.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {subcategory.slug}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">#{subcategory.sortOrder}</Badge>
                            <Badge
                              variant={subcategory.isActive ? "secondary" : "outline"}
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
                        description="На наступному кроці CRUD для підкатегорій якраз заповнить цей блок."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <AdminEmptyState
                icon={getAdminModuleIcon("categories")}
                title="Немає обраної категорії"
                description="Щойно в базі з'являться fixed categories, тут автоматично з'явиться детальний перегляд."
              />
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
