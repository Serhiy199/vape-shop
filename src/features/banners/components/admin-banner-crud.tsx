"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  AdminField,
  AdminFormGrid,
  AdminFormSection,
  AdminInputField,
} from "@/components/admin/admin-form-primitives";
import { showAdminToast } from "@/components/admin/admin-toast";
import {
  AdminEmptyState,
  AdminSectionCard,
} from "@/components/admin/admin-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createBannerAction,
  deleteBannerAction,
  toggleBannerStatusAction,
  updateBannerAction,
} from "@/features/banners/actions/admin-banners";

type BannerFormValues = {
  title: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder: string;
  isActive: boolean;
};

type BannerFieldErrors = Partial<Record<keyof BannerFormValues, string>>;

export type AdminBannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type AdminBannerCrudProps = {
  mode?: "all" | "create" | "edit";
  selectedBanner: AdminBannerItem | null;
  onUpdated?: () => void;
};

type UploadResponse =
  | {
      success: true;
      data: {
        file: {
          publicId: string;
          url: string;
        };
      };
    }
  | {
      success: false;
      error?: {
        message?: string;
      };
    };

function buildCreateValues(): BannerFormValues {
  return {
    title: "",
    imageUrl: "",
    targetUrl: "",
    sortOrder: "0",
    isActive: true,
  };
}

function buildEditValues(selectedBanner: AdminBannerItem): BannerFormValues {
  return {
    title: selectedBanner.title,
    imageUrl: selectedBanner.imageUrl,
    targetUrl: selectedBanner.targetUrl,
    sortOrder: selectedBanner.sortOrder.toString(),
    isActive: selectedBanner.isActive,
  };
}

function normalizeValues(values: BannerFormValues) {
  return {
    ...values,
    sortOrder: Number(values.sortOrder),
  };
}

function mapFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): BannerFieldErrors {
  return {
    title: fieldErrors?.title?.[0],
    imageUrl: fieldErrors?.imageUrl?.[0],
    targetUrl: fieldErrors?.targetUrl?.[0],
    sortOrder: fieldErrors?.sortOrder?.[0],
    isActive: fieldErrors?.isActive?.[0],
  };
}

