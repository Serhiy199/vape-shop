"use client";

import type { ChangeEvent, FormEvent } from "react";
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
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/features/catalog/actions/admin-catalog";

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
  id?: string;
  image: string;
  imagePublicId: string;
  label: string;
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

function getServerValidationMessage(
  result: Extract<
    Awaited<ReturnType<typeof createProductAction>>,
    { ok: false }
  >,
) {
  const fieldErrors = result.fieldErrors ?? {};
  const messages = Object.values(fieldErrors)
    .flatMap((errors) => errors ?? [])
    .filter(Boolean);

  return messages[0] ?? result.error;
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
      id: value.id,
      image: value.image,
      imagePublicId: value.imagePublicId ?? "",
      label: value.label,
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
      image: value.image,
      imagePublicId: value.imagePublicId || undefined,
      label: value.label,
      sortOrder: Number(value.sortOrder || index),
    })),
  };
}

function validateProductOption(option: ProductOptionDraft | null) {
  const errors: ProductOptionErrors = {};

  if (!option) {
    return errors;
  }

  if (!option.name.trim()) {
    errors.name = "Вкажіть назву опції, наприклад Смак, Колір або Опір.";
  }

  if (option.values.length === 0) {
    errors.general = "Додайте хоча б одне значення опції або вимкніть блок.";
    return errors;
  }

  const valueErrors: NonNullable<ProductOptionErrors["values"]> = {};

  option.values.forEach((value, index) => {
    const current: { image?: string; label?: string } = {};

    if (!value.label.trim()) {
      current.label = "Вкажіть назву значення.";
    }

    if (!value.image.trim()) {
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

  if (!values.slug.trim()) {
    errors.slug = "Вкажіть slug товару.";
  }

  const parsedPrice = Number(values.price.replace(",", "."));
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    errors.price = "Вкажіть коректну ціну.";
  }

  return errors;
}

function validateSeoFields(values: ProductFormValues) {
  const errors: ProductFieldErrors = {};

  if (!values.seoTitle.trim()) {
    errors.seoTitle = "Вкажіть SEO title перед створенням товару.";
  }

  if (!values.seoDescription.trim()) {
    errors.seoDescription = "Вкажіть SEO description перед створенням товару.";
  }

  return errors;
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
        errors[field.id] = "Оберіть true або false.";
      }
      return;
    }

    if (field.isRequired && !value.valueText.trim()) {
      errors[field.id] = "Заповніть цю характеристику.";
    }
  });

  return errors;
}

function validateImages(images: ProductImageDraft[]) {
  const itemErrors: Record<number, { publicId?: string; url?: string }> = {};
  let generalError: string | null = null;

  if (images.length === 0) {
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
      nextErrors.url = "Вкажіть URL зображення.";
    }

    if (!image.publicId.trim()) {
      nextErrors.publicId = "Вкажіть publicId.";
    } else {
      const normalizedPublicId = image.publicId.trim().toLowerCase();

      if (seenPublicIds.has(normalizedPublicId)) {
        nextErrors.publicId = "Цей publicId вже використано.";
      }

      seenPublicIds.add(normalizedPublicId);
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

function StepBadge({
  isActive,
  isComplete,
  label,
  onClick,
}: {
  isActive: boolean;
  isComplete: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "hover:border-primary/60 hover:text-primary rounded-full border px-3 py-2 text-left text-xs font-medium transition-colors",
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : isComplete
            ? "border-border bg-card text-foreground"
            : "border-border/70 bg-muted/30 text-muted-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ProductThumbnail({ alt, src }: { alt: string; src: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="border-border/70 bg-muted/30 overflow-hidden rounded-2xl border">
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-32 w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
          Preview unavailable
        </div>
      )}
    </div>
  );
}

