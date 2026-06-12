"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/features/catalog/actions/admin-catalog";
import { slugifyText } from "@/lib/text/slug";

type CategoryOption = {
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
};

type SubcategoryOption = {
  category: {
    id: string;
    isActive: boolean;
    name: string;
  };
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
};

type BrandOption = {
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
  subcategoryId: string;
};

type FieldOption = {
  id: string;
  label: string;
  sortOrder: number;
  value: string;
};

type FieldDefinition = {
  helpText: string | null;
  id: string;
  isRequired: boolean;
  key: string;
  label: string;
  options: FieldOption[];
  sortOrder: number;
  subcategoryId: string;
  type: "TEXT" | "NUMBER" | "TEXTAREA" | "SELECT" | "MULTI_SELECT" | "BOOLEAN";
};

type SelectedProduct = {
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  brand: {
    id: string;
    isActive: boolean;
    name: string;
    subcategoryId: string;
  } | null;
  category: {
    id: string;
    isActive: boolean;
    name: string;
  };
  description: string | null;
  fieldValues: Array<{
    field: {
      id: string;
      key: string;
      label: string;
      type: FieldDefinition["type"];
    };
    option: {
      id: string;
      label: string;
    } | null;
    optionId: string | null;
    valueJson: unknown;
    valueBoolean: boolean | null;
    valueNumber: { toString(): string } | null;
    valueText: string | null;
  }>;
  id: string;
  images: Array<{
    alt: string | null;
    id: string;
    isPrimary: boolean;
    publicId: string;
    sortOrder: number;
    url: string;
  }>;
  option: {
    id: string;
    name: string;
    values: Array<{
      id: string;
      image: string;
      imagePublicId: string | null;
      label: string;
      slug: string | null;
      titleOverride: string | null;
      seoTitle: string | null;
      seoDescription: string | null;
      sortOrder: number;
    }>;
  } | null;
  isActive: boolean;
  isFeaturedDiscount: boolean;
  isFeaturedHit: boolean;
  isFeaturedNew: boolean;
  isFeaturedSale: boolean;
  price: { toString(): string };
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  subcategory: {
    categoryId: string;
    id: string;
    isActive: boolean;
    name: string;
  };
  title: string;
};

type ProductFormValues = {
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  brandId: string;
  categoryId: string;
  description: string;
  isActive: boolean;
  isFeaturedDiscount: boolean;
  isFeaturedHit: boolean;
  isFeaturedNew: boolean;
  isFeaturedSale: boolean;
  price: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  subcategoryId: string;
  title: string;
};

type ProductFieldErrors = Partial<Record<keyof ProductFormValues, string>>;

type ProductDynamicValue = {
  fieldId: string;
  optionId: string;
  optionIds: string[];
  valueBoolean: "" | "false" | "true";
  valueNumber: string;
  valueText: string;
};

type ProductImageDraft = {
  alt: string;
  id?: string;
  isPrimary: boolean;
  publicId: string;
  url: string;
};

type ProductOptionValueDraft = {
  existingImage: string;
  id?: string;
  image: string;
  imagePublicId: string;
  imageRemoved: boolean;
  label: string;
  slug: string;
  titleOverride: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: string;
};

type ProductOptionDraft = {
  id?: string;
  name: string;
  values: ProductOptionValueDraft[];
};

type ProductOptionErrors = {
  general?: string;
  name?: string;
  values?: Record<number, { image?: string; label?: string }>;
};

type NormalizedSubmittedFieldValue =
  | {
      fieldId: string;
      optionId: string;
    }
  | {
      fieldId: string;
      valueJson: string[];
    }
  | {
      fieldId: string;
      valueBoolean: boolean;
    }
  | {
      fieldId: string;
      valueNumber: number;
    }
  | {
      fieldId: string;
      valueText: string;
    };

type SelectedUploadPreview = {
  name: string;
  url: string;
};

type ProductStepId =
  | "category"
  | "subcategory"
  | "dynamic"
  | "base"
  | "images"
  | "options"
  | "seo";

type AdminProductCrudProps = {
  brands: BrandOption[];
  categories: CategoryOption[];
  fields: FieldDefinition[];
  mode?: "all" | "create" | "edit";
  selectedProduct: SelectedProduct | null;
  subcategories: SubcategoryOption[];
};

const NO_BRAND_VALUE = "__none__";

const AVAILABILITY_OPTIONS = [
  { value: "IN_STOCK", label: "В наявності" },
  { value: "OUT_OF_STOCK", label: "Немає в наявності" },
] as const;

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Так" },
  { value: "false", label: "Ні" },
] as const;

const PRODUCT_STEPS: Array<{ id: ProductStepId; label: string }> = [
  { id: "category", label: "1. Category" },
  { id: "subcategory", label: "2. Subcategory" },
  { id: "dynamic", label: "3. Характеристики" },
  { id: "base", label: "4. Base data" },
  { id: "images", label: "5. Images" },
  { id: "options", label: "6. Опції товару" },
  { id: "seo", label: "7. SEO" },
];

function findFirstSubcategoryId(
  categoryId: string,
  subcategories: SubcategoryOption[],
) {
  return (
    subcategories.find((subcategory) => subcategory.category.id === categoryId)
      ?.id ?? ""
  );
}

function withCurrentCategoryOption(
  categories: CategoryOption[],
  selectedProduct: SelectedProduct | null,
) {
  const activeCategories = categories.filter((category) => category.isActive);

  if (
    selectedProduct &&
    !activeCategories.some(
      (category) => category.id === selectedProduct.category.id,
    )
  ) {
    const currentCategory = categories.find(
      (category) => category.id === selectedProduct.category.id,
    );

    if (currentCategory) {
      return [...activeCategories, currentCategory];
    }
  }

  return activeCategories;
}

function withCurrentSubcategoryOption(
  subcategories: SubcategoryOption[],
  selectedProduct: SelectedProduct | null,
) {
  const activeSubcategories = subcategories.filter(
    (subcategory) => subcategory.isActive && subcategory.category.isActive,
  );

  if (
    selectedProduct &&
    !activeSubcategories.some(
      (subcategory) => subcategory.id === selectedProduct.subcategory.id,
    )
  ) {
    const currentSubcategory = subcategories.find(
      (subcategory) => subcategory.id === selectedProduct.subcategory.id,
    );

    if (currentSubcategory) {
      return [...activeSubcategories, currentSubcategory];
    }
  }

  return activeSubcategories;
}

function formatCatalogOptionStatus(isActive: boolean) {
  return isActive ? "" : " (inactive)";
}

const PRODUCT_FIELD_LABELS: Record<string, string> = {
  availability: "Наявність",
  brandId: "Виробник",
  categoryId: "Категорія",
  description: "Опис",
  fieldValues: "Характеристики",
  images: "Фото товару",
  option: "Опції товару",
  price: "Ціна",
  seoDescription: "SEO description",
  seoTitle: "SEO title",
  slug: "Slug",
  subcategoryId: "Підкатегорія",
  title: "Назва товару",
};

const GENERIC_SERVER_VALIDATION_MESSAGE =
  "Перевірте коректність заповнених даних.";

function normalizeValidationMessage(message: string) {
  if (message === "Required" || message === "Invalid input") {
    return "заповніть або перевірте це поле.";
  }

  if (message === "Invalid url") {
    return "має бути коректним URL.";
  }

  if (message.includes("String must contain at most")) {
    return "значення занадто довге.";
  }

  if (message.includes("String must contain at least")) {
    return "поле обов'язкове.";
  }

  return message;
}

