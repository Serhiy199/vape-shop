"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  AdminField,
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
} from "@/components/admin/admin-form-primitives";
import {
  AdminEmptyState,
  AdminSectionCard,
} from "@/components/admin/admin-primitives";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createSubcategoryFieldAction,
  deleteSubcategoryFieldAction,
  updateSubcategoryFieldAction,
} from "@/features/catalog/actions/admin-catalog";

const FIELD_TYPE_OPTIONS = [
  { value: "TEXT", label: "TEXT" },
  { value: "NUMBER", label: "NUMBER" },
  { value: "TEXTAREA", label: "TEXTAREA" },
  { value: "SELECT", label: "SELECT" },
  { value: "BOOLEAN", label: "BOOLEAN" },
] as const;

type FieldType = (typeof FIELD_TYPE_OPTIONS)[number]["value"];

type SubcategoryOption = {
  id: string;
  name: string;
  categoryName: string;
};

type FieldOptionValue = {
  id?: string;
  label: string;
  sortOrder: string;
  value: string;
};

type SelectedField = {
  id: string;
  isRequired: boolean;
  key: string;
  label: string;
  options: FieldOptionValue[];
  sortOrder: number;
  subcategory: {
    id: string;
  };
  type: FieldType;
};

type FieldFormValues = {
  isRequired: boolean;
  key: string;
  label: string;
  options: FieldOptionValue[];
  sortOrder: string;
  subcategoryId: string;
  type: FieldType;
};

type FieldFormErrors = {
  isRequired?: string;
  key?: string;
  label?: string;
  options?: string;
  sortOrder?: string;
  subcategoryId?: string;
  type?: string;
};

type AdminFieldCrudProps = {
  selectedField: SelectedField | null;
  subcategories: SubcategoryOption[];
};

function buildDefaultOption(index: number): FieldOptionValue {
  return {
    label: "",
    value: "",
    sortOrder: index.toString(),
  };
}

function buildCreateValues(subcategories: SubcategoryOption[]): FieldFormValues {
  return {
    isRequired: false,
    key: "",
    label: "",
    options: [],
    sortOrder: "0",
    subcategoryId: subcategories[0]?.id ?? "",
    type: "TEXT",
  };
}

