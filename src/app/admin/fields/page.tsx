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
import { AdminFieldCrud } from "@/features/catalog/components/admin-field-crud";
import { getAdminFieldsPageData } from "@/server/queries/admin-catalog.query";

type SearchParams = Promise<{ selected?: string }>;

export default async function AdminFieldsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { fields, selectedField, subcategories } = await getAdminFieldsPageData(
    params.selected,
  );

  const activeCount = fields.filter((field) => field.isActive).length;
  const requiredCount = fields.filter((field) => field.isRequired).length;
  const selectLikeCount = fields.filter(
    (field) => field.type === "SELECT" || field.type === "MULTI_SELECT",
  ).length;
  const totalOptions = fields.reduce(
    (sum, field) => sum + field._count.options,
    0,
  );
  const usedByProductsCount = fields.filter(
    (field) => field._count.productValues > 0,
  ).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Характеристики"
        title="Конструктор характеристик підкатегорій"
        description="Адміністратор може задавати власні характеристики для кожної підкатегорії, керувати типами значень, SELECT і MULTI_SELECT опціями без змін у коді. Використані характеристики не видаляються фізично, а деактивуються."
        badges={["Характеристики", "Active / inactive"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: fields.length.toString(),
            note: "Усі характеристики підкатегорій, які формують динамічну структуру каталогу.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Активні характеристики доступні при створенні та редагуванні товарів.",
          },
          {
            label: "Обов'язкові",
            value: requiredCount.toString(),
            note: "Ці характеристики повинні бути заповнені для товарів відповідних підкатегорій.",
          },
          {
            label: "SELECT / MULTI",
            value: selectLikeCount.toString(),
            note: "Характеристики з наперед заданими варіантами значень для контрольованого вводу.",
          },
          {
            label: "Опції",
            value: totalOptions.toString(),
            note: "Сумарна кількість опцій, які вже описані в конструкторі.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/admin/subcategories",
            label: "Відкрити підкатегорії",
            variant: "outline",
          },
          {
            href: "/admin/products",
            label: "Відкрити товари",
            variant: "outline",
          },
        ]}
        note={`Характеристик, уже пов'язаних із товарами: ${usedByProductsCount}. Такі записи не видаляються фізично, для них використовується active/inactive.`}
      />

      <AdminFieldCrud
        mode="create"
        subcategories={subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          categoryName: subcategory.category.name,
        }))}
        selectedField={null}
      />

      <AdminSectionCard
        title="Список і деталі характеристик"
        description="Ліва колонка показує всі характеристики підкатегорій, права — деталі вибраної характеристики та робочий CRUD-конструктор."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Характеристики каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Уже зараз видно, до якої підкатегорії належить
                    характеристика, який у неї тип, статус і чи використовується
                    вона товарами.
                  </p>
                </div>
                <Badge variant="outline">{fields.length} записів</Badge>
              </div>

              <AdminListTable
                items={fields}
                columns={[
                  {
                    key: "label",
                    header: "Характеристика",
                    cell: (field) => (
                      <div className="space-y-1">
                        <Link
                          href={`/admin/fields?selected=${field.id}`}
                          className="font-medium hover:underline"
                        >
                          {field.label}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {field.subcategory.category.name} /{" "}
                          {field.subcategory.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {field.key}
                        </p>
                        <Badge
                          variant={field.isActive ? "secondary" : "outline"}
                        >
                          {field.isActive ? "Активна" : "Неактивна"}
                        </Badge>
                      </div>
                    ),
                  },
                  {
                    key: "type",
                    header: "Тип",
                    className: "w-32",
                    cell: (field) => (
                      <Badge variant="outline">{field.type}</Badge>
                    ),
                  },
                  {
                    key: "options",
                    header: "Опції",
                    className: "w-24",
                    cell: (field) => field._count.options,
                  },
                  {
                    key: "usage",
                    header: "Використання",
                    className: "w-32",
                    cell: (field) =>
                      field._count.productValues > 0 ? (
                        <Badge variant="secondary">У товарах</Badge>
                      ) : (
                        <Badge variant="outline">Нове</Badge>
                      ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={getAdminModuleIcon("fields")}
                    title="Характеристики ще не знайдені"
                    description="Щойно seed або перші CRUD-операції додадуть записи, ця сторінка одразу покаже реальний конструктор характеристик."
                  />
                }
              />
            </div>
          }
          detail={
            selectedField ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Деталі характеристики</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Detail panel показує реальні дані характеристики,
                    підкатегорію, тип, опції, статус та рівень використання в
                    товарах.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Label",
                      value: selectedField.label,
                      note:
                        selectedField.helpText ??
                        "Службова підказка для цієї характеристики поки не задана.",
                    },
                    {
                      label: "Підкатегорія",
                      value: selectedField.subcategory.name,
                      note: `${selectedField.subcategory.category.name} / ${selectedField.subcategory.slug}`,
                    },
                    {
                      label: "Key",
                      value: selectedField.key,
                    },
                    {
                      label: "Тип",
                      value: selectedField.type,
                      note:
                        selectedField.type === "SELECT" ||
                        selectedField.type === "MULTI_SELECT"
                          ? "Характеристика працює через наперед визначені опції."
                          : "Характеристика зберігає пряме значення відповідного типу.",
                    },
                    {
                      label: "Параметри",
                      value: `${selectedField.isRequired ? "Обов'язкове" : "Необов'язкове"} / ${selectedField.isActive ? "Активне" : "Неактивне"} / #${selectedField.sortOrder}`,
                    },
                    {
                      label: "Використання",
                      value: `${selectedField._count.productValues} значень у товарах / ${selectedField._count.options} опцій`,
                    },
                  ]}
                />

                <AdminFieldCrud
                  mode="edit"
                  subcategories={subcategories.map((subcategory) => ({
                    id: subcategory.id,
                    name: subcategory.name,
                    categoryName: subcategory.category.name,
                  }))}
                  selectedField={{
                    id: selectedField.id,
                    isActive: selectedField.isActive,
                    isRequired: selectedField.isRequired,
                    key: selectedField.key,
                    label: selectedField.label,
                    options: selectedField.options.map((option) => ({
                      id: option.id,
                      label: option.label,
                      sortOrder: option.sortOrder.toString(),
                      value: option.value,
                    })),
                    sortOrder: selectedField.sortOrder,
                    subcategory: {
                      id: selectedField.subcategory.id,
                    },
                    type: selectedField.type,
                    productValuesCount: selectedField._count.productValues,
                  }}
                />

                <AdminSectionCard
                  title="Опції характеристики"
                  description="Якщо характеристика має тип SELECT або MULTI_SELECT, тут видно повний набір дозволених значень і їх фактичне використання."
                >
                  <div className="space-y-3">
                    {selectedField.options.length ? (
                      selectedField.options.map((option) => (
                        <div
                          key={option.id}
                          className="border-border/70 bg-card/70 flex items-start justify-between gap-3 rounded-2xl border p-4"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{option.label}</p>
                            <p className="text-muted-foreground text-xs">
                              {option.value}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">#{option.sortOrder}</Badge>
                            <Badge
                              variant={
                                option._count.valuesUsed > 0
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {option._count.valuesUsed} використань
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <AdminEmptyState
                        title="Для цієї характеристики ще немає опцій"
                        description="Це нормальний стан для характеристик без варіантів. Якщо зміните тип на SELECT або MULTI_SELECT, тут з'являться дозволені варіанти значень."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <div className="space-y-4">
                <AdminEmptyState
                  icon={getAdminModuleIcon("fields")}
                  title="Немає обраної характеристики"
                  description="Форма створення нової характеристики вже доступна вище. Виберіть існуючу зі списку для редагування."
                />
              </div>
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