function normalizeFieldError(message: string | undefined) {
  return message ? normalizeValidationMessage(message) : undefined;
}

function formatFieldValidationMessage(field: string, message: string) {
  const label = PRODUCT_FIELD_LABELS[field] ?? field;
  const normalizedMessage = normalizeValidationMessage(message);

  if (field === "images") {
    return "Фото товару: додайте головне фото або перезавантажте некоректне фото.";
  }

  if (field === "option") {
    if (message.startsWith("Значення опції #")) {
      return `Опції товару: ${message}`;
    }

    if (
      message === "Required" ||
      message === "Invalid input" ||
      normalizedMessage === "заповніть або перевірте це поле."
    ) {
      return "Опції товару: перевірте назву опції, назви значень і фото для кожного значення.";
    }

    return `Опції товару: ${normalizedMessage}`;
  }

  return `${label}: ${normalizedMessage}`;
}

function getServerValidationMessage(
  result: Extract<
    Awaited<ReturnType<typeof createProductAction>>,
    { ok: false }
  >,
) {
  if (result.error && result.error !== GENERIC_SERVER_VALIDATION_MESSAGE) {
    return result.error;
  }

  const fieldErrors = result.fieldErrors ?? {};
  const firstFieldError = Object.entries(fieldErrors).find(
    ([, errors]) => errors?.some(Boolean),
  );

  if (firstFieldError) {
    const [field, errors] = firstFieldError;
    const message = errors?.find(Boolean);

    if (message) {
      return formatFieldValidationMessage(field, message);
    }
  }

  return result.error ?? "Не вдалося зберегти товар.";
}

function buildCreateValues(
  categories: CategoryOption[],
  subcategories: SubcategoryOption[],
): ProductFormValues {
  const categoryId = categories[0]?.id ?? "";

  return {
    availability: "IN_STOCK",
    brandId: NO_BRAND_VALUE,
    categoryId,
    description: "",
    isActive: true,
    isFeaturedDiscount: false,
    isFeaturedHit: false,
    isFeaturedNew: false,
    isFeaturedSale: false,
    price: "0",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    subcategoryId: findFirstSubcategoryId(categoryId, subcategories),
    title: "",
  };
}

function buildEditValues(selectedProduct: SelectedProduct): ProductFormValues {
  return {
    availability: selectedProduct.availability,
    brandId: selectedProduct.brand?.id ?? NO_BRAND_VALUE,
    categoryId: selectedProduct.category.id,
    description: selectedProduct.description ?? "",
    isActive: selectedProduct.isActive,
    isFeaturedDiscount: selectedProduct.isFeaturedDiscount,
    isFeaturedHit: selectedProduct.isFeaturedHit,
    isFeaturedNew: selectedProduct.isFeaturedNew,
    isFeaturedSale: selectedProduct.isFeaturedSale,
    price: selectedProduct.price.toString(),
    seoDescription: selectedProduct.seoDescription ?? "",
    seoTitle: selectedProduct.seoTitle ?? "",
    slug: selectedProduct.slug,
    subcategoryId: selectedProduct.subcategory.id,
    title: selectedProduct.title,
  };
}

function buildDynamicValueMap(
  selectedProduct: SelectedProduct | null,
): Record<string, ProductDynamicValue> {
  if (!selectedProduct) {
    return {};
  }

  return Object.fromEntries(
    selectedProduct.fieldValues.map((fieldValue) => [
      fieldValue.field.id,
      {
        fieldId: fieldValue.field.id,
        optionId: fieldValue.optionId ?? "",
        optionIds: Array.isArray(fieldValue.valueJson)
          ? fieldValue.valueJson.filter(
              (optionId): optionId is string => typeof optionId === "string",
            )
          : [],
        valueBoolean:
          typeof fieldValue.valueBoolean === "boolean"
            ? fieldValue.valueBoolean
              ? "true"
              : "false"
            : "",
        valueNumber: fieldValue.valueNumber?.toString() ?? "",
        valueText: fieldValue.valueText ?? "",
      },
    ]),
  );
}

function buildImageDrafts(selectedProduct: SelectedProduct | null) {
  if (!selectedProduct) {
    return [];
  }

  return selectedProduct.images.map((image) => ({
    alt: image.alt ?? "",
    id: image.id,
    isPrimary: image.isPrimary,
    publicId: image.publicId,
    url: image.url,
  }));
}

function buildProductOptionDraft(
  selectedProduct: SelectedProduct | null,
): ProductOptionDraft | null {
  if (!selectedProduct?.option) {
    return null;
  }

  return {
    id: selectedProduct.option.id,
    name: selectedProduct.option.name,
    values: selectedProduct.option.values.map((value, index) => ({
      existingImage: value.image,
      id: value.id,
      image: value.image,
      imagePublicId: value.imagePublicId ?? "",
      imageRemoved: false,
      label: value.label,
      slug: value.slug ?? "",
      titleOverride: value.titleOverride ?? "",
      seoTitle: value.seoTitle ?? "",
      seoDescription: value.seoDescription ?? "",
      sortOrder: value.sortOrder.toString() || (index + 1).toString(),
    })),
  };
}