function BannerImageUploadField({
  bannerTitle,
  error,
  id,
  value,
  onChange,
}: {
  bannerTitle: string;
  error?: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewUrl = localPreviewUrl ?? value;

  const clearLocalPreview = () => {
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  };

  const handleUpload = async (file: File) => {
    setMessage(null);

    if (!bannerTitle.trim()) {
      setMessage("Спочатку введіть назву банера.");
      return;
    }

    const allowedMimeTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]);

    if (!allowedMimeTypes.has(file.type)) {
      setMessage("Дозволені лише JPEG, PNG або WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Зображення має бути не більше 5 MB.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return nextPreviewUrl;
    });

    const formData = new FormData();
    formData.append("bannerTitle", bannerTitle);
    formData.append("files", file);

    setIsUploading(true);

    try {
      const response = await fetch("/api/upload/banner-images", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as UploadResponse;

      if (!response.ok || !payload.success) {
        clearLocalPreview();
        setMessage(
          payload.success
            ? "Не вдалося завантажити зображення."
            : (payload.error?.message ?? "Не вдалося завантажити зображення."),
        );
        return;
      }

      onChange(payload.data.file.url);
      setMessage("Зображення завантажено.");
    } catch {
      clearLocalPreview();
      setMessage("Не вдалося завантажити зображення.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <AdminField
      label="Зображення"
      htmlFor={id}
      error={error}
      required
      hint={message ?? "Завантажте файл або вставте URL нижче."}
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={(event) => {
              const [file] = Array.from(event.target.files ?? []);

              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading || !value}
            onClick={() => {
              onChange("");
              setMessage(null);
              clearLocalPreview();
            }}
          >
            Очистити
          </Button>
        </div>

        <Input
          value={value}
          placeholder="https://..."
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            clearLocalPreview();
            onChange(event.target.value);
          }}
        />

        {previewUrl ? (
          <div className="border-border/70 bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-muted border-border/70 h-28 w-16 shrink-0 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">
                {isUploading ? "Завантаження..." : "Превʼю банера"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {value || "Локальне превʼю"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </AdminField>
  );
}

function BannerFormFields({
  errors,
  heading,
  values,
  onActiveChange,
  onInputChange,
}: {
  errors: BannerFieldErrors;
  heading: string;
  values: BannerFormValues;
  onActiveChange: (value: boolean) => void;
  onInputChange: (
    field: keyof Omit<BannerFormValues, "isActive">,
    value: string,
  ) => void;
}) {
  return (
    <AdminFormSection
      title={heading}
      description="Банер показується на головній лише коли він активний."
    >
      <AdminFormGrid>
        <AdminInputField
          id={`${heading}-title`}
          label="Назва банера"
          value={values.title}
          onChange={(event) => onInputChange("title", event.target.value)}
          error={errors.title}
          required
        />

        <AdminInputField
          id={`${heading}-target-url`}
          label="URL переходу"
          value={values.targetUrl}
          onChange={(event) => onInputChange("targetUrl", event.target.value)}
          error={errors.targetUrl}
          placeholder="/catalog або https://..."
          required
        />

        <AdminInputField
          id={`${heading}-sort-order`}
          label="Порядок"
          type="number"
          min={0}
          max={9999}
          value={values.sortOrder}
          onChange={(event) => onInputChange("sortOrder", event.target.value)}
          error={errors.sortOrder}
          required
        />

        <AdminField label="Активний" error={errors.isActive}>
          <div className="border-border/70 bg-muted/30 flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {values.isActive ? "Активний" : "Неактивний"}
              </p>
              <p className="text-muted-foreground text-sm leading-6">
                Неактивні банери залишаються в адмінці, але не показуються на
                головній.
              </p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={onActiveChange}
              aria-label="Активний банер"
            />
          </div>
        </AdminField>
      </AdminFormGrid>

      <div className="mt-4">
        <BannerImageUploadField
          id={`${heading}-image`}
          bannerTitle={values.title}
          value={values.imageUrl}
          error={errors.imageUrl}
          onChange={(value) => onInputChange("imageUrl", value)}
        />
      </div>
    </AdminFormSection>
  );
}

export function AdminBannerCrud({
  mode = "all",
  onUpdated,
  selectedBanner,
}: AdminBannerCrudProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "create" | "delete" | "toggle" | "update" | null
  >(null);
  const initialCreateValues = useMemo(() => buildCreateValues(), []);
  const [createValues, setCreateValues] =
    useState<BannerFormValues>(initialCreateValues);
  const [createErrors, setCreateErrors] = useState<BannerFieldErrors>({});
  const [editValues, setEditValues] = useState<BannerFormValues | null>(
    selectedBanner ? buildEditValues(selectedBanner) : null,
  );
  const [editErrors, setEditErrors] = useState<BannerFieldErrors>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEditValues(selectedBanner ? buildEditValues(selectedBanner) : null);
      setEditErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedBanner]);

  const updateCreateField = (
    field: keyof Omit<BannerFormValues, "isActive">,
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
  };

  const updateEditField = (
    field: keyof Omit<BannerFormValues, "isActive">,
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
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActiveAction("create");
    startTransition(async () => {
      try {
        const result = await createBannerAction(normalizeValues(createValues));

        if (!result.ok) {
          setCreateErrors(mapFieldErrors(result.fieldErrors));
          showAdminToast({
            title: "Не вдалося створити банер",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setCreateErrors({});
        setCreateValues(initialCreateValues);
        showAdminToast({
          title: "Банер створено",
          message: result.data.title,
        });
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedBanner || !editValues) {
      return;
    }

    setActiveAction("update");
    startTransition(async () => {
      try {
        const result = await updateBannerAction({
          id: selectedBanner.id,
          ...normalizeValues(editValues),
        });

        if (!result.ok) {
          setEditErrors(mapFieldErrors(result.fieldErrors));
          showAdminToast({
            title: "Не вдалося оновити банер",
            message: result.error,
            variant: "error",
          });
          return;
        }

        setEditErrors({});
        showAdminToast({
          title: "Банер успішно оновлено",
          message: result.data.title,
        });
        onUpdated?.();
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleToggleStatus = () => {
    if (!selectedBanner) {
      return;
    }

    setActiveAction("toggle");
    startTransition(async () => {
      try {
        const result = await toggleBannerStatusAction({
          id: selectedBanner.id,
          isActive: !selectedBanner.isActive,
        });

        if (!result.ok) {
          showAdminToast({
            title: "Не вдалося змінити статус",
            message: result.error,
            variant: "error",
          });
          return;
        }

        showAdminToast({
          title: result.data.isActive
            ? "Банер активовано"
            : "Банер деактивовано",
          message: selectedBanner.title,
        });
        router.refresh();
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedBanner) {
      return;
    }

    const confirmed = window.confirm(
      `Видалити банер "${selectedBanner.title}"? Цю дію не можна скасувати.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("delete");
    startTransition(async () => {
      try {
        const result = await deleteBannerAction({
          id: selectedBanner.id,
        });

        if (!result.ok) {
          showAdminToast({
            title: "Не вдалося видалити банер",
            message: result.error,
            variant: "error",
          });
          return;
        }

        showAdminToast({
          title: "Банер видалено",
          message: selectedBanner.title,
        });
        router.push("/admin/banners");
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
          title="Створення банера"
          description="Додайте вертикальну афішу для головної сторінки."
        >
          <form className="space-y-4" onSubmit={handleCreate}>
            <BannerFormFields
              errors={createErrors}
              heading="Новий банер"
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

      {mode !== "create" && selectedBanner && editValues ? (
        <AdminSectionCard
          title="Редагування банера"
          description="Змініть зображення, посилання, порядок або видимість банера."
        >
          <form className="space-y-4" onSubmit={handleUpdate}>
            <BannerFormFields
              errors={editErrors}
              heading="Оновлення банера"
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
              }}
              onInputChange={updateEditField}
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {activeAction === "delete" ? "Видаляємо..." : "Видалити"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleStatus}
                disabled={isPending}
              >
                {activeAction === "toggle"
                  ? "Оновлюємо..."
                  : selectedBanner.isActive
                    ? "Зробити неактивним"
                    : "Зробити активним"}
              </Button>
              <Button type="submit" disabled={isPending}>
                {activeAction === "update" ? "Зберігаємо..." : "Зберегти зміни"}
              </Button>
            </div>
          </form>
        </AdminSectionCard>
      ) : mode !== "create" ? (
        <AdminEmptyState
          title="Оберіть банер для редагування"
          description="Форма створення доступна вище. Після вибору банера зі списку тут зʼявиться редагування."
        />
      ) : null}
    </div>
  );
}
