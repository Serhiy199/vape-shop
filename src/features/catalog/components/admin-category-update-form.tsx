"use client";

import type { FormEvent } from "react";
import { useEffect, useState, useTransition } from "react";
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
  AdminOptionalRichTextField,
  AdminOptionalTextareaField,
} from "@/components/admin/admin-optional-fields";
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
  onImageUploadingChange,
  onInputChange,
}: {
  errors: CategoryFieldErrors;
  heading: string;
  values: CategoryFormValues;
  onActiveChange: (value: boolean) => void;
  onImageChange: (value: string) => void;
  onImageUploadingChange: (value: boolean) => void;
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
          onUploadingChange={onImageUploadingChange}
          error={errors.image}
        />
        <AdminOptionalInputField
          id={`${heading}-seo-title`}
          name="seoTitle"
          label="SEO title"
          value={values.seoTitle}
          onChange={(event) => onInputChange("seoTitle", event.target.value)}
          error={errors.seoTitle}
          hint={`Якщо залишити порожнім: ${values.name}: купити в інтернет-магазині VapeShop`}
        />
      </AdminFormGrid>

      <div className="mt-4 space-y-4">
        <AdminOptionalRichTextField
          id={`${heading}-description`}
          label="Опис"
          value={values.description}
          onChange={(html) => onInputChange("description", html)}
          error={errors.description}
          placeholder="Додайте опис категорії з форматуванням, списками, посиланнями або фото."
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
          hint={`Якщо залишити порожнім: ${values.name}: замовити за вигідною ціною в Україні у VapeShop. Швидке оформлення, зручна доставка по Україні та актуальний асортимент.`}
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
  const [isCreateImageUploading, setIsCreateImageUploading] = useState(false);
  const [isEditImageUploading, setIsEditImageUploading] = useState(false);

  const [createValues, setCreateValues] =
    useState<CategoryFormValues>(createInitialValues);
  const [createErrors, setCreateErrors] = useState<CategoryFieldErrors>({});
  const [, setCreateMessage] = useState<string | null>(null);
  const [, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<CategoryFormValues | null>(
    category ? buildEditValues(category) : null,
  );
  const [editErrors, setEditErrors] = useState<CategoryFieldErrors>({});
  const [, setEditMessage] = useState<string | null>(null);
  const [, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEditValues(category ? buildEditValues(category) : null);
      setEditErrors({});
      setEditMessage(null);
      setEditSuccess(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
          showAdminToast({
            title: "Не вдалося створити категорію",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setCreateErrors({});
        setCreateValues(createInitialValues);
        setCreateSuccess("Категорію створено.");
        showAdminToast({
          title: "Категорію створено",
          message: result.data.name,
        });
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
          showAdminToast({
            title: "Не вдалося оновити категорію",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setEditErrors({});
        setEditSuccess("Категорію оновлено.");
        showAdminToast({
          title: "Категорію оновлено",
          message: result.data.name,
        });
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
          onImageUploadingChange={setIsCreateImageUploading}
          onInputChange={updateCreateField}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || isCreateImageUploading}>
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
            onImageUploadingChange={setIsEditImageUploading}
            onInputChange={updateEditField}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || isEditImageUploading}>
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