function WizardStepHeader({
  currentStep,
  onStepChange,
}: {
  currentStep: ProductStepId;
  onStepChange: (step: ProductStepId) => void;
}) {
  const currentIndex = PRODUCT_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <div className="flex flex-wrap gap-2">
      {PRODUCT_STEPS.map((step, index) => (
        <StepBadge
          key={step.id}
          label={step.label}
          isActive={step.id === currentStep}
          isComplete={index < currentIndex}
          onClick={() => onStepChange(step.id)}
        />
      ))}
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
  const [currentStep, setCurrentStep] = useState<ProductStepId>("category");
  const [values, setValues] = useState(initialValues);
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
  const [generalMessage, setGeneralMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentStepIndex = PRODUCT_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

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
      setCurrentStep("category");
      setFieldErrors({});
      setDynamicErrors({});
      setImageItemErrors({});
      setOptionErrors({});
      setOptionUploadIndex(null);
      setSelectedUploadFiles([]);
      setGeneralMessage(null);
      setSuccessMessage(null);
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
    setSuccessMessage(null);
  };

  const updateValue = <TKey extends keyof ProductFormValues>(
    field: TKey,
    value: ProductFormValues[TKey],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    clearMessages();
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

  const addImage = () => {
    setImages((current) => [
      ...current,
      {
        alt: "",
        isPrimary: current.length === 0,
        publicId: "",
        url: "",
      },
    ]);
    clearMessages();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedUploadFiles(files);
    clearMessages();
  };

  const uploadSelectedFiles = async () => {
    if (selectedUploadFiles.length === 0) {
      setGeneralMessage("Оберіть один або кілька файлів для upload.");
      return;
    }

    if (images.length + selectedUploadFiles.length > 11) {
      setGeneralMessage(
        "Разом із вже доданими зображеннями товар може містити максимум 11 фото.",
      );
      return;
    }

    const productSlug = values.slug.trim();

    if (!productSlug) {
      setGeneralMessage("Вкажіть slug товару перед upload фото.");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("existingCount", images.length.toString());
    uploadFormData.append("productSlug", productSlug);

    selectedUploadFiles.forEach((file) => {
      uploadFormData.append("files", file);
    });

    setGeneralMessage(null);
    setSuccessMessage(null);

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
        setGeneralMessage(
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
      setSuccessMessage(payload.message || "Зображення завантажено.");
    });
  };

  const enableProductOption = () => {
    setOptionDraft({
      name: "",
      values: [
        {
          image: "",
          imagePublicId: "",
          label: "",
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
                image: "",
                imagePublicId: "",
                label: "",
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
    const productSlug = values.slug.trim();

    if (!productSlug) {
      setGeneralMessage(
        "Вкажіть slug товару перед upload фото значення опції.",
      );
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("productSlug", productSlug);
    uploadFormData.append("valueNumber", (index + 1).toString());
    uploadFormData.append("file", file);

    setGeneralMessage(null);
    setSuccessMessage(null);
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
        setGeneralMessage(
          payload?.error?.message ||
            "Не вдалося завантажити фото значення опції.",
        );
        return;
      }

      updateOptionValue(index, {
        image: payload.data.file.url,
        imagePublicId: payload.data.file.publicId,
      });
      setSuccessMessage(payload.message || "Фото значення опції завантажено.");
    } finally {
      setOptionUploadIndex(null);
    }
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
        setGeneralMessage("Щоб продовжити, потрібно вибрати категорію.");
        isValid = false;
      }
    }

    if (step === "subcategory") {
      if (!values.subcategoryId) {
        setFieldErrors((current) => ({
          ...current,
          subcategoryId: "Оберіть підкатегорію товару.",
        }));
        setGeneralMessage("Щоб продовжити, потрібно вибрати підкатегорію.");
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
        setGeneralMessage(
          "Заповніть обов'язкові характеристики перед переходом далі.",
        );
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
        setGeneralMessage("Перевірте базові дані товару.");
        isValid = false;
      }
    }

    if (step === "images") {
      const validation = validateImages(images);
      setImageItemErrors(validation.itemErrors);

      if (
        selectedUploadFiles.length > 0 &&
        images.length === 0 &&
        (validation.generalError ||
          Object.keys(validation.itemErrors).length > 0)
      ) {
        setGeneralMessage(
          "Файли вже вибрані, але ще не завантажені. Натисніть «Завантажити в Cloudinary», дочекайтесь появи картки фото, потім переходьте далі.",
        );
        isValid = false;
        return isValid;
      }

      if (
        validation.generalError ||
        Object.keys(validation.itemErrors).length > 0
      ) {
        setGeneralMessage(
          validation.generalError ?? "Перевірте дані зображень товару.",
        );
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
        setGeneralMessage("Перевірте блок опцій товару.");
        isValid = false;
      }
    }

    if (step === "seo") {
      const nextFieldErrors = validateSeoFields(values);
      setFieldErrors((current) => ({
        ...current,
        ...nextFieldErrors,
      }));

      if (Object.keys(nextFieldErrors).length > 0) {
        setGeneralMessage("Заповніть SEO-поля перед створенням товару.");
        isValid = false;
      }
    }

    if (isValid) {
      setGeneralMessage(null);
    }

    return isValid;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const nextStep = PRODUCT_STEPS[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const goBack = () => {
    const previousStep = PRODUCT_STEPS[currentStepIndex - 1];
    if (previousStep) {
      setCurrentStep(previousStep.id);
      setGeneralMessage(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep !== "seo") {
      goNext();
      return;
    }

    const stepsValid = PRODUCT_STEPS.every((step) => validateStep(step.id));
    if (!stepsValid) {
      const firstBrokenStep = PRODUCT_STEPS.find(
        (step) => !validateStep(step.id),
      );
      if (firstBrokenStep) {
        setCurrentStep(firstBrokenStep.id);
      }
      return;
    }

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
      seoDescription: values.seoDescription,
      seoTitle: values.seoTitle,
      slug: values.slug,
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
            result.fieldErrors?.availability?.[0] ?? current.availability,
          brandId: result.fieldErrors?.brandId?.[0] ?? current.brandId,
          categoryId: result.fieldErrors?.categoryId?.[0] ?? current.categoryId,
          description:
            result.fieldErrors?.description?.[0] ?? current.description,
          price: result.fieldErrors?.price?.[0] ?? current.price,
          seoDescription:
            result.fieldErrors?.seoDescription?.[0] ?? current.seoDescription,
          seoTitle: result.fieldErrors?.seoTitle?.[0] ?? current.seoTitle,
          slug: result.fieldErrors?.slug?.[0] ?? current.slug,
          subcategoryId:
            result.fieldErrors?.subcategoryId?.[0] ?? current.subcategoryId,
          title: result.fieldErrors?.title?.[0] ?? current.title,
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

        const imageErrors = result.fieldErrors?.images ?? [];
        if (imageErrors.length > 0) {
          setGeneralMessage(imageErrors[0]);
        } else {
          setGeneralMessage(getServerValidationMessage(result));
        }

        return;
      }

      setSuccessMessage(
        mode === "create" ? "Товар створено." : "Товар оновлено.",
      );
      setGeneralMessage(null);
      onSuccess(result.data.id);
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <WizardStepHeader
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      {currentStep === "category" ? (
        <AdminFormSection
          title="Крок 1. Category"
          description="Спершу визначаємо верхньорівневу category. Вона керує доступними subcategory та характеристиками."
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
                Поточна категорія або підкатегорія деактивована. Зв&apos;язок
                збережено для цього товару, але нові прив&apos;язки можна робити
                тільки до активних гілок каталогу.
              </p>
            ) : null}
          </AdminField>
        </AdminFormSection>
      ) : null}

      {currentStep === "subcategory" ? (
        <AdminFormSection
          title="Крок 2. Subcategory"
          description="Після вибору subcategory форма перебудує характеристики саме під цю гілку каталогу."
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
      ) : null}

      {currentStep === "dynamic" ? (
        <AdminFormSection
          title="Крок 3. Характеристики"
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
                          const isSelected = value.optionIds.includes(
                            option.id,
                          );

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
                          <SelectValue placeholder="Оберіть true або false" />
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
      ) : null}

      {currentStep === "base" ? (
        <AdminFormSection
          title="Крок 4. Base product data"
          description="Тут збираємо базову картку товару: назву, slug, ціну, availability, виробника і flags."
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
              onChange={(event) => updateValue("slug", event.target.value)}
              error={fieldErrors.slug}
              hint="Лише нижній регістр, цифри та дефіси."
              required
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
                  <SelectItem value="OUT_OF_STOCK">
                    Немає в наявності
                  </SelectItem>
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
            <AdminTextareaField
              id={`${mode}-description`}
              label="Опис"
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              error={fieldErrors.description}
              rows={5}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Показувати на сайті</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Soft visibility товару.
                  </p>
                </div>
                <Switch
                  checked={values.isActive}
                  onCheckedChange={(checked) =>
                    updateValue("isActive", checked)
                  }
                  aria-label="Показувати на сайті"
                />
              </div>

              <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">New</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Маркер новинки.
                  </p>
                </div>
                <Switch
                  checked={values.isFeaturedNew}
                  onCheckedChange={(checked) =>
                    updateValue("isFeaturedNew", checked)
                  }
                  aria-label="New"
                />
              </div>

              <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sale</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Промо-мітка для товару.
                  </p>
                </div>
                <Switch
                  checked={values.isFeaturedSale}
                  onCheckedChange={(checked) =>
                    updateValue("isFeaturedSale", checked)
                  }
                  aria-label="Sale"
                />
              </div>

              <div className="border-border/70 bg-card/90 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Hit</p>
                  <p className="text-muted-foreground text-sm leading-6">
                    Хіт продажу.
                  </p>
                </div>
                <Switch
                  checked={values.isFeaturedHit}
                  onCheckedChange={(checked) =>
                    updateValue("isFeaturedHit", checked)
                  }
                  aria-label="Hit"
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
      ) : null}

      {currentStep === "images" ? (
        <AdminFormSection
          title="Крок 5. Images"
          description="Cloudinary upload уже підключений. Після аплоаду форма автоматично підставляє url/publicId у payload товару."
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
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedUploadPreviews.map((preview) => (
                        <div
                          key={preview.url}
                          className="border-border/70 bg-card/80 space-y-2 rounded-2xl border p-3"
                        >
                          <ProductThumbnail
                            alt={preview.name}
                            src={preview.url}
                          />
                          <p className="truncate text-xs">{preview.name}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedUploadFiles.map((file) => (
                        <Badge
                          key={`${file.name}-${file.lastModified}`}
                          variant="outline"
                        >
                          {file.name}
                        </Badge>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImage}
                    disabled={images.length >= 11}
                  >
                    Додати вручну
                  </Button>
                </div>
              </div>
            </div>

            {images.length ? (
              images.map((image, index) => (
                <div
                  key={image.id ?? `${mode}-image-${index}`}
                  className="border-border/70 bg-card/90 space-y-4 rounded-2xl border p-4"
                >
                  <ProductThumbnail
                    alt={
                      image.alt ||
                      image.publicId ||
                      `Product image ${index + 1}`
                    }
                    src={image.url}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {image.isPrimary ? (
                        <Badge variant="secondary">Головне фото</Badge>
                      ) : (
                        <Badge variant="outline">Галерея</Badge>
                      )}
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPrimaryImage(index)}
                      >
                        Зробити головним
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

                  <AdminFormGrid>
                    <AdminInputField
                      id={`${mode}-image-url-${index}`}
                      label="URL"
                      value={image.url}
                      onChange={(event) =>
                        updateImage(index, { url: event.target.value })
                      }
                      error={imageItemErrors[index]?.url}
                      required
                    />

                    <AdminInputField
                      id={`${mode}-image-public-id-${index}`}
                      label="publicId"
                      value={image.publicId}
                      onChange={(event) =>
                        updateImage(index, { publicId: event.target.value })
                      }
                      error={imageItemErrors[index]?.publicId}
                      required
                    />
                  </AdminFormGrid>

                  <AdminInputField
                    id={`${mode}-image-alt-${index}`}
                    label="Alt"
                    value={image.alt}
                    onChange={(event) =>
                      updateImage(index, { alt: event.target.value })
                    }
                  />
                </div>
              ))
            ) : (
              <AdminEmptyState
                title="Фото ще не додані"
                description="Додайте щонайменше одне зображення. На цьому кроці головне фото й галерея вже збираються в правильний payload."
              />
            )}

            <div className="border-border/70 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm leading-6">
                Правила цього кроку: 1 головне фото, до 10 фото в галереї.
              </p>
              <Badge variant="outline">{images.length}/11 фото</Badge>
            </div>
          </div>
        </AdminFormSection>
      ) : null}

      {currentStep === "options" ? (
        <AdminFormSection
          title="Крок 6. Опції товару"
          description="Товар може мати 0 або 1 групу опцій. Якщо опцій немає, цей блок не потрапить у payload."
        >
          {optionDraft ? (
            <div className="space-y-4">
              <div className="border-border/70 bg-card/90 space-y-4 rounded-2xl border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Група опцій</p>
                    <p className="text-muted-foreground text-sm leading-6">
                      Наприклад: Смак, Колір або Опір. Друга група опцій не
                      створюється.
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
                  onChange={(event) =>
                    updateOption({ name: event.target.value })
                  }
                  error={optionErrors.name}
                  required
                />
              </div>

              {optionDraft.values.map((optionValue, index) => (
                <div
                  key={optionValue.id ?? `${mode}-option-value-${index}`}
                  className="border-border/70 bg-card/90 space-y-4 rounded-2xl border p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Значення #{index + 1}
                      </p>
                      <p className="text-muted-foreground text-sm leading-6">
                        Кожне значення повинно мати назву і рівно одне фото.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeOptionValue(index)}
                    >
                      Видалити значення
                    </Button>
                  </div>

                  {optionValue.image ? (
                    <ProductThumbnail
                      alt={optionValue.label || `Option ${index + 1}`}
                      src={optionValue.image}
                    />
                  ) : null}

                  <AdminFormGrid>
                    <AdminInputField
                      id={`${mode}-option-value-label-${index}`}
                      label="Назва значення"
                      value={optionValue.label}
                      onChange={(event) =>
                        updateOptionValue(index, {
                          label: event.target.value,
                        })
                      }
                      error={optionErrors.values?.[index]?.label}
                      required
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
                  </AdminFormGrid>

                  <AdminField
                    label="Фото значення"
                    error={optionErrors.values?.[index]?.image}
                    hint="Фото зберігається в Cloudinary у product-options/."
                    required
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

                  <AdminFormGrid>
                    <AdminInputField
                      id={`${mode}-option-value-image-${index}`}
                      label="Image URL"
                      value={optionValue.image}
                      onChange={(event) =>
                        updateOptionValue(index, {
                          image: event.target.value,
                        })
                      }
                      error={optionErrors.values?.[index]?.image}
                      required
                    />

                    <AdminInputField
                      id={`${mode}-option-value-public-id-${index}`}
                      label="imagePublicId"
                      value={optionValue.imagePublicId}
                      onChange={(event) =>
                        updateOptionValue(index, {
                          imagePublicId: event.target.value,
                        })
                      }
                    />
                  </AdminFormGrid>

                  {optionUploadIndex === index ? (
                    <Badge variant="outline">Завантажуємо фото...</Badge>
                  ) : null}
                </div>
              ))}

              {optionErrors.general ? (
                <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
                  {optionErrors.general}
                </div>
              ) : null}

              <div className="border-border/70 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm leading-6">
                  Порядок на фронтенді відповідає порядку значень у цьому
                  списку.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOptionValue}
                >
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
                  Це звичайний товар без варіантів. Увімкніть блок тільки якщо
                  потрібно обрати смак, колір, опір або інший один тип опції.
                </p>
              </div>
              <Button type="button" onClick={enableProductOption}>
                Додати опції товару
              </Button>
            </div>
          )}
        </AdminFormSection>
      ) : null}

      {currentStep === "seo" ? (
        <AdminFormSection
          title="Крок 7. SEO"
          description="Фінальний крок перед submit. Тут завершуємо SEO-поля і відправляємо повний payload товару."
        >
          <div className="space-y-4">
            <AdminInputField
              id={`${mode}-seo-title`}
              label="SEO title"
              value={values.seoTitle}
              onChange={(event) => updateValue("seoTitle", event.target.value)}
              error={fieldErrors.seoTitle}
              required
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
              required
            />
          </div>
        </AdminFormSection>
      ) : null}

      {generalMessage ? (
        <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {generalMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="border-primary/20 bg-primary/8 rounded-2xl border px-4 py-3 text-sm">
          {successMessage}
        </div>
      ) : null}

      <div className="border-border/70 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm leading-6">
          Крок {currentStepIndex + 1} з {PRODUCT_STEPS.length}. Форма вже
          валідовує category, subcategory, обов'язкові характеристики, base data
          та image rules до submit.
        </p>
        <div className="flex flex-wrap gap-2">
          {onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              Деактивувати товар
            </Button>
          ) : null}

          {currentStepIndex > 0 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              Назад
            </Button>
          ) : null}

          {currentStepIndex < PRODUCT_STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Далі
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Створюємо..."
                  : "Зберігаємо..."
                : mode === "create"
                  ? "Створити товар"
                  : "Зберегти зміни"}
            </Button>
          )}
        </div>
      </div>
    </form>
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

    const confirmed = window.confirm(
      `Деактивувати товар "${selectedProduct.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    void deleteProductAction({
      id: selectedProduct.id,
    }).then((result) => {
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {mode !== "create" && selectedProduct ? (
        <AdminSectionCard
          title="Редагування товару"
          description="Multi-step форма вже працює для edit-сценарію і зберігає повний payload товару через update action."
        >
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
          description="Create-flow уже розбитий на всі 7 кроків і може створювати повноцінні товари з характеристиками, flags, images, опціями та SEO."
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
