"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  AdminField,
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
  AdminTextareaField,
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
  createSubcategoryAction,
  deleteSubcategoryAction,
  updateSubcategoryAction,
} from "@/features/catalog/actions/admin-catalog";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type SelectedSubcategory = {
  id: string;
  category: {
    id: string;
  };
  description: string | null;
  isActive: boolean;
  name: string;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  sortOrder: number;
};

type SubcategoryFormValues = {
  categoryId: string;
  description: string;
  isActive: boolean;
  name: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  sortOrder: string;
};

type SubcategoryFieldErrors = Partial<
  Record<keyof SubcategoryFormValues, string>
>;

type AdminSubcategoryCrudProps = {
  categories: CategoryOption[];
  selectedSubcategory: SelectedSubcategory | null;
};

function buildCreateValues(categories: CategoryOption[]): SubcategoryFormValues {
  return {
    categoryId: categories[0]?.id ?? "",
    description: "",
    isActive: true,
    name: "",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    sortOrder: "0",
  };
}

function buildEditValues(
  selectedSubcategory: SelectedSubcategory,
): SubcategoryFormValues {
  return {
    categoryId: selectedSubcategory.category.id,
    description: selectedSubcategory.description ?? "",
    isActive: selectedSubcategory.isActive,
    name: selectedSubcategory.name,
    seoDescription: selectedSubcategory.seoDescription ?? "",
    seoTitle: selectedSubcategory.seoTitle ?? "",
    slug: selectedSubcategory.slug,
    sortOrder: selectedSubcategory.sortOrder.toString(),
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): SubcategoryFieldErrors {
  return {
    categoryId: fieldErrors?.categoryId?.[0],
    description: fieldErrors?.description?.[0],
    name: fieldErrors?.name?.[0],
    seoDescription: fieldErrors?.seoDescription?.[0],
    seoTitle: fieldErrors?.seoTitle?.[0],
    slug: fieldErrors?.slug?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
  };
}

function SubcategoryFormFields({
  categories,
  errors,
  heading,
  values,
  onActiveChange,
  onCategoryChange,
  onInputChange,
}: {
  categories: CategoryOption[];
  errors: SubcategoryFieldErrors;
  heading: string;
  values: SubcategoryFormValues;
  onActiveChange: (value: boolean) => void;
  onCategoryChange: (value: string | null) => void;
  onInputChange: (
    field: keyof Omit<SubcategoryFormValues, "categoryId" | "isActive">,
    value: string,
  ) => void;
}) {
  return (
    <AdminFormSection
      title={heading}
      description="Поля напряму підключені до write-side для підкатегорій."
    >
      <AdminFormGrid>
        <AdminField
          label="Батьківська категорія"
          error={errors.categoryId}
          required
        >
          <Select value={values.categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Оберіть категорію" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>

        <AdminInputField
          id={`${heading}-name`}
          label="Назва"
          value={values.name}
          onChange={(event) => onInputChange("name", event.target.value)}
          error={errors.name}
          required
        />

        <AdminInputField
          id={`${heading}-slug`}
          label="Slug"
          value={values.slug}
          onChange={(event) => onInputChange("slug", event.target.value)}
          error={errors.slug}
          hint="Лише нижній регістр, цифри та дефіси."
          required
        />

        <AdminInputField
          id={`${heading}-sortOrder`}
          type="number"
          min={0}
          step={1}
          label="Порядок сортування"
          value={values.sortOrder}
          onChange={(event) => onInputChange("sortOrder", event.target.value)}
          error={errors.sortOrder}
          required
        />

        <AdminInputField
          id={`${heading}-seoTitle`}
          label="SEO title"
          value={values.seoTitle}
          onChange={(event) => onInputChange("seoTitle", event.target.value)}
          error={errors.seoTitle}
        />
      </AdminFormGrid>

      <div className="mt-4 space-y-4">
        <AdminTextareaField
          id={`${heading}-description`}
          label="Опис"
          value={values.description}
          onChange={(event) => onInputChange("description", event.target.value)}
          error={errors.description}
          rows={4}
        />

        <AdminTextareaField
          id={`${heading}-seoDescription`}
          label="SEO description"
          value={values.seoDescription}
          onChange={(event) =>
            onInputChange("seoDescription", event.target.value)
          }
          error={errors.seoDescription}
          rows={4}
        />

        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Активна на сайті</p>
            <p className="text-muted-foreground text-sm leading-6">
              Дає змогу контролювати видимість підкатегорії без втручання в код.
            </p>
          </div>
          <Switch
            checked={values.isActive}
            onCheckedChange={onActiveChange}
            aria-label="Активна на сайті"
          />
        </div>
      </div>
    </AdminFormSection>
  );
}

export function AdminSubcategoryCrud({
  categories,
  selectedSubcategory,
}: AdminSubcategoryCrudProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "create" | "delete" | "update" | null
  >(null);

  const createInitialValues = useMemo(
    () => buildCreateValues(categories),
    [categories],
  );

  const [createValues, setCreateValues] = useState(createInitialValues);
  const [createErrors, setCreateErrors] = useState<SubcategoryFieldErrors>({});
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<SubcategoryFormValues | null>(
    selectedSubcategory ? buildEditValues(selectedSubcategory) : null,
  );
  const [editErrors, setEditErrors] = useState<SubcategoryFieldErrors>({});
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCreateValues(buildCreateValues(categories));
    setCreateErrors({});
    setCreateMessage(null);
    setCreateSuccess(null);
  }, [categories]);

  useEffect(() => {
    setEditValues(selectedSubcategory ? buildEditValues(selectedSubcategory) : null);
    setEditErrors({});
    setEditMessage(null);
    setEditSuccess(null);
  }, [selectedSubcategory]);

  const updateCreateField = (
    field: keyof Omit<SubcategoryFormValues, "categoryId" | "isActive">,
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
    setCreateMessage(null);
    setCreateSuccess(null);
  };

  const updateEditField = (
    field: keyof Omit<SubcategoryFormValues, "categoryId" | "isActive">,
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
    setEditMessage(null);
    setEditSuccess(null);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateMessage(null);
    setCreateSuccess(null);

    setActiveAction("create");
    startTransition(async () => {
      try {
        const result = await createSubcategoryAction(createValues);

        if (!result.ok) {
          setCreateErrors(mapFieldErrors(result.fieldErrors));
          setCreateMessage(result.error);
          return;
        }

        setCreateErrors({});
        setCreateSuccess("Підкатегорію створено.");
        setCreateValues(buildCreateValues(categories));
        router.push(`/admin/subcategories?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSubcategory || !editValues) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);

    setActiveAction("update");
    startTransition(async () => {
      try {
        const result = await updateSubcategoryAction({
          id: selectedSubcategory.id,
          ...editValues,
        });

        if (!result.ok) {
          setEditErrors(mapFieldErrors(result.fieldErrors));
          setEditMessage(result.error);
          return;
        }

        setEditErrors({});
        setEditSuccess("Підкатегорію оновлено.");
        router.push(`/admin/subcategories?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedSubcategory) {
      return;
    }

    const confirmed = window.confirm(
      `Видалити підкатегорію "${selectedSubcategory.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);

    setActiveAction("delete");
    startTransition(async () => {
      try {
        const result = await deleteSubcategoryAction({
          id: selectedSubcategory.id,
        });

        if (!result.ok) {
          setEditMessage(result.error);
          return;
        }

        router.push("/admin/subcategories");
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {selectedSubcategory && editValues ? (
        <AdminSectionCard
          title="Редагування та видалення"
          description="Тут уже працює реальний update/delete для вибраної підкатегорії."
        >
          <form className="space-y-4" onSubmit={handleUpdate}>
            <SubcategoryFormFields
              categories={categories}
              errors={editErrors}
              heading="Оновлення підкатегорії"
              values={editValues}
              onActiveChange={(value) => {
                setEditValues((current) =>
                  current
                    ? {
                        ...current,
                        isActive: value,
                      }
                    : current,
                );
                setEditMessage(null);
                setEditSuccess(null);
              }}
              onCategoryChange={(value) => {
                if (!value) {
                  return;
                }

                setEditValues((current) =>
                  current
                    ? {
                        ...current,
                        categoryId: value,
                      }
                    : current,
                );
                setEditErrors((current) => ({
                  ...current,
                  categoryId: undefined,
                }));
                setEditMessage(null);
                setEditSuccess(null);
              }}
              onInputChange={updateEditField}
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
                Видалення доступне лише для підкатегорій без пов&apos;язаних полів і
                товарів.
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
          title="Оберіть підкатегорію для редагування"
          description="Create форма вже доступна нижче, а щойно ви виберете підкатегорію зі списку, тут з'явиться реальний update/delete."
        />
      )}

      <AdminSectionCard
        title="Створення нової підкатегорії"
        description="Форма створює нову підкатегорію всередині fixed category та одразу відкриває її в detail panel."
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <SubcategoryFormFields
            categories={categories}
            errors={createErrors}
            heading="Нова підкатегорія"
            values={createValues}
            onActiveChange={(value) => {
              setCreateValues((current) => ({
                ...current,
                isActive: value,
              }));
              setCreateMessage(null);
              setCreateSuccess(null);
            }}
            onCategoryChange={(value) => {
              if (!value) {
                return;
              }

              setCreateValues((current) => ({
                ...current,
                categoryId: value,
              }));
              setCreateErrors((current) => ({
                ...current,
                categoryId: undefined,
              }));
              setCreateMessage(null);
              setCreateSuccess(null);
            }}
            onInputChange={updateCreateField}
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
              Після створення адміну більше не потрібно лізти в код, щоб
              розширити структуру каталогу.
            </p>
            <Button type="submit" disabled={isPending}>
              {activeAction === "create"
                ? "Створюємо..."
                : "Створити підкатегорію"}
            </Button>
          </div>
        </form>
      </AdminSectionCard>
    </div>
  );
}
