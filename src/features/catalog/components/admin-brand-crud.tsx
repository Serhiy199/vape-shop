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
import {
  AdminEmptyState,
  AdminSectionCard,
} from "@/components/admin/admin-primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  createBrandAction,
  toggleBrandStatusAction,
  updateBrandAction,
} from "@/features/catalog/actions/admin-catalog";

type SelectedBrand = {
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

type BrandFormValues = {
  description: string;
  isActive: boolean;
  name: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  sortOrder: string;
};

type BrandFieldErrors = Partial<Record<keyof BrandFormValues, string>>;

type AdminBrandCrudProps = {
  mode?: "all" | "create" | "edit";
  selectedBrand: SelectedBrand | null;
};

function buildCreateValues(): BrandFormValues {
  return {
    description: "",
    isActive: true,
    name: "",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    sortOrder: "0",
  };
}

function buildEditValues(selectedBrand: SelectedBrand): BrandFormValues {
  return {
    description: selectedBrand.description ?? "",
    isActive: selectedBrand.isActive,
    name: selectedBrand.name,
    seoDescription: selectedBrand.seoDescription ?? "",
    seoTitle: selectedBrand.seoTitle ?? "",
    slug: selectedBrand.slug,
    sortOrder: selectedBrand.sortOrder.toString(),
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): BrandFieldErrors {
  return {
    description: fieldErrors?.description?.[0],
    isActive: fieldErrors?.isActive?.[0],
    name: fieldErrors?.name?.[0],
    seoDescription: fieldErrors?.seoDescription?.[0],
    seoTitle: fieldErrors?.seoTitle?.[0],
    slug: fieldErrors?.slug?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
  };
}

function BrandFormFields({
  errors,
  heading,
  values,
  onActiveChange,
  onInputChange,
}: {
  errors: BrandFieldErrors;
  heading: string;
  values: BrandFormValues;
  onActiveChange: (value: boolean) => void;
  onInputChange: (
    field: keyof Omit<BrandFormValues, "isActive">,
    value: string,
  ) => void;
}) {
  return (
    <AdminFormSection title={heading}>
      <AdminFormGrid>
        <AdminInputField
          id={`${heading}-name`}
          label="Назва виробника"
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
          hint="Можна залишити порожнім, тоді slug згенерується з назви."
        />

        <AdminInputField
          id={`${heading}-sort-order`}
          label="Порядок"
          value={values.sortOrder}
          onChange={(event) => onInputChange("sortOrder", event.target.value)}
          error={errors.sortOrder}
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
          hint={`Якщо залишити порожнім: ${values.name}: замовити за вигідною ціною в Україні у VapeShop. Швидке оформлення, зручна доставка по Україні та актуальний асортимент.`}
        />

        <AdminField label="Статус" error={errors.isActive}>
          <div className="border-border/70 bg-muted/30 flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {values.isActive ? "Активний" : "Неактивний"}
              </p>
              <p className="text-muted-foreground text-sm leading-6">
                Неактивний виробник лишається в базі та не ламає товари, але не
                доступний для вибору в нових товарах.
              </p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={onActiveChange}
              aria-label="Активний виробник"
            />
          </div>
        </AdminField>

      </div>
    </AdminFormSection>
  );
}

export function AdminBrandCrud({
  mode = "all",
  selectedBrand,
}: AdminBrandCrudProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "create" | "toggle" | "update" | null
  >(null);

  const initialCreateValues = useMemo(() => buildCreateValues(), []);

  const [createValues, setCreateValues] =
    useState<BrandFormValues>(initialCreateValues);
  const [createErrors, setCreateErrors] = useState<BrandFieldErrors>({});
  const [, setCreateMessage] = useState<string | null>(null);
  const [, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<BrandFormValues | null>(
    selectedBrand ? buildEditValues(selectedBrand) : null,
  );
  const [editErrors, setEditErrors] = useState<BrandFieldErrors>({});
  const [, setEditMessage] = useState<string | null>(null);
  const [, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEditValues(selectedBrand ? buildEditValues(selectedBrand) : null);
      setEditErrors({});
      setEditMessage(null);
      setEditSuccess(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedBrand]);

  const updateCreateField = (
    field: keyof Omit<BrandFormValues, "isActive">,
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
    field: keyof Omit<BrandFormValues, "isActive">,
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
        const result = await createBrandAction(createValues);

        if (!result.ok) {
          setCreateErrors(mapFieldErrors(result.fieldErrors));
          setCreateMessage(result.error);
          showAdminToast({
            title: "Не вдалося створити виробника",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setCreateErrors({});
        setCreateSuccess("Виробника створено.");
        showAdminToast({
          title: "Виробника створено",
          message: result.data.name,
        });
        setCreateValues(initialCreateValues);
        router.push(`/admin/brands?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedBrand || !editValues) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);

    setActiveAction("update");
    startTransition(async () => {
      try {
        const result = await updateBrandAction({
          id: selectedBrand.id,
          ...editValues,
        });

        if (!result.ok) {
          setEditErrors(mapFieldErrors(result.fieldErrors));
          setEditMessage(result.error);
          showAdminToast({
            title: "Не вдалося оновити виробника",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setEditErrors({});
        setEditSuccess("Виробника оновлено.");
        showAdminToast({
          title: "Виробника оновлено",
          message: result.data.name,
        });
        router.push(`/admin/brands?selected=${result.data.id}`);
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleToggleStatus = () => {
    if (!selectedBrand) {
      return;
    }

    setEditMessage(null);
    setEditSuccess(null);

    setActiveAction("toggle");
    startTransition(async () => {
      try {
        const result = await toggleBrandStatusAction({
          id: selectedBrand.id,
          isActive: !selectedBrand.isActive,
        });

        if (!result.ok) {
          setEditMessage(result.error);
          showAdminToast({
            title: "Не вдалося змінити статус",
            message: result.error,
            variant: "error",
          });
          return;
        }

        showAdminToast({
          title: result.data.isActive
            ? "Виробника активовано"
            : "Виробника деактивовано",
          message: selectedBrand.name,
        });
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {mode !== "edit" ? (
        <AdminSectionCard
          title="Створення виробника"
          description="Оберіть підкатегорію та введіть назву виробника."
        >
          <form className="space-y-4" onSubmit={handleCreate}>
            <BrandFormFields
              errors={createErrors}
              heading="Новий виробник"
              values={createValues}
              onActiveChange={(value) => {
                setCreateValues((current) => ({
                  ...current,
                  isActive: value,
                }));
                setCreateErrors((current) => ({
                  ...current,
                  isActive: undefined,
                }));
                setCreateMessage(null);
                setCreateSuccess(null);
              }}
              onInputChange={updateCreateField}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {activeAction === "create" ? "Створюємо..." : "Створити"}
              </Button>
            </div>
          </form>
        </AdminSectionCard>
      ) : null}

      {mode !== "create" && selectedBrand && editValues ? (
        <AdminSectionCard
          title="Редагування виробника"
          description="Фізичного видалення немає. Для приховування використовуйте статус активності."
        >
          <form className="space-y-4" onSubmit={handleUpdate}>
            <BrandFormFields
              errors={editErrors}
              heading="Оновлення виробника"
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
                setEditErrors((current) => ({
                  ...current,
                  isActive: undefined,
                }));
                setEditMessage(null);
                setEditSuccess(null);
              }}
              onInputChange={updateEditField}
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleStatus}
                disabled={isPending}
              >
                {activeAction === "toggle"
                  ? "Оновлюємо..."
                  : selectedBrand.isActive
                    ? "Зробити неактивним"
                    : "Зробити активним"}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {activeAction === "update" ? "Зберігаємо..." : "Зберегти зміни"}
              </Button>
            </div>
          </form>
        </AdminSectionCard>
      ) : mode !== "create" ? (
        <AdminEmptyState
          title="Оберіть виробника для редагування"
          description="Форма створення доступна вище. Після вибору виробника зі списку тут з'явиться редагування."
        />
      ) : null}
    </div>
  );
}
