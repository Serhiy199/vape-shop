"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
  AdminTextareaField,
} from "@/components/admin/admin-form-primitives";
import { Button } from "@/components/ui/button";
import { updateCategoryAction } from "@/features/catalog/actions/admin-catalog";

type CategoryFormValues = {
  id: string;
  name: string;
  slug: string;
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
};

type CategoryFieldErrors = Partial<Record<keyof CategoryFormValues, string>>;

type AdminCategoryUpdateFormProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
  };
};

function buildInitialValues(
  category: AdminCategoryUpdateFormProps["category"],
): CategoryFormValues {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder.toString(),
    seoTitle: category.seoTitle ?? "",
    seoDescription: category.seoDescription ?? "",
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): CategoryFieldErrors {
  return {
    name: fieldErrors?.name?.[0],
    slug: fieldErrors?.slug?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
    seoTitle: fieldErrors?.seoTitle?.[0],
    seoDescription: fieldErrors?.seoDescription?.[0],
  };
}

export function AdminCategoryUpdateForm({
  category,
}: AdminCategoryUpdateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(() => buildInitialValues(category));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});

  useEffect(() => {
    setValues(buildInitialValues(category));
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});
  }, [category]);

  const handleFieldChange =
    (field: keyof CategoryFormValues) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const nextValue = event.target.value;

      setValues((current) => ({
        ...current,
        [field]: nextValue,
      }));
      setFieldErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
      setErrorMessage(null);
      setSuccessMessage(null);
    };

  const handleReset = () => {
    setValues(buildInitialValues(category));
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateCategoryAction({
        id: values.id,
        name: values.name,
        slug: values.slug,
        sortOrder: values.sortOrder,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
      });

      if (!result.ok) {
        setErrorMessage(result.error);
        setFieldErrors(mapFieldErrors(result.fieldErrors));
        return;
      }

      setFieldErrors({});
      setSuccessMessage("Зміни категорії збережено.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AdminFormSection
        title="Редагування fixed category"
        description="Форма вже працює з реальним update write-side: можна змінювати назву, slug, порядок сортування та SEO-поля."
      >
        <AdminFormGrid>
          <AdminInputField
            id="category-name"
            name="name"
            label="Назва"
            value={values.name}
            onChange={handleFieldChange("name")}
            error={fieldErrors.name}
            required
          />
          <AdminInputField
            id="category-slug"
            name="slug"
            label="Slug"
            value={values.slug}
            onChange={handleFieldChange("slug")}
            error={fieldErrors.slug}
            hint="Лише нижній регістр, цифри та дефіси."
            required
          />
          <AdminInputField
            id="category-sort-order"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            label="Порядок сортування"
            value={values.sortOrder}
            onChange={handleFieldChange("sortOrder")}
            error={fieldErrors.sortOrder}
            required
          />
          <AdminInputField
            id="category-seo-title"
            name="seoTitle"
            label="SEO title"
            value={values.seoTitle}
            onChange={handleFieldChange("seoTitle")}
            error={fieldErrors.seoTitle}
          />
        </AdminFormGrid>

        <div className="mt-4 space-y-4">
          <AdminTextareaField
            id="category-seo-description"
            name="seoDescription"
            label="SEO description"
            value={values.seoDescription}
            onChange={handleFieldChange("seoDescription")}
            error={fieldErrors.seoDescription}
            rows={4}
          />

          {errorMessage ? (
            <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="border-primary/20 bg-primary/8 rounded-2xl border px-4 py-3 text-sm">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm leading-6">
              Категорія лишається частиною fixed structure. Ця форма оновлює лише
              дозволені поля.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Зберігаємо..." : "Зберегти"}
              </Button>
            </div>
          </div>
        </div>
      </AdminFormSection>
    </form>
  );
}
