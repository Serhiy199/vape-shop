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
import { showAdminToast } from "@/components/admin/admin-toast";
import {
  AdminOptionalInputField,
  AdminOptionalTextareaField,
} from "@/components/admin/admin-optional-fields";
import { AdminEmptyState } from "@/components/admin/admin-primitives";
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
  updateSubcategoryAction,
} from "@/features/catalog/actions/admin-catalog";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
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

type SelectedSubcategory = {
  categoryId: string;
  description: string | null;
  id: string;
  isActive: boolean;
  name: string;
  productsCount: number;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  sortOrder: number;
};

type AdminSubcategoryCrudProps = {
  categories: CategoryOption[];
  selectedSubcategory: SelectedSubcategory | null;
};

const emptyValues: SubcategoryFormValues = {
  categoryId: "",
  description: "",
  isActive: true,
  name: "",
  seoDescription: "",
  seoTitle: "",
  slug: "",
  sortOrder: "0",
};

function buildCreateValues(
  categories: CategoryOption[],
): SubcategoryFormValues {
  return {
    ...emptyValues,
    categoryId: categories[0]?.id ?? "",
  };
}

function buildEditValues(
  subcategory: SelectedSubcategory,
): SubcategoryFormValues {
  return {
    categoryId: subcategory.categoryId,
    description: subcategory.description ?? "",
    isActive: subcategory.isActive,
    name: subcategory.name,
    seoDescription: subcategory.seoDescription ?? "",
    seoTitle: subcategory.seoTitle ?? "",
    slug: subcategory.slug,
    sortOrder: subcategory.sortOrder.toString(),
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): SubcategoryFieldErrors {
  return {
    categoryId: fieldErrors?.categoryId?.[0],
    description: fieldErrors?.description?.[0],
    isActive: fieldErrors?.isActive?.[0],
    name: fieldErrors?.name?.[0],
    seoDescription: fieldErrors?.seoDescription?.[0],
    seoTitle: fieldErrors?.seoTitle?.[0],
    slug: fieldErrors?.slug?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
  };
}

function SubcategoryFormFields({
  categories,
  categoryChangeBlocked,
  errors,
  heading,
  values,
  onActiveChange,
  onCategoryChange,
  onInputChange,
}: {
  categories: CategoryOption[];
  categoryChangeBlocked?: boolean;
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
      description="Підкатегорія завжди прив'язана до категорії, а видалення замінене статусом активності."
    >
      <AdminFormGrid>
        <AdminField label="Категорія" error={errors.categoryId} required>
          <Select
            items={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            value={values.categoryId}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger
              className="w-full"
              aria-invalid={Boolean(errors.categoryId)}
            >
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
          name="name"
          label="Назва"
          value={values.name}
          onChange={(event) => onInputChange("name", event.target.value)}
          error={errors.name}
          required
        />

        <AdminInputField
          id={`${heading}-slug`}
          name="slug"
          label="Slug"
          value={values.slug}
          onChange={(event) => onInputChange("slug", event.target.value)}
          error={errors.slug}
          hint="Можна залишити порожнім, тоді slug згенерується з назви."
        />

        <AdminInputField
          id={`${heading}-sort-order`}
          name="sortOrder"
          type="number"
          min={0}
          step={1}
          label="Порядок"
          value={values.sortOrder}
          onChange={(event) => onInputChange("sortOrder", event.target.value)}
          error={errors.sortOrder}
          required
        />

        <AdminOptionalInputField
          id={`${heading}-seo-title`}
          name="seoTitle"
          label="SEO title"
          value={values.seoTitle}
          onChange={(event) => onInputChange("seoTitle", event.target.value)}
          error={errors.seoTitle}
        />
      </AdminFormGrid>

      <div className="mt-4 space-y-4">
        <AdminOptionalTextareaField
          id={`${heading}-description`}
          name="description"
          label="Опис"
          value={values.description}
          onChange={(event) => onInputChange("description", event.target.value)}
          error={errors.description}
          rows={3}
        />

        <AdminOptionalTextareaField
          id={`${heading}-seo-description`}
          name="seoDescription"
          label="SEO description"
          value={values.seoDescription}
          onChange={(event) =>
            onInputChange("seoDescription", event.target.value)
          }
          error={errors.seoDescription}
          rows={3}
        />

        <AdminField label="Статус" error={errors.isActive}>
          <div className="border-border/70 bg-muted/30 flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {values.isActive ? "Активна" : "Неактивна"}
              </p>
              <p className="text-muted-foreground text-sm leading-6">
                Неактивна підкатегорія лишається в базі й зберігає зв&apos;язки
                з товарами, але не має показуватися у публічному каталозі.
              </p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={onActiveChange}
              aria-label="Активна підкатегорія"
            />
          </div>
        </AdminField>

        {categoryChangeBlocked ? (
          <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-lg border px-4 py-3 text-sm leading-6">
            До цієї підкатегорії вже прив&apos;язані товари. Зміну категорії
            заблоковано, щоб не розірвати структуру каталогу.
          </div>
        ) : null}
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
  const [activeAction, setActiveAction] = useState<"create" | "update" | null>(
    null,
  );

  const initialCreateValues = useMemo(
    () => buildCreateValues(categories),
    [categories],
  );

  const [createValues, setCreateValues] =
    useState<SubcategoryFormValues>(initialCreateValues);
  const [createErrors, setCreateErrors] = useState<SubcategoryFieldErrors>({});
  const [, setCreateMessage] = useState<string | null>(null);
  const [, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<SubcategoryFormValues | null>(
    selectedSubcategory ? buildEditValues(selectedSubcategory) : null,
  );
  const [editErrors, setEditErrors] = useState<SubcategoryFieldErrors>({});
  const [, setEditMessage] = useState<string | null>(null);
  const [, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Keep the default category current when the list arrives after navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCreateValues((current) => ({
      ...current,
      categoryId: current.categoryId || categories[0]?.id || "",
    }));
  }, [categories]);

  useEffect(() => {
    // Reset edit form state when the selected row changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditValues(
      selectedSubcategory ? buildEditValues(selectedSubcategory) : null,
    );
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

  const categoryChangeBlocked =
    Boolean(selectedSubcategory && editValues) &&
    selectedSubcategory!.productsCount > 0 &&
    editValues!.categoryId !== selectedSubcategory!.categoryId;

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
          showAdminToast({
            title: "Не вдалося створити підкатегорію",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setCreateErrors({});
        setCreateValues(initialCreateValues);
        setCreateSuccess("Підкатегорію створено.");
        showAdminToast({
          title: "Підкатегорію створено",
          message: result.data.name,
        });
        router.push(`/admin/subcategories?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSubcategory || !editValues || categoryChangeBlocked) {
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
          showAdminToast({
            title: "Не вдалося оновити підкатегорію",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setEditErrors({});
        setEditSuccess("Підкатегорію оновлено.");
        showAdminToast({
          title: "Підкатегорію оновлено",
          message: result.data.name,
        });
        router.push(`/admin/subcategories?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  if (!categories.length) {
    return (
      <AdminEmptyState
        title="Спочатку створіть категорію"
        description="Підкатегорія обов'язково має categoryId, тому форма стане доступною після створення хоча б однієї категорії."
      />
    );
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleCreate}>
        <SubcategoryFormFields
          heading="Нова підкатегорія"
          categories={categories}
          values={createValues}
          errors={createErrors}
          onCategoryChange={(categoryId) => {
            setCreateValues((current) => ({
              ...current,
              categoryId: categoryId ?? "",
            }));
            setCreateErrors((current) => ({
              ...current,
              categoryId: undefined,
            }));
          }}
          onActiveChange={(isActive) => {
            setCreateValues((current) => ({
              ...current,
              isActive,
            }));
            setCreateErrors((current) => ({
              ...current,
              isActive: undefined,
            }));
          }}
          onInputChange={updateCreateField}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {activeAction === "create" ? "Створюємо..." : "Створити"}
          </Button>
        </div>
      </form>

      {selectedSubcategory && editValues ? (
        <form className="space-y-4" onSubmit={handleUpdate}>
          <SubcategoryFormFields
            heading="Редагування підкатегорії"
            categories={categories}
            values={editValues}
            errors={editErrors}
            categoryChangeBlocked={categoryChangeBlocked}
            onCategoryChange={(categoryId) => {
              setEditValues((current) =>
                current
                  ? {
                      ...current,
                      categoryId: categoryId ?? "",
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
            onActiveChange={(isActive) => {
              setEditValues((current) =>
                current
                  ? {
                      ...current,
                      isActive,
                    }
                  : current,
              );
              setEditErrors((current) => ({
                ...current,
                isActive: undefined,
              }));
            }}
            onInputChange={updateEditField}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || categoryChangeBlocked}>
              {activeAction === "update" ? "Зберігаємо..." : "Зберегти зміни"}
            </Button>
          </div>
        </form>
      ) : (
        <AdminEmptyState
          title="Оберіть підкатегорію для редагування"
          description="Форма створення доступна вище. Після вибору підкатегорії зі списку тут з'явиться редагування назви, фото, категорії та статусу."
        />
      )}
    </div>
  );
}
