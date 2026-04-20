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
import { Badge } from "@/components/ui/badge";
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
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/features/catalog/actions/admin-catalog";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type SubcategoryOption = {
  category: {
    id: string;
    name: string;
  };
  id: string;
  name: string;
  slug: string;
};

type BrandOption = {
  id: string;
  name: string;
  slug: string;
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
  type: "TEXT" | "NUMBER" | "TEXTAREA" | "SELECT" | "BOOLEAN";
};

type SelectedProduct = {
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  brand: {
    id: string;
    name: string;
  } | null;
  category: {
    id: string;
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
  isActive: boolean;
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

type NormalizedSubmittedFieldValue =
  | {
      fieldId: string;
      optionId: string;
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

type ProductStepId =
  | "category"
  | "subcategory"
  | "dynamic"
  | "base"
  | "images"
  | "seo";

type AdminProductCrudProps = {
  brands: BrandOption[];
  categories: CategoryOption[];
  fields: FieldDefinition[];
  selectedProduct: SelectedProduct | null;
  subcategories: SubcategoryOption[];
};

const NO_BRAND_VALUE = "__none__";

const PRODUCT_STEPS: Array<{ id: ProductStepId; label: string }> = [
  { id: "category", label: "1. Category" },
  { id: "subcategory", label: "2. Subcategory" },
  { id: "dynamic", label: "3. Dynamic fields" },
  { id: "base", label: "4. Base data" },
  { id: "images", label: "5. Images" },
  { id: "seo", label: "6. SEO" },
];

function findFirstSubcategoryId(
  categoryId: string,
  subcategories: SubcategoryOption[],
) {
  return (
    subcategories.find((subcategory) => subcategory.category.id === categoryId)?.id ??
    ""
  );
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

function validateDynamicFields(
  fieldDefinitions: FieldDefinition[],
  dynamicValues: Record<string, ProductDynamicValue>,
) {
  const errors: Record<string, string> = {};

  fieldDefinitions.forEach((field) => {
    const value = dynamicValues[field.id] ?? getEmptyDynamicValue(field.id);

    if (field.type === "SELECT") {
      if (field.isRequired && !value.optionId) {
        errors[field.id] = "Оберіть значення для цього поля.";
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
      errors[field.id] = "Заповніть це поле.";
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
}: {
  isActive: boolean;
  isComplete: boolean;
  label: string;
}) {
  return (
    <div
      className={[
        "rounded-full border px-3 py-2 text-xs font-medium transition-colors",
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : isComplete
            ? "border-border bg-card text-foreground"
            : "border-border/70 bg-muted/30 text-muted-foreground",
      ].join(" ")}
    >
      {label}
    </div>
  );
}

function WizardStepHeader({
  currentStep,
}: {
  currentStep: ProductStepId;
}) {
  const currentIndex = PRODUCT_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex flex-wrap gap-2">
      {PRODUCT_STEPS.map((step, index) => (
        <StepBadge
          key={step.id}
          label={step.label}
          isActive={step.id === currentStep}
          isComplete={index < currentIndex}
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
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [dynamicErrors, setDynamicErrors] = useState<Record<string, string>>({});
  const [imageItemErrors, setImageItemErrors] = useState<
    Record<number, { publicId?: string; url?: string }>
  >({});
  const [generalMessage, setGeneralMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentStepIndex = PRODUCT_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

  const availableSubcategories = useMemo(
    () =>
      subcategories.filter(
        (subcategory) => subcategory.category.id === values.categoryId,
      ),
    [subcategories, values.categoryId],
  );

  const currentFieldDefinitions = useMemo(
    () => getSubcategoryFields(fields, values.subcategoryId),
    [fields, values.subcategoryId],
  );

  useEffect(() => {
    setValues(initialValues);
    setDynamicValues(initialDynamicValues);
    setImages(initialImages);
    setCurrentStep("category");
    setFieldErrors({});
    setDynamicErrors({});
    setImageItemErrors({});
    setGeneralMessage(null);
    setSuccessMessage(null);
  }, [initialDynamicValues, initialImages, initialValues, productId]);

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

    const nextSubcategoryId = findFirstSubcategoryId(categoryId, subcategories);

    setValues((current) => ({
      ...current,
      categoryId,
      subcategoryId: nextSubcategoryId,
    }));
    setFieldErrors((current) => ({
      ...current,
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

    updateValue("subcategoryId", subcategoryId);
    setDynamicErrors({});
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

  const updateImage = (
    index: number,
    patch: Partial<ProductImageDraft>,
  ) => {
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
      const nextImages = current.filter((_, imageIndex) => imageIndex !== index);

      if (nextImages.length > 0 && !nextImages.some((image) => image.isPrimary)) {
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
          "Заповніть обов'язкові dynamic fields перед переходом далі.",
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

      if (validation.generalError || Object.keys(validation.itemErrors).length > 0) {
        setGeneralMessage(
          validation.generalError ?? "Перевірте дані зображень товару.",
        );
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

    const stepsValid = PRODUCT_STEPS.every((step) => validateStep(step.id));
    if (!stepsValid) {
      const firstBrokenStep = PRODUCT_STEPS.find((step) => !validateStep(step.id));
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
      isFeaturedHit: values.isFeaturedHit,
      isFeaturedNew: values.isFeaturedNew,
      isFeaturedSale: values.isFeaturedSale,
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
          availability: result.fieldErrors?.availability?.[0] ?? current.availability,
          brandId: result.fieldErrors?.brandId?.[0] ?? current.brandId,
          categoryId: result.fieldErrors?.categoryId?.[0] ?? current.categoryId,
          description: result.fieldErrors?.description?.[0] ?? current.description,
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
              nextDynamicErrors[field.id] = matched.split(": ").slice(1).join(": ");
            }
          });

          setDynamicErrors(nextDynamicErrors);
        }

        const imageErrors = result.fieldErrors?.images ?? [];
        if (imageErrors.length > 0) {
          setGeneralMessage(imageErrors[0]);
        } else {
          setGeneralMessage(result.error);
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
      <WizardStepHeader currentStep={currentStep} />

      {currentStep === "category" ? (
        <AdminFormSection
          title="Крок 1. Category"
          description="Спершу визначаємо верхньорівневу category. Вона керує доступними subcategory та dynamic fields."
        >
          <AdminField label="Категорія" error={fieldErrors.categoryId} required>
            <Select value={values.categoryId} onValueChange={updateCategory}>
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
        </AdminFormSection>
      ) : null}

      {currentStep === "subcategory" ? (
        <AdminFormSection
          title="Крок 2. Subcategory"
          description="Після вибору subcategory форма перебудує dynamic fields саме під цю гілку каталогу."
        >
          <AdminField
            label="Підкатегорія"
            error={fieldErrors.subcategoryId}
            required
          >
            <Select value={values.subcategoryId} onValueChange={updateSubcategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Оберіть підкатегорію" />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>
        </AdminFormSection>
      ) : null}

      {currentStep === "dynamic" ? (
        <AdminFormSection
          title="Крок 3. Dynamic fields"
          description="Тут уже працює жива форма характеристик на основі конструктора полів підкатегорій."
        >
          {currentFieldDefinitions.length ? (
            <div className="space-y-4">
              {currentFieldDefinitions.map((field) => {
                const value = dynamicValues[field.id] ?? getEmptyDynamicValue(field.id);
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
                        value={value.valueBoolean}
                        onValueChange={(nextValue) =>
                          updateDynamicValue(field.id, {
                            valueBoolean: nextValue as ProductDynamicValue["valueBoolean"],
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Оберіть true або false" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
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
              title="Для цієї підкатегорії немає dynamic fields"
              description="Це допустимий стан. Можна перейти далі й зберегти товар без додаткових характеристик."
            />
          )}
        </AdminFormSection>
      ) : null}

      {currentStep === "base" ? (
        <AdminFormSection
          title="Крок 4. Base product data"
          description="Тут збираємо базову картку товару: назву, slug, ціну, availability, бренд і flags."
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

            <AdminField label="Наявність" error={fieldErrors.availability} required>
              <Select
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

            <AdminField label="Бренд" error={fieldErrors.brandId}>
              <Select
                value={values.brandId}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  updateValue("brandId", value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Без бренду" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BRAND_VALUE}>Без бренду</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
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
              onChange={(event) => updateValue("description", event.target.value)}
              error={fieldErrors.description}
              rows={5}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
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

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
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

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
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

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
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
            </div>
          </div>
        </AdminFormSection>
      ) : null}

      {currentStep === "images" ? (
        <AdminFormSection
          title="Крок 5. Images"
          description="Поки без Cloudinary uploader, але вже з повною логікою головного фото, галереї та payload для збереження."
        >
          <div className="space-y-4">
            {images.length ? (
              images.map((image, index) => (
                <div
                  key={image.id ?? `${mode}-image-${index}`}
                  className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4"
                >
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

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm leading-6">
                Правила цього кроку: 1 головне фото, до 10 фото в галереї.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={addImage}
                disabled={images.length >= 11}
              >
                Додати фото
              </Button>
            </div>
          </div>
        </AdminFormSection>
      ) : null}

      {currentStep === "seo" ? (
        <AdminFormSection
          title="Крок 6. SEO"
          description="Фінальний крок перед submit. Тут завершуємо SEO-поля і відправляємо повний payload товару."
        >
          <div className="space-y-4">
            <AdminInputField
              id={`${mode}-seo-title`}
              label="SEO title"
              value={values.seoTitle}
              onChange={(event) => updateValue("seoTitle", event.target.value)}
              error={fieldErrors.seoTitle}
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

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm leading-6">
          Крок {currentStepIndex + 1} з {PRODUCT_STEPS.length}. Форма вже
          валідовує category, subcategory, required dynamic fields, base data та
          image rules до submit.
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
  selectedProduct,
  subcategories,
}: AdminProductCrudProps) {
  const router = useRouter();

  const createInitialValues = useMemo(
    () => buildCreateValues(categories, subcategories),
    [categories, subcategories],
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
      {selectedProduct ? (
        <AdminSectionCard
          title="Редагування товару"
          description="Multi-step форма вже працює для edit-сценарію і зберігає повний payload товару через update action."
        >
          <ProductWizard
            brands={brands}
            categories={categories}
            fields={fields}
            initialDynamicValues={buildDynamicValueMap(selectedProduct)}
            initialImages={buildImageDrafts(selectedProduct)}
            initialValues={buildEditValues(selectedProduct)}
            mode="edit"
            onDelete={handleDelete}
            onSuccess={(id) => {
              router.push(`/admin/products?selected=${id}`);
              router.refresh();
            }}
            productId={selectedProduct.id}
            subcategories={subcategories}
          />
        </AdminSectionCard>
      ) : (
        <AdminEmptyState
          title="Оберіть товар для редагування"
          description="Після вибору товару тут з'явиться multi-step форма для його оновлення."
        />
      )}

      <AdminSectionCard
        title="Створення нового товару"
        description="Create-flow уже розбитий на всі 6 кроків і може створювати повноцінні товари з характеристиками, flags, manual images та SEO."
      >
        <ProductWizard
          brands={brands}
          categories={categories}
          fields={fields}
          initialDynamicValues={{}}
          initialImages={[]}
          initialValues={createInitialValues}
          mode="create"
          onSuccess={(id) => {
            router.push(`/admin/products?selected=${id}`);
            router.refresh();
          }}
          subcategories={subcategories}
        />
      </AdminSectionCard>
    </div>
  );
}
