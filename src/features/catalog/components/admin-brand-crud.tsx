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
  AdminOptionalInputField,
  AdminOptionalTextareaField,
} from "@/components/admin/admin-optional-fields";
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
  createBrandAction,
  toggleBrandStatusAction,
  updateBrandAction,
} from "@/features/catalog/actions/admin-catalog";

type SubcategoryOption = {
  category: {
    name: string;
  };
  id: string;
  name: string;
};

type SelectedBrand = {
  description: string | null;
  id: string;
  isActive: boolean;
  name: string;
  productsCount: number;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  subcategoryId: string;
};

type BrandFormValues = {
  description: string;
  isActive: boolean;
  name: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  subcategoryId: string;
};

type BrandFieldErrors = Partial<Record<keyof BrandFormValues, string>>;

type AdminBrandCrudProps = {
  selectedBrand: SelectedBrand | null;
  subcategories: SubcategoryOption[];
};

function buildCreateValues(subcategories: SubcategoryOption[]): BrandFormValues {
  return {
    description: "",
    isActive: true,
    name: "",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    subcategoryId: subcategories[0]?.id ?? "",
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
    subcategoryId: selectedBrand.subcategoryId,
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
    subcategoryId: fieldErrors?.subcategoryId?.[0],
  };
}

function BrandFormFields({
  errors,
  heading,
  subcategories,
  subcategoryChangeBlocked,
  values,
  onActiveChange,
  onInputChange,
  onSubcategoryChange,
}: {
  errors: BrandFieldErrors;
  heading: string;
  subcategories: SubcategoryOption[];
  subcategoryChangeBlocked?: boolean;
  values: BrandFormValues;
  onActiveChange: (value: boolean) => void;
  onInputChange: (
    field: keyof Omit<BrandFormValues, "isActive" | "subcategoryId">,
    value: string,
  ) => void;
  onSubcategoryChange: (value: string | null) => void;
}) {
  return (
    <AdminFormSection title={heading}>
      <AdminFormGrid>
        <AdminField
          label="Підкатегорія"
          error={errors.subcategoryId}
          required
        >
          <Select
            items={subcategories.map((subcategory) => ({
              label: `${subcategory.category.name} / ${subcategory.name}`,
              value: subcategory.id,
            }))}
            value={values.subcategoryId}
            onValueChange={onSubcategoryChange}
            disabled={subcategoryChangeBlocked}
          >
            <SelectTrigger
              className="w-full"
              aria-invalid={Boolean(errors.subcategoryId)}
            >
              <SelectValue placeholder="Оберіть підкатегорію" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.category.name} / {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>

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

        {subcategoryChangeBlocked ? (
          <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-lg border px-4 py-3 text-sm leading-6">
            До цього виробника вже прив'язані товари. Зміну підкатегорії
            заблоковано, щоб не розірвати структуру каталогу.
          </div>
        ) : null}
      </div>
    </AdminFormSection>
  );
}

export function AdminBrandCrud({
  selectedBrand,
  subcategories,
}: AdminBrandCrudProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "create" | "toggle" | "update" | null
  >(null);

  const initialCreateValues = useMemo(
    () => buildCreateValues(subcategories),
    [subcategories],
  );

  const [createValues, setCreateValues] =
    useState<BrandFormValues>(initialCreateValues);
  const [createErrors, setCreateErrors] = useState<BrandFieldErrors>({});
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editValues, setEditValues] = useState<BrandFormValues | null>(
    selectedBrand ? buildEditValues(selectedBrand) : null,
  );
  const [editErrors, setEditErrors] = useState<BrandFieldErrors>({});
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCreateValues((current) => ({
      ...current,
      subcategoryId: current.subcategoryId || subcategories[0]?.id || "",
    }));
  }, [subcategories]);

  useEffect(() => {
    setEditValues(selectedBrand ? buildEditValues(selectedBrand) : null);
    setEditErrors({});
    setEditMessage(null);
    setEditSuccess(null);
  }, [selectedBrand]);

  const updateCreateField = (
    field: keyof Omit<BrandFormValues, "isActive" | "subcategoryId">,
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
    field: keyof Omit<BrandFormValues, "isActive" | "subcategoryId">,
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

  const subcategoryChangeBlocked =
    Boolean(selectedBrand && editValues) &&
    selectedBrand!.productsCount > 0 &&
    editValues!.subcategoryId !== selectedBrand!.subcategoryId;

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
          return;
        }

        setCreateErrors({});
        setCreateSuccess("Виробника створено.");
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

    if (!selectedBrand || !editValues || subcategoryChangeBlocked) {
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
          return;
        }

        setEditErrors({});
        setEditSuccess("Виробника оновлено.");
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
          return;
        }

        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  if (!subcategories.length) {
    return (
      <AdminEmptyState
        title="Спочатку створіть підкатегорію"
        description="Виробник обов'язково прив'язується до підкатегорії, тому форма стане доступною після створення хоча б однієї підкатегорії."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Створення виробника"
        description="Оберіть підкатегорію та введіть назву виробника."
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <BrandFormFields
            errors={createErrors}
            heading="Новий виробник"
            subcategories={subcategories}
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
            onSubcategoryChange={(subcategoryId) => {
              setCreateValues((current) => ({
                ...current,
                subcategoryId: subcategoryId ?? "",
              }));
              setCreateErrors((current) => ({
                ...current,
                subcategoryId: undefined,
              }));
              setCreateMessage(null);
              setCreateSuccess(null);
            }}
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
      </AdminSectionCard>

      {selectedBrand && editValues ? (
        <AdminSectionCard
          title="Редагування виробника"
          description="Фізичного видалення немає. Для приховування використовуйте статус активності."
        >
          <form className="space-y-4" onSubmit={handleUpdate}>
            <BrandFormFields
              errors={editErrors}
              heading="Оновлення виробника"
              subcategories={subcategories}
              subcategoryChangeBlocked={subcategoryChangeBlocked}
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
              onSubcategoryChange={(subcategoryId) => {
                setEditValues((current) =>
                  current
                    ? {
                        ...current,
                        subcategoryId: subcategoryId ?? "",
                      }
                    : current,
                );
                setEditErrors((current) => ({
                  ...current,
                  subcategoryId: undefined,
                }));
                setEditMessage(null);
                setEditSuccess(null);
              }}
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
                disabled={isPending || subcategoryChangeBlocked}
              >
                {activeAction === "update"
                  ? "Зберігаємо..."
                  : "Зберегти зміни"}
              </Button>
            </div>
          </form>
        </AdminSectionCard>
      ) : (
        <AdminEmptyState
          title="Оберіть виробника для редагування"
          description="Форма створення доступна вище. Після вибору виробника зі списку тут з'явиться редагування."
        />
      )}
    </div>
  );
}
