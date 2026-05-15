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

  const requiredCount = fields.filter((field) => field.isRequired).length;
  const selectCount = fields.filter((field) => field.type === "SELECT").length;
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
        eyebrow="Поля"
        title="Конструктор характеристик підкатегорій уже працює в адмінці"
        description="Тепер адміністратор може задавати власні поля для кожної підкатегорії, керувати типами значень і select-опціями без змін у коді. Усі операції проходять через валідацію та write-side правила сумісності."
        badges={["Етап 6", "Dynamic Fields Constructor"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: fields.length.toString(),
            note: "Бачимо всі поля підкатегорій, які формують динамічну структуру каталогу.",
          },
          {
            label: "Обов'язкові",
            value: requiredCount.toString(),
            note: "Ці поля повинні бути заповнені для товарів відповідних підкатегорій.",
          },
          {
            label: "SELECT",
            value: selectCount.toString(),
            note: "Поля з наперед заданими варіантами значень для контрольованого вводу.",
          },
          {
            label: "Опції",
            value: totalOptions.toString(),
            note: "Сумарна кількість select-опцій, які вже описані в конструкторі.",
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
        note={`Полів, уже пов'язаних із товарами: ${usedByProductsCount}. Такі записи не можна небезпечно змінювати або видаляти.`}
      />

      <AdminSectionCard
        title="Список і деталі полів"
        description="Ліва колонка показує всі характеристики підкатегорій, права — деталі вибраного поля та робочий CRUD-конструктор."
      >
        <AdminSplitLayout
          list={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Поля каталогу</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Уже зараз видно, до якої підкатегорії належить поле, який у
                    нього тип і чи використовується воно товарами.
                  </p>
                </div>
                <Badge variant="outline">{fields.length} записів</Badge>
              </div>

              <AdminListTable
                items={fields}
                columns={[
                  {
                    key: "label",
                    header: "Поле",
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
                    title="Поля ще не знайдені"
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
                  <p className="text-sm font-medium">Деталі поля</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Detail panel уже показує реальні дані поля, його
                    підкатегорію, тип, опції та рівень використання в товарах.
                  </p>
                </div>

                <AdminDetailList
                  items={[
                    {
                      label: "Label",
                      value: selectedField.label,
                      note:
                        selectedField.helpText ??
                        "Службова підказка для цього поля поки не задана.",
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
                        selectedField.type === "SELECT"
                          ? "Поле працює через наперед визначені опції."
                          : "Поле зберігає пряме значення відповідного типу.",
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
                  }}
                />

                <AdminSectionCard
                  title="Select options"
                  description="Якщо поле має тип SELECT, тут видно повний набір дозволених значень і їх фактичне використання."
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
                        title="Для цього поля ще немає опцій"
                        description="Це нормальний стан для не-SELECT полів. Якщо зміните тип на SELECT, тут з'являться дозволені варіанти значень."
                      />
                    )}
                  </div>
                </AdminSectionCard>
              </div>
            ) : (
              <div className="space-y-4">
                <AdminEmptyState
                  icon={getAdminModuleIcon("fields")}
                  title="Немає обраного поля"
                  description="Можна одразу створити нове поле нижче, або вибрати існуюче зі списку для редагування."
                />

                <AdminFieldCrud
                  subcategories={subcategories.map((subcategory) => ({
                    id: subcategory.id,
                    name: subcategory.name,
                    categoryName: subcategory.category.name,
                  }))}
                  selectedField={null}
                />
              </div>
            )
          }
        />
      </AdminSectionCard>
    </div>
  );
}