function buildEditValues(selectedField: SelectedField): FieldFormValues {
  return {
    isRequired: selectedField.isRequired,
    key: selectedField.key,
    label: selectedField.label,
    options: selectedField.options.map((option, index) => ({
      id: option.id,
      label: option.label,
      sortOrder: option.sortOrder || (index + 1).toString(),
      value: option.value,
    })),
    sortOrder: selectedField.sortOrder.toString(),
    subcategoryId: selectedField.subcategory.id,
    type: selectedField.type,
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): FieldFormErrors {
  return {
    isRequired: fieldErrors?.isRequired?.[0],
    key: fieldErrors?.key?.[0],
    label: fieldErrors?.label?.[0],
    options: fieldErrors?.options?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
    subcategoryId: fieldErrors?.subcategoryId?.[0],
    type: fieldErrors?.type?.[0],
  };
}

function FieldOptionsEditor({
  errors,
  values,
  onAdd,
  onChange,
  onRemove,
}: {
  errors: FieldFormErrors;
  values: FieldOptionValue[];
  onAdd: () => void;
  onChange: (
    index: number,
    field: keyof Omit<FieldOptionValue, "id">,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <AdminFormSection
      title="Select options"
      description="Опції зберігаються прямо в полі підкатегорії та використовуються для валідації значень товару."
    >
      <div className="space-y-4">
        {values.length ? (
          values.map((option, index) => (
            <div
              key={option.id ?? `option-${index}`}
              className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Опція #{index + 1}</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Користувач бачитиме `label`, а в базі зберігатиметься `value`.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onRemove(index)}
                >
                  Видалити опцію
                </Button>
              </div>

              <AdminFormGrid>
                <AdminInputField
                  id={`option-label-${index}`}
                  label="Label"
                  value={option.label}
                  onChange={(event) =>
                    onChange(index, "label", event.target.value)
                  }
                  required
                />

                <AdminInputField
                  id={`option-value-${index}`}
                  label="Value"
                  value={option.value}
                  onChange={(event) =>
                    onChange(index, "value", event.target.value)
                  }
                  hint="Стабільне технічне значення для збереження й фільтрації."
                  required
                />

                <AdminInputField
                  id={`option-sortOrder-${index}`}
                  type="number"
                  min={0}
                  step={1}
                  label="Порядок сортування"
                  value={option.sortOrder}
                  onChange={(event) =>
                    onChange(index, "sortOrder", event.target.value)
                  }
                  required
                />
              </AdminFormGrid>
            </div>
          ))
        ) : (
          <AdminEmptyState
            title="Ще немає жодної опції"
            description="Для поля типу SELECT додайте хоча б одну опцію, інакше сервер не дозволить зберегти зміни."
          />
        )}

        {errors.options ? (
          <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
            {errors.options}
          </div>
        ) : null}

        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
          <Button type="button" variant="outline" onClick={onAdd}>
            Додати опцію
          </Button>
        </div>
      </div>
    </AdminFormSection>
  );
}

function FieldFormFields({
  errors,
  heading,
  subcategories,
  values,
  onAddOption,
  onOptionChange,
  onOptionRemove,
  onRequiredChange,
  onSubcategoryChange,
  onTypeChange,
  onValueChange,
}: {
  errors: FieldFormErrors;
  heading: string;
  subcategories: SubcategoryOption[];
  values: FieldFormValues;
  onAddOption: () => void;
  onOptionChange: (
    index: number,
    field: keyof Omit<FieldOptionValue, "id">,
    value: string,
  ) => void;
  onOptionRemove: (index: number) => void;
  onRequiredChange: (value: boolean) => void;
  onSubcategoryChange: (value: string | null) => void;
  onTypeChange: (value: FieldType) => void;
  onValueChange: (
    field: keyof Omit<FieldFormValues, "isRequired" | "options" | "subcategoryId" | "type">,
    value: string,
  ) => void;
}) {
  const isSelectType = values.type === "SELECT";

  return (
    <div className="space-y-4">
      <AdminFormSection
        title={heading}
        description="Форма напряму підключена до write-side конструктора полів підкатегорії."
      >
        <AdminFormGrid>
          <AdminField
            label="Підкатегорія"
            error={errors.subcategoryId}
            required
          >
            <Select
              items={subcategories.map((subcategory) => ({
                value: subcategory.id,
                label: `${subcategory.categoryName} / ${subcategory.name}`,
              }))}
              value={values.subcategoryId}
              onValueChange={onSubcategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Оберіть підкатегорію" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.categoryName} / {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>

          <AdminInputField
            id={`${heading}-label`}
            label="Label"
            value={values.label}
            onChange={(event) => onValueChange("label", event.target.value)}
            error={errors.label}
            required
          />

          <AdminInputField
            id={`${heading}-key`}
            label="Key"
            value={values.key}
            onChange={(event) => onValueChange("key", event.target.value)}
            error={errors.key}
            hint="Лише lower_snake_case: наприклад `coil_type`."
            required
          />

          <AdminField label="Type" error={errors.type} required>
            <Select
              items={FIELD_TYPE_OPTIONS}
              value={values.type}
              onValueChange={(value) => onTypeChange(value as FieldType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Оберіть тип поля" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>

          <AdminInputField
            id={`${heading}-sortOrder`}
            type="number"
            min={0}
            step={1}
            label="Порядок сортування"
            value={values.sortOrder}
            onChange={(event) => onValueChange("sortOrder", event.target.value)}
            error={errors.sortOrder}
            required
          />
        </AdminFormGrid>

        <div className="mt-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Обов&apos;язкове поле</p>
              <p className="text-muted-foreground text-sm leading-6">
                Якщо ввімкнено, товар цієї підкатегорії не повинен залишатися без значення цього поля.
              </p>
            </div>
            <Switch
              checked={values.isRequired}
              onCheckedChange={onRequiredChange}
              aria-label="Обов'язкове поле"
            />
          </div>
        </div>
      </AdminFormSection>

      {isSelectType ? (
        <FieldOptionsEditor
          errors={errors}
          values={values.options}
          onAdd={onAddOption}
          onChange={onOptionChange}
          onRemove={onOptionRemove}
        />
      ) : null}
    </div>
  );
}

export function AdminFieldCrud({
  selectedField,
  subcategories,
}: AdminFieldCrudProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "create" | "delete" | "update" | null
  >(null);

  const createInitialValues = useMemo(
    () => buildCreateValues(subcategories),
    [subcategories],
  );

  const [createValues, setCreateValues] = useState(createInitialValues);
  const [createErrors, setCreateErrors] = useState<FieldFormErrors>({});
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<FieldFormValues | null>(
    selectedField ? buildEditValues(selectedField) : null,
  );
  const [editErrors, setEditErrors] = useState<FieldFormErrors>({});
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCreateValues(buildCreateValues(subcategories));
      setCreateErrors({});
      setCreateMessage(null);
      setCreateSuccess(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [subcategories]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEditValues(selectedField ? buildEditValues(selectedField) : null);
      setEditErrors({});
      setEditMessage(null);
      setEditSuccess(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedField]);

  const clearCreateFeedback = () => {
    setCreateMessage(null);
    setCreateSuccess(null);
  };

  const clearEditFeedback = () => {
    setEditMessage(null);
    setEditSuccess(null);
  };

  const updateCreateField = (
    field: keyof Omit<
      FieldFormValues,
      "isRequired" | "options" | "subcategoryId" | "type"
    >,
    value: string,
  ) => {
    setCreateValues((current) => ({
      ...current,
      [field]: value,
    }));
    setCreateErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    clearCreateFeedback();
  };

  const updateEditField = (
    field: keyof Omit<
      FieldFormValues,
      "isRequired" | "options" | "subcategoryId" | "type"
    >,
    value: string,
  ) => {
    setEditValues((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
    setEditErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    clearEditFeedback();
  };

  const updateOptionList = (
    mode: "create" | "edit",
    updater: (options: FieldOptionValue[]) => FieldOptionValue[],
  ) => {
    if (mode === "create") {
      setCreateValues((current) => ({
        ...current,
        options: updater(current.options),
      }));
      setCreateErrors((current) => ({
        ...current,
        options: undefined,
      }));
      clearCreateFeedback();
      return;
    }

    setEditValues((current) =>
      current
        ? {
            ...current,
            options: updater(current.options),
          }
        : current,
    );
    setEditErrors((current) => ({
      ...current,
      options: undefined,
    }));
    clearEditFeedback();
  };

  const setTypeValue = (mode: "create" | "edit", value: FieldType) => {
    if (mode === "create") {
      setCreateValues((current) => ({
        ...current,
        type: value,
        options:
          value === "SELECT"
            ? current.options.length
              ? current.options
              : [buildDefaultOption(1)]
            : [],
      }));
      setCreateErrors((current) => ({
        ...current,
        options: undefined,
        type: undefined,
      }));
      clearCreateFeedback();
      return;
    }

    setEditValues((current) =>
      current
        ? {
            ...current,
            type: value,
            options:
              value === "SELECT"
                ? current.options.length
                  ? current.options
                  : [buildDefaultOption(1)]
                : [],
          }
        : current,
    );
    setEditErrors((current) => ({
      ...current,
      options: undefined,
      type: undefined,
    }));
    clearEditFeedback();
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateMessage(null);
    setCreateSuccess(null);

    setActiveAction("create");
    startTransition(async () => {
      try {
        const result = await createSubcategoryFieldAction(createValues);

        if (!result.ok) {
          setCreateErrors(mapFieldErrors(result.fieldErrors));
          setCreateMessage(result.error);
          return;
        }

        setCreateErrors({});
        setCreateSuccess("Поле підкатегорії створено.");
        setCreateValues(buildCreateValues(subcategories));
        router.push(`/admin/fields?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedField || !editValues) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);

    setActiveAction("update");
    startTransition(async () => {
      try {
        const result = await updateSubcategoryFieldAction({
          id: selectedField.id,
          ...editValues,
        });

        if (!result.ok) {
          setEditErrors(mapFieldErrors(result.fieldErrors));
          setEditMessage(result.error);
          return;
        }

        setEditErrors({});
        setEditSuccess("Поле підкатегорії оновлено.");
        router.push(`/admin/fields?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedField) {
      return;
    }

    const confirmed = window.confirm(
      `Видалити поле "${selectedField.label}"?`,
    );

    if (!confirmed) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);

    setActiveAction("delete");
    startTransition(async () => {
      try {
        const result = await deleteSubcategoryFieldAction({
          id: selectedField.id,
        });

        if (!result.ok) {
          setEditMessage(result.error);
          return;
        }

        router.push("/admin/fields");
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {selectedField && editValues ? (
        <AdminSectionCard
          title="Редагування та видалення"
          description="Тут уже працює реальний update/delete для вибраного поля підкатегорії."
        >
          <form className="space-y-4" onSubmit={handleUpdate}>
            <FieldFormFields
              errors={editErrors}
              heading="Оновлення поля"
              subcategories={subcategories}
              values={editValues}
              onAddOption={() => {
                updateOptionList("edit", (options) => [
                  ...options,
                  buildDefaultOption(options.length + 1),
                ]);
              }}
              onOptionChange={(index, field, value) => {
                updateOptionList("edit", (options) =>
                  options.map((option, optionIndex) =>
                    optionIndex === index
                      ? {
                          ...option,
                          [field]: value,
                        }
                      : option,
                  ),
                );
              }}
              onOptionRemove={(index) => {
                updateOptionList("edit", (options) =>
                  options.filter((_, optionIndex) => optionIndex !== index),
                );
              }}
              onRequiredChange={(value) => {
                setEditValues((current) =>
                  current
                    ? {
                        ...current,
                        isRequired: value,
                      }
                    : current,
                );
                setEditErrors((current) => ({
                  ...current,
                  isRequired: undefined,
                }));
                clearEditFeedback();
              }}
              onSubcategoryChange={(value) => {
                if (!value) {
                  return;
                }

                setEditValues((current) =>
                  current
                    ? {
                        ...current,
                        subcategoryId: value,
                      }
                    : current,
                );
                setEditErrors((current) => ({
                  ...current,
                  subcategoryId: undefined,
                }));
                clearEditFeedback();
              }}
              onTypeChange={(value) => setTypeValue("edit", value)}
              onValueChange={updateEditField}
            />

            {editMessage ? (
              <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
                {editMessage}
              </div>
            ) : null}

            {editSuccess ? (
              <div className="border-primary/20 bg-primary/8 rounded-2xl border px-4 py-3 text-sm">
                {editSuccess}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm leading-6">
                Видалення доступне лише для полів, які ще не використовуються товарами.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {activeAction === "delete" ? "Видаляємо..." : "Видалити"}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {activeAction === "update" ? "Зберігаємо..." : "Зберегти зміни"}
                </Button>
              </div>
            </div>
          </form>
        </AdminSectionCard>
      ) : (
        <AdminEmptyState
          title="Оберіть поле для редагування"
          description="Create-форма вже доступна нижче, а щойно ви виберете поле зі списку, тут з'явиться реальний update/delete."
        />
      )}

      <AdminSectionCard
        title="Створення нового поля"
        description="Форма створює нову характеристику для конкретної підкатегорії та одразу відкриває її в detail panel."
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <FieldFormFields
            errors={createErrors}
            heading="Нове поле"
            subcategories={subcategories}
            values={createValues}
            onAddOption={() => {
              updateOptionList("create", (options) => [
                ...options,
                buildDefaultOption(options.length + 1),
              ]);
            }}
            onOptionChange={(index, field, value) => {
              updateOptionList("create", (options) =>
                options.map((option, optionIndex) =>
                  optionIndex === index
                    ? {
                        ...option,
                        [field]: value,
                      }
                    : option,
                ),
              );
            }}
            onOptionRemove={(index) => {
              updateOptionList("create", (options) =>
                options.filter((_, optionIndex) => optionIndex !== index),
              );
            }}
            onRequiredChange={(value) => {
              setCreateValues((current) => ({
                ...current,
                isRequired: value,
              }));
              setCreateErrors((current) => ({
                ...current,
                isRequired: undefined,
              }));
              clearCreateFeedback();
            }}
            onSubcategoryChange={(value) => {
              if (!value) {
                return;
              }

              setCreateValues((current) => ({
                ...current,
                subcategoryId: value,
              }));
              setCreateErrors((current) => ({
                ...current,
                subcategoryId: undefined,
              }));
              clearCreateFeedback();
            }}
            onTypeChange={(value) => setTypeValue("create", value)}
            onValueChange={updateCreateField}
          />

          {createMessage ? (
            <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
              {createMessage}
            </div>
          ) : null}

          {createSuccess ? (
            <div className="border-primary/20 bg-primary/8 rounded-2xl border px-4 py-3 text-sm">
              {createSuccess}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm leading-6">
              Тепер структура характеристик збирається з адмінки, без ручного редагування seed чи коду.
            </p>
            <Button type="submit" disabled={isPending}>
              {activeAction === "create" ? "Створюємо..." : "Створити поле"}
            </Button>
          </div>
        </form>
      </AdminSectionCard>
    </div>
  );
}
