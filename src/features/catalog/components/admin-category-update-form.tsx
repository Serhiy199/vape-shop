"use client";

import type { FormEvent } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  AdminField,
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
  AdminTextareaField,
} from "@/components/admin/admin-form-primitives";
import { AdminEmptyState } from "@/components/admin/admin-primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/catalog/actions/admin-catalog";
import { CatalogImageUploadField } from "@/features/catalog/components/catalog-image-upload-field";

type CategoryFormValues = {
  description: string;
  image: string;
  isActive: boolean;
  name: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  sortOrder: string;
};

type CategoryFieldErrors = Partial<Record<keyof CategoryFormValues, string>>;

type SelectedCategory = {
  description: string | null;
  id: string;
  image: string | null;
  isActive: boolean;
  name: string;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  sortOrder: number;
};

type AdminCategoryUpdateFormProps = {
  category: SelectedCategory | null;
};

const createInitialValues: CategoryFormValues = {
  description: "",
  image: "",
  isActive: true,
  name: "",
  seoDescription: "",
  seoTitle: "",
  slug: "",
  sortOrder: "0",
};

function buildEditValues(category: SelectedCategory): CategoryFormValues {
  return {
    description: category.description ?? "",
    image: category.image ?? "",
    isActive: category.isActive,
    name: category.name,
    seoDescription: category.seoDescription ?? "",
    seoTitle: category.seoTitle ?? "",
    slug: category.slug,
    sortOrder: category.sortOrder.toString(),
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): CategoryFieldErrors {
  return {
    description: fieldErrors?.description?.[0],
    image: fieldErrors?.image?.[0],
    isActive: fieldErrors?.isActive?.[0],
    name: fieldErrors?.name?.[0],
    seoDescription: fieldErrors?.seoDescription?.[0],
    seoTitle: fieldErrors?.seoTitle?.[0],
    slug: fieldErrors?.slug?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
  };
}

function CategoryFormFields({
  errors,
  heading,
  values,
  onActiveChange,
  onImageChange,
  onInputChange,
}: {
  errors: CategoryFieldErrors;
  heading: string;
  values: CategoryFormValues;
  onActiveChange: (value: boolean) => void;
  onImageChange: (value: string) => void;
  onInputChange: (
    field: keyof Omit<CategoryFormValues, "image" | "isActive">,
    value: string,
  ) => void;
}) {
  return (
    <AdminFormSection title={heading}>
      <AdminFormGrid>
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
        <CatalogImageUploadField
          id={`${heading}-image`}
          entityType="category"
          entitySlug={values.slug || values.name}
          label="Фото категорії"
          value={values.image}
          onChange={onImageChange}
          error={errors.image}
        />
        <AdminInputField
          id={`${heading}-seo-title`}
          name="seoTitle"
          label="SEO title"
          value={values.seoTitle}
          onChange={(event) => onInputChange("seoTitle", event.target.value)}
          error={errors.seoTitle}
        />
      </AdminFormGrid>

      <div className="mt-4 space-y-4">
        <AdminTextareaField
          id={`${heading}-description`}
          name="description"
          label="Опис"
          value={values.description}
          onChange={(event) => onInputChange("description", event.target.value)}
          error={errors.description}
          rows={3}
        />
        <AdminTextareaField
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
                Неактивна категорія лишається в базі, але не має показуватися в
                каталозі.
              </p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={onActiveChange}
              aria-label="Активна категорія"
            />
          </div>
        </AdminField>
      </div>
    </AdminFormSection>
  );
}

export function AdminCategoryUpdateForm({
  category,
}: AdminCategoryUpdateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<"create" | "update" | null>(
    null,
  );

  const [createValues, setCreateValues] =
    useState<CategoryFormValues>(createInitialValues);
  const [createErrors, setCreateErrors] = useState<CategoryFieldErrors>({});
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<CategoryFormValues | null>(
    category ? buildEditValues(category) : null,
  );
  const [editErrors, setEditErrors] = useState<CategoryFieldErrors>({});
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    setEditValues(category ? buildEditValues(category) : null);
    setEditErrors({});
    setEditMessage(null);
    setEditSuccess(null);
  }, [category]);

  const updateCreateField = (
    field: keyof Omit<CategoryFormValues, "image" | "isActive">,
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
    field: keyof Omit<CategoryFormValues, "image" | "isActive">,
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
        const result = await createCategoryAction(createValues);

        if (!result.ok) {
          setCreateErrors(mapFieldErrors(result.fieldErrors));
          setCreateMessage(result.error);
          return;
        }

        setCreateErrors({});
        setCreateValues(createInitialValues);
        setCreateSuccess("Категорію створено.");
        router.push(`/admin/categories?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!category || !editValues) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);
    setActiveAction("update");

    startTransition(async () => {
      try {
        const result = await updateCategoryAction({
          id: category.id,
          ...editValues,
        });

        if (!result.ok) {
          setEditErrors(mapFieldErrors(result.fieldErrors));
          setEditMessage(result.error);
          return;
        }

        setEditErrors({});
        setEditSuccess("Категорію оновлено.");
        router.push(`/admin/categories?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleCreate}>
        <CategoryFormFields
          heading="Нова категорія"
          values={createValues}
          errors={createErrors}
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
          onImageChange={(image) => {
            setCreateValues((current) => ({
              ...current,
              image,
            }));
            setCreateErrors((current) => ({
              ...current,
              image: undefined,
            }));
          }}
          onInputChange={updateCreateField}
        />

        {createMessage ? (
          <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-lg border px-4 py-3 text-sm">
            {createMessage}
          </div>
        ) : null}
        {createSuccess ? (
          <div className="border-primary/20 bg-primary/8 rounded-lg border px-4 py-3 text-sm">
            {createSuccess}
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {activeAction === "create" ? "Створюємо..." : "Створити"}
          </Button>
        </div>
      </form>

      {category && editValues ? (
        <form className="space-y-4" onSubmit={handleUpdate}>
          <CategoryFormFields
            heading="Редагування категорії"
            values={editValues}
            errors={editErrors}
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
            onImageChange={(image) => {
              setEditValues((current) =>
                current
                  ? {
                      ...current,
                      image,
                    }
                  : current,
              );
              setEditErrors((current) => ({
                ...current,
                image: undefined,
              }));
            }}
            onInputChange={updateEditField}
          />

          {editMessage ? (
            <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-lg border px-4 py-3 text-sm">
              {editMessage}
            </div>
          ) : null}
          {editSuccess ? (
            <div className="border-primary/20 bg-primary/8 rounded-lg border px-4 py-3 text-sm">
              {editSuccess}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {activeAction === "update" ? "Зберігаємо..." : "Зберегти зміни"}
            </Button>
          </div>
        </form>
      ) : (
        <AdminEmptyState
          title="Оберіть категорію для редагування"
          description="Форма створення доступна вище. Після вибору категорії зі списку тут з'явиться редагування."
        />
      )}
    </div>
  );
}