function getSubcategoryFields(
  fields: FieldDefinition[],
  subcategoryId: string,
) {
  return fields
    .filter((field) => field.subcategoryId === subcategoryId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function getEmptyDynamicValue(fieldId: string): ProductDynamicValue {
  return {
    fieldId,
    optionId: "",
    optionIds: [],
    valueBoolean: "",
    valueNumber: "",
    valueText: "",
  };
}

function normalizeImages(images: ProductImageDraft[]) {
  return images.map((image, index) => ({
    alt: image.alt,
    isPrimary: image.isPrimary,
    publicId: image.publicId.trim(),
    sortOrder: index,
    url: image.url.trim(),
  }));
}

function normalizeProductOption(option: ProductOptionDraft | null) {
  if (!option) {
    return undefined;
  }

  return {
    id: option.id,
    name: option.name,
    values: option.values.map((value, index) => ({
      id: value.id,
      image: getProductOptionValueImage(value),
      imagePublicId: value.imageRemoved
        ? undefined
        : value.imagePublicId || undefined,
      imageRemoved: value.imageRemoved,
      label: value.label,
      slug: value.slug || undefined,
      titleOverride: value.titleOverride || undefined,
      seoTitle: value.seoTitle || undefined,
      seoDescription: value.seoDescription || undefined,
      sortOrder: Number(value.sortOrder || index),
    })),
  };
}

function getProductOptionValueImage(value: ProductOptionValueDraft) {
  if (value.imageRemoved) {
    return "";
  }

  return value.image.trim() || value.existingImage.trim();
}

function hasProductOptionValueImage(value: ProductOptionValueDraft) {
  return getProductOptionValueImage(value).length > 0;
}

function validateProductOption(option: ProductOptionDraft | null) {
  const errors: ProductOptionErrors = {};

  if (!option) {
    return errors;
  }

  if (!option.name.trim()) {
    errors.name =
      "Вкажіть назву опції, наприклад Смак, Колір або Опір.";
  }

  if (option.values.length === 0) {
    errors.general =
      "Додайте хоча б одне значення опції або вимкніть блок.";
    return errors;
  }

  const valueErrors: NonNullable<ProductOptionErrors["values"]> = {};

  option.values.forEach((value, index) => {
    const current: { image?: string; label?: string } = {};

    if (!value.label.trim()) {
      current.label = "Вкажіть назву значення.";
    }

    if (!hasProductOptionValueImage(value) && !value.imageRemoved) {
      current.image = "Завантажте фото для цього значення.";
    }

    if (current.label || current.image) {
      valueErrors[index] = current;
    }
  });

  if (Object.keys(valueErrors).length > 0) {
    errors.values = valueErrors;
  }

  return errors;
}
function normalizeFieldValues(
  fieldDefinitions: FieldDefinition[],
  dynamicValues: Record<string, ProductDynamicValue>,
) {
  const normalizedValues: NormalizedSubmittedFieldValue[] = [];

  fieldDefinitions.forEach((field) => {
    const value = dynamicValues[field.id] ?? getEmptyDynamicValue(field.id);

    if (field.type === "SELECT") {
      if (!value.optionId) {
        return;
      }

      normalizedValues.push({
        fieldId: field.id,
        optionId: value.optionId,
      });
      return;
    }

    if (field.type === "MULTI_SELECT") {
      const optionIds = value.optionIds.filter(Boolean);

      if (optionIds.length === 0) {
        return;
      }

      normalizedValues.push({
        fieldId: field.id,
        valueJson: optionIds,
      });
      return;
    }

    if (field.type === "NUMBER") {
      const trimmed = value.valueNumber.trim();
      if (!trimmed) {
        return;
      }

      normalizedValues.push({
        fieldId: field.id,
        valueNumber: Number(trimmed.replace(",", ".")),
      });
      return;
    }

    if (field.type === "BOOLEAN") {
      if (!value.valueBoolean) {
        return;
      }

      normalizedValues.push({
        fieldId: field.id,
        valueBoolean: value.valueBoolean === "true",
      });
      return;
    }

    const trimmedText = value.valueText.trim();
    if (!trimmedText) {
      return;
    }

    normalizedValues.push({
      fieldId: field.id,
      valueText: trimmedText,
    });
  });

  return normalizedValues;
}

function validateBaseFields(values: ProductFormValues) {
  const errors: ProductFieldErrors = {};

  if (!values.title.trim()) {
    errors.title = "Вкажіть назву товару.";
  }

  const parsedPrice = Number(values.price.replace(",", "."));
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    errors.price = "Вкажіть коректну ціну.";
  }

  return errors;
}

function validateSeoFields() {
  const errors: ProductFieldErrors = {};

  return errors;
}

function resolveProductSlug(values: ProductFormValues) {
  return values.slug.trim() || slugifyText(values.title);
}

function resolveSeoTitle(values: ProductFormValues) {
  return (
    values.seoTitle.trim() ||
    `${values.title.trim()}: купити в інтернет-магазині Voodoo Vape`
  );
}

function resolveSeoDescription(values: ProductFormValues) {
  return (
    values.seoDescription.trim() ||
    `${values.title.trim()}: замовити за вигідною ціною в Україні у Voodoo Vape. Швидке оформлення, зручна доставка по Україні та актуальний асортимент.`
  );
}
function validateDynamicFields(
  fieldDefinitions: FieldDefinition[],
  dynamicValues: Record<string, ProductDynamicValue>,
) {
  const errors: Record<string, string> = {};

  fieldDefinitions.forEach((field) => {
    const value = dynamicValues[field.id] ?? getEmptyDynamicValue(field.id);

    if (field.type === "SELECT") {
      if (field.isRequired && !value.optionId) {
        errors[field.id] = "Оберіть значення для цієї характеристики.";
      }
      return;
    }

    if (field.type === "MULTI_SELECT") {
      if (field.isRequired && value.optionIds.length === 0) {
        errors[field.id] =
          "Оберіть хоча б одне значення для цієї характеристики.";
      }
      return;
    }

    if (field.type === "NUMBER") {
      if (!value.valueNumber.trim()) {
        if (field.isRequired) {
          errors[field.id] = "Заповніть числове значення.";
        }
        return;
      }

      const parsed = Number(value.valueNumber.replace(",", "."));
      if (!Number.isFinite(parsed)) {
        errors[field.id] = "Вкажіть коректне число.";
      }
      return;
    }

    if (field.type === "BOOLEAN") {
      if (field.isRequired && !value.valueBoolean) {
        errors[field.id] = "Оберіть Так або Ні.";
      }
      return;
    }

    if (field.isRequired && !value.valueText.trim()) {
      errors[field.id] = "Заповніть цю характеристику.";
    }
  });

  return errors;
}
function validateImages(
  images: ProductImageDraft[],
  options: { requireImage: boolean },
) {
  const itemErrors: Record<number, { publicId?: string; url?: string }> = {};
  let generalError: string | null = null;

  if (images.length === 0) {
    if (!options.requireImage) {
      return {
        generalError,
        itemErrors,
      };
    }

    return {
      generalError: "Додайте головне фото товару.",
      itemErrors,
    };
  }

  const primaryCount = images.filter((image) => image.isPrimary).length;
  const galleryCount = images.filter((image) => !image.isPrimary).length;

  if (primaryCount !== 1) {
    generalError = "Товар повинен мати рівно одне головне фото.";
  } else if (galleryCount > 10) {
    generalError = "У галереї може бути не більше 10 фото.";
  } else if (images.length > 11) {
    generalError = "Товар може містити максимум 11 фото разом із головним.";
  }

  const seenPublicIds = new Set<string>();

  images.forEach((image, index) => {
    const nextErrors: { publicId?: string; url?: string } = {};

    if (!image.url.trim()) {
      nextErrors.url = "Перезавантажте це фото.";
    }

    if (!image.publicId.trim()) {
      nextErrors.publicId = "Перезавантажте це фото.";
    }

    if (image.publicId && seenPublicIds.has(image.publicId)) {
      nextErrors.publicId = "Це фото вже додано.";
    }

    if (image.publicId) {
      seenPublicIds.add(image.publicId);
    }

    if (nextErrors.url || nextErrors.publicId) {
      itemErrors[index] = nextErrors;
    }
  });

  return {
    generalError,
    itemErrors,
  };
}
function ProductThumbnail({ alt, src }: { alt: string; src: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="border-border/70 bg-muted/30 h-full overflow-hidden rounded-2xl border">
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full min-h-32 w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="text-muted-foreground flex h-full min-h-32 items-center justify-center text-sm">
          Preview unavailable
        </div>
      )}
    </div>
  );
}

function ProductWizard({
  brands,
  categories,
  fields,
  initialDynamicValues,
  initialImages,
  initialOption,
  initialValues,
  mode,
  onDelete,
  onSuccess,
  productId,
  subcategories,
}: {
  brands: BrandOption[];
  categories: CategoryOption[];
  fields: FieldDefinition[];
  initialDynamicValues: Record<string, ProductDynamicValue>;
  initialImages: ProductImageDraft[];
  initialOption: ProductOptionDraft | null;
  initialValues: ProductFormValues;
  mode: "create" | "edit";
  onDelete?: () => void;
  onSuccess: (id: string) => void;
  productId?: string;
  subcategories: SubcategoryOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    mode === "edit" && Boolean(initialValues.slug),
  );
  const [dynamicValues, setDynamicValues] = useState(initialDynamicValues);
  const [images, setImages] = useState<ProductImageDraft[]>(initialImages);
  const [optionDraft, setOptionDraft] = useState<ProductOptionDraft | null>(
    initialOption,
  );
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [dynamicErrors, setDynamicErrors] = useState<Record<string, string>>(
    {},
  );
  const [optionErrors, setOptionErrors] = useState<ProductOptionErrors>({});
  const [optionUploadIndex, setOptionUploadIndex] = useState<number | null>(
    null,
  );
  const [imageItemErrors, setImageItemErrors] = useState<
    Record<number, { publicId?: string; url?: string }>
  >({});
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const [selectedUploadPreviews, setSelectedUploadPreviews] = useState<
    SelectedUploadPreview[]
  >([]);
  const [, setGeneralMessage] = useState<string | null>(null);

  const selectedCategory = categories.find(
    (category) => category.id === values.categoryId,
  );
  const selectedSubcategory = subcategories.find(
    (subcategory) => subcategory.id === values.subcategoryId,
  );
  const relationHasInactiveCatalog =
    Boolean(selectedCategory && !selectedCategory.isActive) ||
    Boolean(selectedSubcategory && !selectedSubcategory.isActive) ||
    Boolean(selectedSubcategory && !selectedSubcategory.category.isActive);

  const availableSubcategories = useMemo(
    () =>
      subcategories.filter(
        (subcategory) =>
          subcategory.category.id === values.categoryId &&
          ((subcategory.isActive && subcategory.category.isActive) ||
            subcategory.id === initialValues.subcategoryId),
      ),
    [initialValues.subcategoryId, subcategories, values.categoryId],
  );

  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: `${category.name}${formatCatalogOptionStatus(category.isActive)}`,
      })),
    [categories],
  );

  const subcategoryItems = useMemo(
    () =>
      availableSubcategories.map((subcategory) => ({
        value: subcategory.id,
        label: `${subcategory.name}${formatCatalogOptionStatus(
          subcategory.isActive && subcategory.category.isActive,
        )}`,
      })),
    [availableSubcategories],
  );

  const availableBrands = useMemo(
    () =>
      brands.filter(
        (brand) =>
          brand.subcategoryId === values.subcategoryId &&
          (brand.isActive || brand.id === initialValues.brandId),
      ),
    [brands, initialValues.brandId, values.subcategoryId],
  );

  const brandItems = useMemo(
    () => [
      { value: NO_BRAND_VALUE, label: "Без виробника" },
      ...availableBrands.map((brand) => ({
        value: brand.id,
        label: `${brand.name}${formatCatalogOptionStatus(brand.isActive)}`,
      })),
    ],
    [availableBrands],
  );

  const currentFieldDefinitions = useMemo(
    () => getSubcategoryFields(fields, values.subcategoryId),
    [fields, values.subcategoryId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setValues(initialValues);
      setDynamicValues(initialDynamicValues);
      setImages(initialImages);
      setOptionDraft(initialOption);
      setFieldErrors({});
      setDynamicErrors({});
      setImageItemErrors({});
      setOptionErrors({});
      setOptionUploadIndex(null);
      setSelectedUploadFiles([]);
      setGeneralMessage(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    initialDynamicValues,
    initialImages,
    initialOption,
    initialValues,
    productId,
  ]);

  useEffect(() => {
    if (selectedUploadFiles.length === 0) {
      const timeoutId = window.setTimeout(() => {
        setSelectedUploadPreviews([]);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    const previews = selectedUploadFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const timeoutId = window.setTimeout(() => {
      setSelectedUploadPreviews(previews);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [selectedUploadFiles]);

  const clearMessages = () => {
    setGeneralMessage(null);
  };

  const updateValue = <TKey extends keyof ProductFormValues>(
    field: TKey,
    value: ProductFormValues[TKey],
  ) => {
    setValues((current) => {
      const nextValues = {
        ...current,
        [field]: value,
      };

      if (field === "title" && !isSlugManuallyEdited) {
        nextValues.slug = slugifyText(String(value));
      }

      return nextValues;
    });
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "title" ? { slug: undefined } : {}),
    }));
    clearMessages();
  };

  const updateSlug = (value: string) => {
    setIsSlugManuallyEdited(value.trim().length > 0);
    updateValue("slug", slugifyText(value));
  };

  const updateCategory = (categoryId: string | null) => {
    if (!categoryId) {
      return;
    }

    const nextSubcategoryId = findFirstSubcategoryId(
      categoryId,
      subcategories.filter(
        (subcategory) => subcategory.isActive && subcategory.category.isActive,
      ),
    );

    setValues((current) => ({
      ...current,
      brandId: NO_BRAND_VALUE,
      categoryId,
      subcategoryId: nextSubcategoryId,
    }));
    setFieldErrors((current) => ({
      ...current,
      brandId: undefined,
      categoryId: undefined,
      subcategoryId: undefined,
    }));
    setDynamicErrors({});
    clearMessages();
  };

  const updateSubcategory = (subcategoryId: string | null) => {
    if (!subcategoryId) {
      return;
    }

    setValues((current) => ({
      ...current,
      brandId:
        current.brandId !== NO_BRAND_VALUE &&
        brands.some(
          (brand) =>
            brand.id === current.brandId &&
            brand.subcategoryId === subcategoryId &&
            brand.isActive,
        )
          ? current.brandId
          : NO_BRAND_VALUE,
      subcategoryId,
    }));
    setFieldErrors((current) => ({
      ...current,
      brandId: undefined,
      subcategoryId: undefined,
    }));
    setDynamicErrors({});
    clearMessages();
  };

  const updateDynamicValue = (
    fieldId: string,
    patch: Partial<ProductDynamicValue>,
  ) => {
    setDynamicValues((current) => ({
      ...current,
      [fieldId]: {
        ...(current[fieldId] ?? getEmptyDynamicValue(fieldId)),
        ...patch,
      },
    }));
    setDynamicErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[fieldId];
      return nextErrors;
    });
    clearMessages();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedUploadFiles(files);
    clearMessages();
  };

  const uploadSelectedFiles = async () => {
    if (selectedUploadFiles.length === 0) {
      toast.error("Оберіть один або кілька файлів для завантаження.");
      return;
    }

    if (images.length + selectedUploadFiles.length > 11) {
      toast.error("Товар може містити максимум 11 фото разом із головним.");
      return;
    }

    const productSlug = resolveProductSlug(values);

    if (!productSlug) {
      toast.error("Вкажіть назву товару перед завантаженням фото.");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("existingCount", images.length.toString());
    uploadFormData.append("productSlug", productSlug);

    selectedUploadFiles.forEach((file) => {
      uploadFormData.append("files", file);
    });

    startTransition(async () => {
      const response = await fetch("/api/upload/product-images", {
        body: uploadFormData,
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        data?: {
          files?: Array<{
            publicId: string;
            url: string;
          }>;
        };
        error?: {
          message?: string;
        };
        message?: string;
        success?: boolean;
      } | null;

      if (!response.ok || !payload?.success) {
        toast.error(
          payload?.error?.message || "Не вдалося завантажити зображення.",
        );
        return;
      }

      const uploadedFiles = payload.data?.files ?? [];

      setImages((current) => [
        ...current,
        ...uploadedFiles.map((file, index) => ({
          alt: "",
          isPrimary: current.length === 0 && index === 0,
          publicId: file.publicId,
          url: file.url,
        })),
      ]);
      setSelectedUploadFiles([]);
      setSelectedUploadPreviews([]);
      toast.success(payload.message || "Фото товару завантажено.");
    });
  };
  const enableProductOption = () => {
    setOptionDraft({
      name: "",
      values: [
        {
          existingImage: "",
          image: "",
          imagePublicId: "",
          imageRemoved: false,
          label: "",
          slug: "",
          titleOverride: "",
          seoTitle: "",
          seoDescription: "",
          sortOrder: "0",
        },
      ],
    });
    setOptionErrors({});
    clearMessages();
  };

  const disableProductOption = () => {
    setOptionDraft(null);
    setOptionErrors({});
    clearMessages();
  };

  const updateOption = (patch: Partial<ProductOptionDraft>) => {
    setOptionDraft((current) =>
      current
        ? {
            ...current,
            ...patch,
          }
        : current,
    );
    setOptionErrors({});
    clearMessages();
  };

  const updateOptionValue = (
    index: number,
    patch: Partial<ProductOptionValueDraft>,
  ) => {
    setOptionDraft((current) =>
      current
        ? {
            ...current,
            values: current.values.map((value, valueIndex) =>
              valueIndex === index
                ? {
                    ...value,
                    ...patch,
                  }
                : value,
            ),
          }
        : current,
    );
    setOptionErrors({});
    clearMessages();
  };

  const addOptionValue = () => {
    setOptionDraft((current) =>
      current
        ? {
            ...current,
            values: [
              ...current.values,
              {
                existingImage: "",
                image: "",
                imagePublicId: "",
                imageRemoved: false,
                label: "",
                slug: "",
                titleOverride: "",
                seoTitle: "",
                seoDescription: "",
                sortOrder: current.values.length.toString(),
              },
            ],
          }
        : current,
    );
    setOptionErrors({});
    clearMessages();
  };

  const removeOptionValue = (index: number) => {
    setOptionDraft((current) =>
      current
        ? {
            ...current,
            values: current.values.filter(
              (_, valueIndex) => valueIndex !== index,
            ),
          }
        : current,
    );
    setOptionErrors({});
    clearMessages();
  };

  const uploadOptionValueImage = async (index: number, file: File) => {
    const productSlug = resolveProductSlug(values);

    if (!productSlug) {
      toast.error("Вкажіть назву товару перед завантаженням фото опції.");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("productSlug", productSlug);
    uploadFormData.append("valueNumber", (index + 1).toString());
    uploadFormData.append("file", file);

    setOptionUploadIndex(index);

    try {
      const response = await fetch("/api/upload/product-option-images", {
        body: uploadFormData,
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        data?: {
          file?: {
            publicId: string;
            url: string;
          };
        };
        error?: {
          message?: string;
        };
        message?: string;
        success?: boolean;
      } | null;

      if (!response.ok || !payload?.success || !payload.data?.file) {
        toast.error(
          payload?.error?.message ||
            "Не вдалося завантажити фото значення опції.",
        );
        return;
      }

      updateOptionValue(index, {
        image: payload.data.file.url,
        imagePublicId: payload.data.file.publicId,
        imageRemoved: false,
      });
      toast.success(payload.message || "Фото опції завантажено.");
    } finally {
      setOptionUploadIndex(null);
    }
  };
  const removeOptionValueImage = (index: number) => {
    updateOptionValue(index, {
      existingImage: "",
      image: "",
      imagePublicId: "",
      imageRemoved: true,
    });
  };
  const updateImage = (index: number, patch: Partial<ProductImageDraft>) => {
    setImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...image,
              ...patch,
            }
          : image,
      ),
    );
    setImageItemErrors((current) => ({
      ...current,
      [index]: {
        ...current[index],
        ...(patch.url !== undefined ? { url: undefined } : {}),
        ...(patch.publicId !== undefined ? { publicId: undefined } : {}),
      },
    }));
    clearMessages();
  };

  const setPrimaryImage = (index: number) => {
    setImages((current) =>
      current.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    );
    clearMessages();
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const nextImages = current.filter(
        (_, imageIndex) => imageIndex !== index,
      );

      if (
        nextImages.length > 0 &&
        !nextImages.some((image) => image.isPrimary)
      ) {
        nextImages[0] = {
          ...nextImages[0],
          isPrimary: true,
        };
      }

      return nextImages;
    });
    setImageItemErrors({});
    clearMessages();
  };

  const validateStep = (step: ProductStepId) => {
    let isValid = true;

    if (step === "category") {
      if (!values.categoryId) {
        setFieldErrors((current) => ({
          ...current,
          categoryId: "Оберіть категорію товару.",
        }));
        isValid = false;
      }
    }

    if (step === "subcategory") {
      if (!values.subcategoryId) {
        setFieldErrors((current) => ({
          ...current,
          subcategoryId: "Оберіть підкатегорію товару.",
        }));
        isValid = false;
      }
    }

    if (step === "dynamic") {
      const nextDynamicErrors = validateDynamicFields(
        currentFieldDefinitions,
        dynamicValues,
      );
      setDynamicErrors(nextDynamicErrors);

      if (Object.keys(nextDynamicErrors).length > 0) {
        isValid = false;
      }
    }

    if (step === "base") {
      const nextFieldErrors = validateBaseFields(values);
      setFieldErrors((current) => ({
        ...current,
        ...nextFieldErrors,
      }));

      if (Object.keys(nextFieldErrors).length > 0) {
        isValid = false;
      }
    }

    if (step === "images") {
      const validation = validateImages(images, {
        requireImage: mode === "create",
      });
      setImageItemErrors(validation.itemErrors);

      if (
        validation.generalError ||
        Object.keys(validation.itemErrors).length > 0
      ) {
        isValid = false;
      }
    }

    if (step === "options") {
      const nextOptionErrors = validateProductOption(optionDraft);
      setOptionErrors(nextOptionErrors);

      if (
        nextOptionErrors.general ||
        nextOptionErrors.name ||
        nextOptionErrors.values
      ) {
        isValid = false;
      }
    }

    if (step === "seo") {
      const nextFieldErrors = validateSeoFields();
      setFieldErrors((current) => ({
        ...current,
        ...nextFieldErrors,
      }));

      if (Object.keys(nextFieldErrors).length > 0) {
        isValid = false;
      }
    }

    return isValid;
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const stepResults = PRODUCT_STEPS.map((step) => validateStep(step.id));
    if (stepResults.some((isValid) => !isValid)) {
      toast.error("Перевірте обов'язкові поля товару.");
      return;
    }

    const resolvedSlug = resolveProductSlug(values);
    const payload = {
      availability: values.availability,
      brandId: values.brandId === NO_BRAND_VALUE ? "" : values.brandId,
      categoryId: values.categoryId,
      description: values.description,
      fieldValues: normalizeFieldValues(currentFieldDefinitions, dynamicValues),
      images: normalizeImages(images),
      isActive: values.isActive,
      isFeaturedDiscount: values.isFeaturedDiscount,
      isFeaturedHit: values.isFeaturedHit,
      isFeaturedNew: values.isFeaturedNew,
      isFeaturedSale: values.isFeaturedSale,
      option: normalizeProductOption(optionDraft),
      price: values.price,
      seoDescription: resolveSeoDescription(values),
      seoTitle: resolveSeoTitle(values),
      slug: resolvedSlug,
      subcategoryId: values.subcategoryId,
      title: values.title,
      ...(mode === "edit" && productId ? { id: productId } : {}),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(payload);

      if (!result.ok) {
        setFieldErrors((current) => ({
          ...current,
          availability:
            normalizeFieldError(result.fieldErrors?.availability?.[0]) ??
            current.availability,
          brandId:
            normalizeFieldError(result.fieldErrors?.brandId?.[0]) ??
            current.brandId,
          categoryId:
            normalizeFieldError(result.fieldErrors?.categoryId?.[0]) ??
            current.categoryId,
          description:
            normalizeFieldError(result.fieldErrors?.description?.[0]) ??
            current.description,
          price:
            normalizeFieldError(result.fieldErrors?.price?.[0]) ??
            current.price,
          seoDescription:
            normalizeFieldError(result.fieldErrors?.seoDescription?.[0]) ??
            current.seoDescription,
          seoTitle:
            normalizeFieldError(result.fieldErrors?.seoTitle?.[0]) ??
            current.seoTitle,
          slug:
            normalizeFieldError(result.fieldErrors?.slug?.[0]) ??
            current.slug,
          subcategoryId:
            normalizeFieldError(result.fieldErrors?.subcategoryId?.[0]) ??
            current.subcategoryId,
          title:
            normalizeFieldError(result.fieldErrors?.title?.[0]) ??
            current.title,
        }));

        const serverDynamicErrors = result.fieldErrors?.fieldValues ?? [];
        if (serverDynamicErrors.length > 0) {
          const nextDynamicErrors: Record<string, string> = {};
          currentFieldDefinitions.forEach((field) => {
            const matched = serverDynamicErrors.find((error) =>
              error.includes(`${field.key}:`),
            );

            if (matched) {
              nextDynamicErrors[field.id] = matched
                .split(": ")
                .slice(1)
                .join(": ");
            }
          });

          setDynamicErrors(nextDynamicErrors);
        }

        const serverOptionError = result.fieldErrors?.option?.[0];
        if (serverOptionError) {
          setOptionErrors((current) => ({
            ...current,
            general: formatFieldValidationMessage("option", serverOptionError),
          }));
        }

        toast.error(getServerValidationMessage(result));
        return;
      }

      toast.success(
        mode === "create" ? "Товар створено." : "Товар оновлено.",
      );
      onSuccess(result.data.id);
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <AdminFormSection
        title="Category"
        description="Спершу визначаємо верхньорівневу категорію. Вона керує доступними підкатегоріями та характеристиками."
      >
        <AdminField label="Категорія" error={fieldErrors.categoryId} required>
          <Select
            items={categoryItems}
            value={values.categoryId}
            onValueChange={updateCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Оберіть категорію" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {formatCatalogOptionStatus(category.isActive)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {relationHasInactiveCatalog ? (
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Поточна категорія або підкатегорія деактивована. Зв&apos;язок збережено для цього товару, але нові прив&apos;язки можна робити тільки до активних гілок каталогу.
            </p>
          ) : null}
        </AdminField>
      </AdminFormSection>

      <AdminFormSection
        title="Subcategory"
        description="Після вибору підкатегорії форма перебудує характеристики саме під цю гілку каталогу."
      >
        <AdminField
          label="Підкатегорія"
          error={fieldErrors.subcategoryId}
          required
        >
          <Select
            items={subcategoryItems}
            value={values.subcategoryId}
            onValueChange={updateSubcategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Оберіть підкатегорію" />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                  {formatCatalogOptionStatus(
                    subcategory.isActive && subcategory.category.isActive,
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection
        title="Характеристики"
        description="Тут працює жива форма характеристик на основі конструктора характеристик підкатегорій."
      >
        {currentFieldDefinitions.length ? (
          <div className="space-y-4">
            {currentFieldDefinitions.map((field) => {
              const value =
                dynamicValues[field.id] ?? getEmptyDynamicValue(field.id);
              const error = dynamicErrors[field.id];

              if (field.type === "SELECT") {
                return (
                  <AdminField
                    key={field.id}
                    label={field.label}
                    error={error}
                    hint={field.helpText ?? undefined}
                    required={field.isRequired}
                  >
                    <Select
                      items={field.options.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                      value={value.optionId}
                      onValueChange={(optionId) => {
                        if (!optionId) {
                          return;
                        }

                        updateDynamicValue(field.id, { optionId });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть значення" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AdminField>
                );
              }

              if (field.type === "MULTI_SELECT") {
                return (
                  <AdminField
                    key={field.id}
                    label={field.label}
                    error={error}
                    hint={field.helpText ?? undefined}
                    required={field.isRequired}
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      {field.options.map((option) => {
                        const isSelected = value.optionIds.includes(option.id);

                        return (
                          <Button
                            key={option.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => {
                              updateDynamicValue(field.id, {
                                optionIds: isSelected
                                  ? value.optionIds.filter(
                                      (optionId) => optionId !== option.id,
                                    )
                                  : [...value.optionIds, option.id],
                              });
                            }}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </AdminField>
                );
              }

              if (field.type === "NUMBER") {
                return (
                  <AdminInputField
                    key={field.id}
                    id={`dynamic-${field.id}`}
                    label={field.label}
                    type="number"
                    step="0.01"
                    value={value.valueNumber}
                    onChange={(event) =>
                      updateDynamicValue(field.id, {
                        valueNumber: event.target.value,
                      })
                    }
                    error={error}
                    hint={field.helpText ?? undefined}
                    required={field.isRequired}
                  />
                );
              }

              if (field.type === "BOOLEAN") {
                return (
                  <AdminField
                    key={field.id}
                    label={field.label}
                    error={error}
                    hint={field.helpText ?? undefined}
                    required={field.isRequired}
                  >
                    <Select
                      items={BOOLEAN_OPTIONS}
                      value={value.valueBoolean}
                      onValueChange={(nextValue) =>
                        updateDynamicValue(field.id, {
                          valueBoolean:
                            nextValue as ProductDynamicValue["valueBoolean"],
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть Так або Ні" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Так</SelectItem>
                        <SelectItem value="false">Ні</SelectItem>
                      </SelectContent>
                    </Select>
                  </AdminField>
                );
              }

              if (field.type === "TEXTAREA") {
                return (
                  <AdminTextareaField
                    key={field.id}
                    id={`dynamic-${field.id}`}
                    label={field.label}
                    value={value.valueText}
                    onChange={(event) =>
                      updateDynamicValue(field.id, {
                        valueText: event.target.value,
                      })
                    }
                    error={error}
                    hint={field.helpText ?? undefined}
                    required={field.isRequired}
                    rows={4}
                  />
                );
              }

              return (
                <AdminInputField
                  key={field.id}
                  id={`dynamic-${field.id}`}
                  label={field.label}
                  value={value.valueText}
                  onChange={(event) =>
                    updateDynamicValue(field.id, {
                      valueText: event.target.value,
                    })
                  }
                  error={error}
                  hint={field.helpText ?? undefined}
                  required={field.isRequired}
                />
              );
            })}
          </div>
        ) : (
          <AdminEmptyState
            title="Для цієї підкатегорії немає характеристик"
            description="Це допустимий стан. Можна перейти далі й зберегти товар без додаткових характеристик."
          />
        )}
      </AdminFormSection>

      <AdminFormSection
        title="Base Data"
        description="Тут збираємо базову картку товару: назву, slug, ціну, наявність, виробника і прапорці."
      >
        <AdminFormGrid>
          <AdminInputField
            id={`${mode}-title`}
            label="Назва товару"
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
            error={fieldErrors.title}
            required
          />

          <AdminInputField
            id={`${mode}-slug`}
            label="Slug"
            value={values.slug}
            onChange={(event) => updateSlug(event.target.value)}
            error={fieldErrors.slug}
            hint="Можна залишити порожнім: slug згенерується автоматично з назви товару."
          />

          <AdminInputField
            id={`${mode}-price`}
            type="number"
            min={0}
            step="0.01"
            label="Ціна"
            value={values.price}
            onChange={(event) => updateValue("price", event.target.value)}
            error={fieldErrors.price}
            required
          />

          <AdminField
            label="Наявність"
            error={fieldErrors.availability}
            required
          >
            <Select
              items={AVAILABILITY_OPTIONS}
              value={values.availability}
              onValueChange={(value) =>
                updateValue(
                  "availability",
                  value as ProductFormValues["availability"],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Оберіть статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">В наявності</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Немає в наявності</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>

          <AdminField label="Виробник" error={fieldErrors.brandId}>
            <Select
              items={brandItems}
              value={values.brandId}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                updateValue("brandId", value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Без виробника" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_BRAND_VALUE}>Без виробника</SelectItem>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                    {formatCatalogOptionStatus(brand.isActive)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>
        </AdminFormGrid>

        <div className="mt-4 space-y-4">
          <AdminRichTextEditor
            id={`${mode}-description`}
            label="Опис"
            value={values.description}
            onChange={(html) => updateValue("description", html)}
            error={fieldErrors.description}
            minHeight={320}
            placeholder="Додайте повний опис товару з форматуванням, таблицями, списками, посиланнями або фото."
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Показувати на сайті</p>
                <p className="text-muted-foreground text-sm leading-6">
                  Soft visibility товару.
                </p>
              </div>
              <Switch
                checked={values.isActive}
                onCheckedChange={(checked) => updateValue("isActive", checked)}
                aria-label="Показувати на сайті"
              />
            </div>

            <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Новинка</p>
                <p className="text-muted-foreground text-sm leading-6">
                  Маркер новинки.
                </p>
              </div>
              <Switch
                checked={values.isFeaturedNew}
                onCheckedChange={(checked) =>
                  updateValue("isFeaturedNew", checked)
                }
                aria-label="Новинка"
              />
            </div>

            <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Акція</p>
                <p className="text-muted-foreground text-sm leading-6">
                  Промо-мітка для товару.
                </p>
              </div>
              <Switch
                checked={values.isFeaturedSale}
                onCheckedChange={(checked) =>
                  updateValue("isFeaturedSale", checked)
                }
                aria-label="Акція"
              />
            </div>

            <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Хіт продажів</p>
                <p className="text-muted-foreground text-sm leading-6">
                  Маркер популярного товару.
                </p>
              </div>
              <Switch
                checked={values.isFeaturedHit}
                onCheckedChange={(checked) =>
                  updateValue("isFeaturedHit", checked)
                }
                aria-label="Хіт продажів"
              />
            </div>

            <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Знижка</p>
                <p className="text-muted-foreground text-sm leading-6">
                  Badge для товарів зі знижкою.
                </p>
              </div>
              <Switch
                checked={values.isFeaturedDiscount}
                onCheckedChange={(checked) =>
                  updateValue("isFeaturedDiscount", checked)
                }
                aria-label="Знижка"
              />
            </div>
          </div>
        </div>
      </AdminFormSection>
      <AdminFormSection
        title="Images"
        description="Завантажте головне фото і галерею товару. Технічні Cloudinary URL та publicId зберігаються автоматично."
      >
        <div className="space-y-4">
          <div className="border-border/70 bg-card/90 rounded-2xl border p-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">Cloudinary upload</p>
              <p className="text-muted-foreground text-sm leading-6">
                Доступні формати: JPG, PNG, WebP. Ліміт: 5 MB на файл.
              </p>
              <AdminField
                label="Файли зображень"
                hint="Можна вибрати одразу кілька файлів."
              >
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelection}
                />
              </AdminField>

              {selectedUploadFiles.length ? (
                <div className="border-border/70 bg-muted/30 rounded-2xl border p-3">
                  <p className="text-sm font-medium">
                    До upload вибрано {selectedUploadFiles.length} файл(и)
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                    {selectedUploadPreviews.map((preview) => (
                      <div
                        key={preview.url}
                        className="border-border/70 bg-card/80 space-y-2 rounded-xl border p-2"
                      >
                        <div className="aspect-square overflow-hidden rounded-lg">
                          <ProductThumbnail
                            alt={preview.name}
                            src={preview.url}
                          />
                        </div>
                        <p className="truncate text-xs">{preview.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={uploadSelectedFiles}
                  disabled={isPending || selectedUploadFiles.length === 0}
                >
                  {isPending ? "Завантажуємо..." : "Завантажити в Cloudinary"}
                </Button>
              </div>
            </div>
          </div>

          {images.length ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {images.map((image, index) => (
                <div
                  key={image.id ?? `${mode}-image-${index}`}
                  className="border-border/70 bg-card/90 space-y-3 rounded-xl border p-3"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted/30">
                    <ProductThumbnail
                      alt={image.alt || `Product image ${index + 1}`}
                      src={image.url}
                    />
                  </div>

                  {imageItemErrors[index]?.url ||
                  imageItemErrors[index]?.publicId ? (
                    <p className="text-destructive text-xs leading-5">
                      {imageItemErrors[index]?.url ??
                        imageItemErrors[index]?.publicId}
                    </p>
                  ) : null}

                  <AdminInputField
                    id={`${mode}-image-alt-${index}`}
                    label="Alt"
                    value={image.alt}
                    onChange={(event) =>
                      updateImage(index, { alt: event.target.value })
                    }
                  />

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPrimaryImage(index)}
                      disabled={image.isPrimary}
                    >
                      {image.isPrimary ? "Головне" : "Зробити головним"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeImage(index)}
                    >
                      Видалити
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="Фото ще не додані"
              description="Завантажте хоча б одне фото товару. Перше фото автоматично стане головним."
            />
          )}
          <div className="border-border/70 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm leading-6">
              Правило цього кроку: 1 головне фото, до 10 фото в галереї.
            </p>
            <Badge variant="outline">{images.length}/11 фото</Badge>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="Опції товару"
        description="Товар може мати 0 або 1 групу опцій. Якщо опцій немає, цей блок не потрапить у payload."
      >
        {optionDraft ? (
          <div className="space-y-4">
            <div className="border-border/70 bg-card/90 space-y-4 rounded-2xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Група опцій</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Наприклад: Смак, Колір або Опір. Друга група опцій не створюється.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={disableProductOption}
                >
                  Вимкнути опції
                </Button>
              </div>

              <AdminInputField
                id={`${mode}-option-name`}
                label="Назва опції"
                value={optionDraft.name}
                onChange={(event) => updateOption({ name: event.target.value })}
                error={optionErrors.name}
                required
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
              {optionDraft.values.map((optionValue, index) => (
                <div
                  key={optionValue.id ?? `${mode}-option-value-${index}`}
                  className="border-border/70 bg-card/90 space-y-3 rounded-xl border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Значення #{index + 1}</p>
                      <p className="text-muted-foreground text-xs leading-5">
                        Назва і фото обов&apos;язкові.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeOptionValue(index)}
                    >
                      Видалити
                    </Button>
                  </div>

                  <div className="aspect-square overflow-hidden rounded-lg bg-muted/30">
                    {getProductOptionValueImage(optionValue) ? (
                      <ProductThumbnail
                        alt={optionValue.label || `Option ${index + 1}`}
                        src={getProductOptionValueImage(optionValue)}
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full min-h-32 items-center justify-center rounded-lg border border-dashed text-sm">
                        Фото ще не додано
                      </div>
                    )}
                  </div>

                  {getProductOptionValueImage(optionValue) ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeOptionValueImage(index)}
                    >
                      Видалити фото
                    </Button>
                  ) : null}

                  <AdminInputField
                    id={`${mode}-option-value-label-${index}`}
                    label="Назва значення"
                    value={optionValue.label}
                    onChange={(event) =>
                      updateOptionValue(index, {
                        label: event.target.value,
                        slug:
                          optionValue.slug.trim().length > 0
                            ? optionValue.slug
                            : slugifyText(
                                `${values.slug || values.title}-${event.target.value}`,
                              ),
                      })
                    }
                    error={optionErrors.values?.[index]?.label}
                    required
                  />

                  <AdminInputField
                    id={`${mode}-option-value-slug-${index}`}
                    label="Slug сторінки варіанта"
                    value={optionValue.slug}
                    onChange={(event) =>
                      updateOptionValue(index, {
                        slug: slugifyText(event.target.value),
                      })
                    }
                    hint={`Наприклад: ${values.slug || "product"}-${slugifyText(optionValue.label) || "blue"}`}
                  />

                  <AdminInputField
                    id={`${mode}-option-value-title-${index}`}
                    label="Назва сторінки варіанта"
                    value={optionValue.titleOverride}
                    onChange={(event) =>
                      updateOptionValue(index, {
                        titleOverride: event.target.value,
                      })
                    }
                    hint="Якщо порожньо, H1 згенерується з назви товару та значення опції."
                  />

                  <AdminInputField
                    id={`${mode}-option-value-seo-title-${index}`}
                    label="SEO title варіанта"
                    value={optionValue.seoTitle}
                    onChange={(event) =>
                      updateOptionValue(index, {
                        seoTitle: event.target.value,
                      })
                    }
                  />

                  <AdminInputField
                    id={`${mode}-option-value-seo-description-${index}`}
                    label="SEO description варіанта"
                    value={optionValue.seoDescription}
                    onChange={(event) =>
                      updateOptionValue(index, {
                        seoDescription: event.target.value,
                      })
                    }
                  />

                  <AdminInputField
                    id={`${mode}-option-value-sort-${index}`}
                    type="number"
                    min={0}
                    step={1}
                    label="Порядок"
                    value={optionValue.sortOrder}
                    onChange={(event) =>
                      updateOptionValue(index, {
                        sortOrder: event.target.value,
                      })
                    }
                  />

                  <AdminField
                    label="Фото значення"
                    error={optionErrors.values?.[index]?.image}
                    hint="Фото зберігається в Cloudinary у product-options/."
                    required={
                      !hasProductOptionValueImage(optionValue) &&
                      !optionValue.imageRemoved
                    }
                  >
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          void uploadOptionValueImage(index, file);
                        }
                      }}
                    />
                  </AdminField>

                  {optionUploadIndex === index ? (
                    <Badge variant="outline">Завантажуємо фото...</Badge>
                  ) : null}
                </div>
              ))}
            </div>

            {optionErrors.general ? (
              <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
                {optionErrors.general}
              </div>
            ) : null}

            <div className="border-border/70 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm leading-6">
                Порядок на фронтенді відповідає порядку значень у цьому списку.
              </p>
              <Button type="button" variant="outline" onClick={addOptionValue}>
                Додати значення
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-border/70 bg-muted/30 space-y-4 rounded-2xl border border-dashed p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">
                Опції товару не ввімкнені
              </h3>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                Це звичайний товар без варіантів. Увімкніть блок тільки якщо потрібно обрати смак, колір, опір або інший один тип опції.
              </p>
            </div>
            <Button type="button" onClick={enableProductOption}>
              Додати опції товару
            </Button>
          </div>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="SEO"
        description="Фінальний блок перед збереженням. Тут завершуємо SEO-поля і відправляємо повний payload товару."
      >
        <div className="space-y-4">
          <AdminInputField
            id={`${mode}-seo-title`}
            label="SEO title"
            value={values.seoTitle}
            onChange={(event) => updateValue("seoTitle", event.target.value)}
            error={fieldErrors.seoTitle}
            hint={`Якщо залишити порожнім: ${resolveSeoTitle(values)}`}
          />

          <AdminTextareaField
            id={`${mode}-seo-description`}
            label="SEO description"
            value={values.seoDescription}
            onChange={(event) =>
              updateValue("seoDescription", event.target.value)
            }
            error={fieldErrors.seoDescription}
            rows={4}
            hint={`Якщо залишити порожнім: ${resolveSeoDescription(values)}`}
          />
        </div>
      </AdminFormSection>

      <div className="border-border/70 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm leading-6">
          Усі секції відкриті. Збереження перевірить category, subcategory, характеристики, base data, images, опції та SEO.
        </p>
        <div className="flex flex-wrap gap-2">
          {onDelete ? (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                  />
                }
              >
                Деактивувати товар
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Деактивувати товар?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Товар стане неактивним і не показуватиметься на storefront. Дію можна змінити пізніше через редагування товару.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Скасувати</AlertDialogCancel>
                  <AlertDialogAction
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isPending}
                  >
                    Деактивувати товар
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === "create"
                ? "Створюємо..."
                : "Зберігаємо..."
              : mode === "create"
                ? "Створити товар"
                : "Зберегти зміни"}
          </Button>
        </div>
      </div>    </form>
  );
}

export function AdminProductCrud({
  brands,
  categories,
  fields,
  mode = "all",
  selectedProduct,
  subcategories,
}: AdminProductCrudProps) {
  const router = useRouter();
  const createCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );
  const createSubcategories = useMemo(
    () =>
      subcategories.filter(
        (subcategory) => subcategory.isActive && subcategory.category.isActive,
      ),
    [subcategories],
  );
  const editCategories = useMemo(
    () => withCurrentCategoryOption(categories, selectedProduct),
    [categories, selectedProduct],
  );
  const editSubcategories = useMemo(
    () => withCurrentSubcategoryOption(subcategories, selectedProduct),
    [selectedProduct, subcategories],
  );

  const createInitialValues = useMemo(
    () => buildCreateValues(createCategories, createSubcategories),
    [createCategories, createSubcategories],
  );
  const editInitialOption = useMemo(
    () => buildProductOptionDraft(selectedProduct),
    [selectedProduct],
  );

  const handleDelete = () => {
    if (!selectedProduct) {
      return;
    }

    void deleteProductAction({
      id: selectedProduct.id,
    }).then((result) => {
      if (result.ok) {
        toast.success("Товар деактивовано.");
        router.push("/admin/products");
        router.refresh();
        return;
      }

      toast.error(result.error || "Не вдалося зберегти товар.");
    });
  };

  return (
    <div className="space-y-6">
      {mode !== "create" && selectedProduct ? (
        <AdminSectionCard title={`Редагування: ${selectedProduct.title}`}>
          <ProductWizard
            brands={brands}
            categories={editCategories}
            fields={fields}
            initialDynamicValues={buildDynamicValueMap(selectedProduct)}
            initialImages={buildImageDrafts(selectedProduct)}
            initialOption={editInitialOption}
            initialValues={buildEditValues(selectedProduct)}
            mode="edit"
            onDelete={handleDelete}
            onSuccess={(id) => {
              router.push(`/admin/products/${id}`);
              router.refresh();
            }}
            productId={selectedProduct.id}
            subcategories={editSubcategories}
          />
        </AdminSectionCard>
      ) : mode !== "create" ? (
        <AdminEmptyState
          title="Оберіть товар для редагування"
          description="Після вибору товару тут з'явиться multi-step форма для його оновлення."
        />
      ) : null}

      {mode !== "edit" ? (
        <AdminSectionCard
          title="Створення нового товару"
          description="Create-flow розбитий на 7 кроків і може створювати повноцінні товари з характеристиками, flags, images, опціями та SEO."
        >
          <ProductWizard
            brands={brands}
            categories={createCategories}
            fields={fields}
            initialDynamicValues={{}}
            initialImages={[]}
            initialOption={null}
            initialValues={createInitialValues}
            mode="create"
            onSuccess={(id) => {
              router.push(`/admin/products/${id}`);
              router.refresh();
            }}
            subcategories={createSubcategories}
          />
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
