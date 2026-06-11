import { SubcategoryFieldType } from "@prisma/client";

import {
  createBrandSchema,
  createCategorySchema,
  createProductSchema,
  createSubcategoryFieldSchema,
  createSubcategorySchema,
  deleteProductSchema,
  deleteSubcategoryFieldSchema,
  updateBrandSchema,
  updateCategorySchema,
  updateProductSchema,
  updateSubcategoryFieldSchema,
  updateSubcategorySchema,
  type CreateBrandInput,
  type CreateCategoryInput,
  type CreateProductInput,
  type CreateSubcategoryFieldInput,
  type CreateSubcategoryInput,
  type DeleteProductInput,
  type DeleteSubcategoryFieldInput,
  type ProductFieldValueInput,
  type ProductImageInput,
  type ProductOptionInput,
  type UpdateBrandInput,
  type UpdateCategoryInput,
  type UpdateProductInput,
  type UpdateSubcategoryFieldInput,
  type UpdateSubcategoryInput,
  type ValidateProductFieldValuesInput,
  validateProductFieldValuesSchema,
} from "@/features/catalog/schemas";
import {
  createBrand,
  createCategory,
  createProduct,
  createSubcategoryField,
  createSubcategory,
  deleteSubcategoryField,
  getBrandById,
  getBrandByScopedName,
  getBrandByScopedSlug,
  getProductById,
  getProductOptionValueBySlug,
  getProductBySlug,
  getAdminSubcategoryFieldById,
  getCategoryById,
  getCategoryByName,
  getCategoryBySlug,
  getSubcategoryFieldById,
  getSubcategoryFieldByScopedKey,
  getSubcategoryById,
  getSubcategoryByScopedName,
  getSubcategoryByScopedSlug,
  listSubcategoryFields,
  setBrandActiveStatus,
  setCategoryActiveStatus,
  setSubcategoryFieldActiveStatus,
  setSubcategoryActiveStatus,
  softDeleteProduct,
  updateBrand,
  updateCategory as updateCategoryRecord,
  updateProduct,
  updateSubcategoryField,
  updateSubcategory,
} from "@/server/repositories/catalog.repository";

import { z } from "zod";
import { slugifyText } from "@/lib/text/slug";

type MutationSuccess<TData> = {
  data: TData;
  ok: true;
};

type MutationFailure = {
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
  ok: false;
};

export type MutationResult<TData> = MutationSuccess<TData> | MutationFailure;

type NormalizedProductFieldValue = {
  fieldId: string;
  optionId?: string;
  valueBoolean?: boolean;
  valueJson?: string[];
  valueNumber?: number;
  valueText?: string;
};

type NormalizedProductWritePayload = {
  availability: CreateProductInput["availability"];
  brandId?: string;
  categoryId: string;
  description?: string;
  fieldValues: NormalizedProductFieldValue[];
  id?: string;
  images: ProductImageInput[];
  isActive: boolean;
  isFeaturedDiscount: boolean;
  isFeaturedHit: boolean;
  isFeaturedNew: boolean;
  isFeaturedSale: boolean;
  price: number;
  option?: ProductOptionInput;
  seoDescription?: string;
  seoTitle?: string;
  slug: string;
  subcategoryId: string;
  title: string;
};

function validationError(
  fieldErrors: Record<string, string[] | undefined>,
  error = "Перевірте коректність заповнених даних.",
) {
  return {
    ok: false as const,
    error,
    fieldErrors,
  };
}

const PRODUCT_VALIDATION_LABELS: Record<string, string> = {
  availability: "Наявність",
  brandId: "Виробник",
  categoryId: "Категорія",
  description: "Опис",
  fieldValues: "Характеристики",
  id: "Товар",
  images: "Фото товару",
  isActive: "Статус",
  isFeaturedDiscount: "Бейдж Знижка",
  isFeaturedHit: "Бейдж Хіт продажів",
  isFeaturedNew: "Бейдж Новинка",
  isFeaturedSale: "Бейдж Акція",
  option: "Опції товару",
  price: "Ціна",
  seoDescription: "SEO description",
  seoTitle: "SEO title",
  slug: "Slug",
  subcategoryId: "Підкатегорія",
  title: "Назва товару",
};

function normalizeZodMessage(message: string) {
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

function formatProductValidationIssue(issue: z.ZodIssue) {
  const [topLevelField, ...nestedPath] = issue.path;
  const field = String(topLevelField ?? "form");
  const label = PRODUCT_VALIDATION_LABELS[field] ?? field;
  const nestedPathText = nestedPath.map(String).join(".");

  if (field === "images") {
    if (nestedPathText.includes("url")) {
      return "Фото товару: перезавантажте фото або перевірте URL зображення.";
    }

    if (nestedPathText.includes("publicId")) {
      return "Фото товару: відсутній Cloudinary publicId, перезавантажте фото.";
    }
  }

  if (field === "option") {
    const optionValueIndex = nestedPath.find(
      (pathPart) => typeof pathPart === "number",
    );
    const optionValuePrefix =
      typeof optionValueIndex === "number"
        ? `Значення опції #${optionValueIndex + 1}: `
        : "";

    if (nestedPathText.includes("image")) {
      return `Опції товару: ${optionValuePrefix}завантажте фото.`;
    }

    if (nestedPathText.includes("label")) {
      return `Опції товару: ${optionValuePrefix}вкажіть назву значення.`;
    }

    if (nestedPathText.includes("name")) {
      return "Опції товару: вкажіть назву групи опцій.";
    }

    return `Опції товару: ${optionValuePrefix}${normalizeZodMessage(issue.message)}`;
  }

  if (field === "form") {
    return normalizeZodMessage(issue.message);
  }

  return `${label}: ${normalizeZodMessage(issue.message)}`;
}

function productValidationError(error: z.ZodError) {
  return validationError(
    error.flatten().fieldErrors,
    formatProductValidationIssue(error.issues[0]),
  );
}

function ok<TData>(data: TData): MutationResult<TData> {
  return {
    ok: true,
    data,
  };
}

const activeStatusSchema = z.object({
  id: z.string().trim().min(1).max(191),
  isActive: z.coerce.boolean(),
});

const deactivateSchema = z.object({
  id: z.string().trim().min(1).max(191),
});

async function ensureCategory(categoryId: string) {
  const category = await getCategoryById(categoryId);

  if (!category) {
    return null;
  }

  return category;
}

async function validateCategoryUniqueness(
  payload: CreateCategoryInput | UpdateCategoryInput,
  currentId?: string,
) {
  const duplicatedName = await getCategoryByName(payload.name);
  if (duplicatedName && duplicatedName.id !== currentId) {
    return {
      ok: false as const,
      error: "Категорія з такою назвою вже існує.",
      fieldErrors: {
        name: ["Категорія з такою назвою вже існує."],
      },
    };
  }

  const duplicatedSlug = await getCategoryBySlug(payload.slug);
  if (duplicatedSlug && duplicatedSlug.id !== currentId) {
    return {
      ok: false as const,
      error: "Категорія з таким slug вже існує.",
      fieldErrors: {
        slug: ["Категорія з таким slug вже існує."],
      },
    };
  }

  return null;
}

export async function createAdminCategory(input: unknown): Promise<
  MutationResult<{
    id: string;
    name: string;
    slug: string;
  }>
> {
  const parsed = createCategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: CreateCategoryInput = parsed.data;
  const uniquenessError = await validateCategoryUniqueness(payload);

  if (uniquenessError) {
    return uniquenessError;
  }

  const category = await createCategory(payload);

  return ok(category);
}

export async function updateCategory(input: unknown): Promise<
  MutationResult<{
    id: string;
    name: string;
    slug: string;
  }>
> {
  const parsed = updateCategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: UpdateCategoryInput = parsed.data;
  const category = await ensureCategory(payload.id);

  if (!category) {
    return {
      ok: false,
      error: "Категорію не знайдено або вона не належить до fixed structure.",
    };
  }

  const duplicatedName = await getCategoryByName(payload.name);
  if (duplicatedName && duplicatedName.id !== payload.id) {
    return {
      ok: false,
      error: "Категорія з такою назвою вже існує.",
      fieldErrors: {
        name: ["Категорія з такою назвою вже існує."],
      },
    };
  }

  const duplicatedSlug = await getCategoryBySlug(payload.slug);
  if (duplicatedSlug && duplicatedSlug.id !== payload.id) {
    return {
      ok: false,
      error: "Категорія з таким slug вже існує.",
      fieldErrors: {
        slug: ["Категорія з таким slug вже існує."],
      },
    };
  }

  const updatedCategory = await updateCategoryRecord(payload);

  return ok(updatedCategory);
}

export async function setAdminCategoryActiveStatus(input: unknown): Promise<
  MutationResult<{
    id: string;
    isActive: boolean;
  }>
> {
  const parsed = activeStatusSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const category = await ensureCategory(parsed.data.id);

  if (!category) {
    return {
      ok: false,
      error: "Категорію не знайдено.",
    };
  }

  const updatedCategory = await setCategoryActiveStatus(parsed.data);

  return ok(updatedCategory);
}

async function validateSubcategoryUniqueness(
  payload: CreateSubcategoryInput | UpdateSubcategoryInput,
  currentId?: string,
) {
  const duplicatedName = await getSubcategoryByScopedName({
    categoryId: payload.categoryId,
    name: payload.name,
  });

  if (duplicatedName && duplicatedName.id !== currentId) {
    return {
      ok: false as const,
      error: "У цій категорії вже існує підкатегорія з такою назвою.",
      fieldErrors: {
        name: ["У цій категорії вже існує підкатегорія з такою назвою."],
      },
    };
  }

  const duplicatedSlug = await getSubcategoryByScopedSlug({
    categoryId: payload.categoryId,
    slug: payload.slug,
  });

  if (duplicatedSlug && duplicatedSlug.id !== currentId) {
    return {
      ok: false as const,
      error: "У цій категорії вже існує підкатегорія з таким slug.",
      fieldErrors: {
        slug: ["У цій категорії вже існує підкатегорія з таким slug."],
      },
    };
  }

  return null;
}

async function validateSubcategoryFieldUniqueness(
  payload: CreateSubcategoryFieldInput | UpdateSubcategoryFieldInput,
  currentId?: string,
) {
  const duplicatedField = await getSubcategoryFieldByScopedKey({
    subcategoryId: payload.subcategoryId,
    key: payload.key,
  });

  if (duplicatedField && duplicatedField.id !== currentId) {
    return {
      ok: false as const,
      error: "У цій підкатегорії вже існує поле з таким ключем.",
      fieldErrors: {
        key: ["У цій підкатегорії вже існує поле з таким ключем."],
      },
    };
  }

  return null;
}

function validateFieldUsageCompatibility(input: {
  currentSubcategoryId: string;
  nextSubcategoryId: string;
  currentType: SubcategoryFieldType;
  nextType: SubcategoryFieldType;
  productValuesCount: number;
  currentOptions: Array<{
    value: string;
    _count?: {
      valuesUsed: true | number;
    };
  }>;
  nextOptions: Array<{
    value: string;
  }>;
}) {
  if (input.productValuesCount === 0) {
    return null;
  }

  if (input.currentSubcategoryId !== input.nextSubcategoryId) {
    return {
      ok: false as const,
      error:
        "Не можна переносити поле в іншу підкатегорію, поки воно використовується товарами.",
      fieldErrors: {
        subcategoryId: [
          "Не можна переносити поле в іншу підкатегорію, поки воно використовується товарами.",
        ],
      },
    };
  }

  if (input.currentType !== input.nextType) {
    return {
      ok: false as const,
      error:
        "Не можна змінити тип поля, поки воно вже використовується в товарах.",
      fieldErrors: {
        type: [
          "Не можна змінити тип поля, поки воно вже використовується в товарах.",
        ],
      },
    };
  }

  if (
    input.nextType !== SubcategoryFieldType.SELECT &&
    input.nextType !== SubcategoryFieldType.MULTI_SELECT
  ) {
    return null;
  }

  const nextOptionValues = new Set(
    input.nextOptions.map((option) => option.value.trim().toLowerCase()),
  );

  const removedUsedOption = input.currentOptions.some((option) => {
    const usageCount =
      typeof option._count?.valuesUsed === "number"
        ? option._count.valuesUsed
        : option._count?.valuesUsed
          ? 1
          : 0;

    if (usageCount === 0) {
      return false;
    }

    return !nextOptionValues.has(option.value.trim().toLowerCase());
  });

  if (removedUsedOption) {
    return {
      ok: false as const,
      error:
        "Не можна видаляти або замінювати select-опції, які вже використовуються товарами.",
      fieldErrors: {
        options: [
          "Не можна видаляти або замінювати select-опції, які вже використовуються товарами.",
        ],
      },
    };
  }

  return null;
}

export async function createAdminSubcategory(input: unknown): Promise<
  MutationResult<{
    id: string;
    name: string;
    slug: string;
  }>
> {
  const parsed = createSubcategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: CreateSubcategoryInput = parsed.data;
  const category = await ensureCategory(payload.categoryId);

  if (!category) {
    return {
      ok: false,
      error: "Потрібно вибрати існуючу категорію для підкатегорії.",
      fieldErrors: {
        categoryId: ["Потрібно вибрати існуючу категорію."],
      },
    };
  }

  const uniquenessError = await validateSubcategoryUniqueness(payload);
  if (uniquenessError) {
    return uniquenessError;
  }

  const subcategory = await createSubcategory(payload);

  return ok(subcategory);
}

export async function createAdminSubcategoryField(input: unknown): Promise<
  MutationResult<{
    id: string;
    label: string;
    key: string;
  }>
> {
  const parsed = createSubcategoryFieldSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: CreateSubcategoryFieldInput = parsed.data;
  const subcategory = await getSubcategoryById(payload.subcategoryId);

  if (!subcategory) {
    return {
      ok: false,
      error: "Підкатегорію для поля не знайдено.",
      fieldErrors: {
        subcategoryId: ["Потрібно вибрати існуючу підкатегорію."],
      },
    };
  }

  const uniquenessError = await validateSubcategoryFieldUniqueness(payload);
  if (uniquenessError) {
    return uniquenessError;
  }

  const field = await createSubcategoryField(payload);

  return ok(field);
}

export async function updateAdminSubcategory(input: unknown): Promise<
  MutationResult<{
    id: string;
    name: string;
    slug: string;
  }>
> {
  const parsed = updateSubcategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: UpdateSubcategoryInput = parsed.data;
  const existingSubcategory = await getSubcategoryById(payload.id);

  if (!existingSubcategory) {
    return {
      ok: false,
      error: "Підкатегорію не знайдено.",
    };
  }

  const category = await ensureCategory(payload.categoryId);
  if (!category) {
    return {
      ok: false,
      error: "Потрібно вибрати існуючу категорію для підкатегорії.",
      fieldErrors: {
        categoryId: ["Потрібно вибрати існуючу категорію."],
      },
    };
  }

  if (
    existingSubcategory.categoryId !== payload.categoryId &&
    existingSubcategory._count.products > 0
  ) {
    return {
      ok: false,
      error:
        "Не можна змінити категорію підкатегорії, поки до неї прив'язані товари.",
      fieldErrors: {
        categoryId: [
          "Не можна змінити категорію підкатегорії, поки до неї прив'язані товари.",
        ],
      },
    };
  }

  const uniquenessError = await validateSubcategoryUniqueness(
    payload,
    payload.id,
  );
  if (uniquenessError) {
    return uniquenessError;
  }

  const updatedSubcategory = await updateSubcategory(payload);

  return ok(updatedSubcategory);
}

export async function updateAdminSubcategoryField(input: unknown): Promise<
  MutationResult<{
    id: string;
    label: string;
    key: string;
  }>
> {
  const parsed = updateSubcategoryFieldSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: UpdateSubcategoryFieldInput = parsed.data;
  const existingField = await getAdminSubcategoryFieldById(payload.id);

  if (!existingField) {
    return {
      ok: false,
      error: "Поле підкатегорії не знайдено.",
    };
  }

  const subcategory = await getSubcategoryById(payload.subcategoryId);

  if (!subcategory) {
    return {
      ok: false,
      error: "Підкатегорію для поля не знайдено.",
      fieldErrors: {
        subcategoryId: ["Потрібно вибрати існуючу підкатегорію."],
      },
    };
  }

  const uniquenessError = await validateSubcategoryFieldUniqueness(
    payload,
    payload.id,
  );
  if (uniquenessError) {
    return uniquenessError;
  }

  const usageCompatibilityError = validateFieldUsageCompatibility({
    currentSubcategoryId: existingField.subcategoryId,
    nextSubcategoryId: payload.subcategoryId,
    currentType: existingField.type,
    nextType: payload.type,
    productValuesCount: existingField._count.productValues,
    currentOptions: existingField.options,
    nextOptions: payload.options,
  });

  if (usageCompatibilityError) {
    return usageCompatibilityError;
  }

  const updatedField = await updateSubcategoryField(payload);

  return ok(updatedField);
}

export async function deactivateAdminSubcategory(input: unknown): Promise<
  MutationResult<{
    id: string;
    isActive: boolean;
  }>
> {
  const parsed = deactivateSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload = parsed.data;
  const subcategory = await getSubcategoryById(payload.id);

  if (!subcategory) {
    return {
      ok: false,
      error: "Підкатегорію не знайдено.",
    };
  }

  if (subcategory.id.length === 0) {
    return {
      ok: false,
      error:
        "Не можна видалити підкатегорію, поки до неї прив'язані товари або поля.",
    };
  }

  const deactivatedSubcategory = await setSubcategoryActiveStatus({
    id: payload.id,
    isActive: false,
  });

  return ok(deactivatedSubcategory);
}

export async function setAdminSubcategoryActiveStatus(input: unknown): Promise<
  MutationResult<{
    id: string;
    isActive: boolean;
  }>
> {
  const parsed = activeStatusSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const subcategory = await getSubcategoryById(parsed.data.id);

  if (!subcategory) {
    return {
      ok: false,
      error: "Підкатегорію не знайдено.",
    };
  }

  const updatedSubcategory = await setSubcategoryActiveStatus(parsed.data);

  return ok(updatedSubcategory);
}

export async function deleteAdminSubcategoryField(input: unknown): Promise<
  MutationResult<{
    id: string;
  }>
> {
  const parsed = deleteSubcategoryFieldSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: DeleteSubcategoryFieldInput = parsed.data;
  const field = await getSubcategoryFieldById(payload.id);

  if (!field) {
    return {
      ok: false,
      error: "Поле підкатегорії не знайдено.",
    };
  }

  if (field._count.productValues > 0) {
    return {
      ok: false,
      error:
        "Не можна видалити поле, поки воно використовується в товарах цієї підкатегорії.",
    };
  }

  const deletedField = await deleteSubcategoryField(payload.id);

  return ok(deletedField);
}

export async function setAdminSubcategoryFieldActiveStatus(
  input: unknown,
): Promise<
  MutationResult<{
    id: string;
    isActive: boolean;
  }>
> {
  const parsed = activeStatusSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const field = await getSubcategoryFieldById(parsed.data.id);

  if (!field) {
    return {
      ok: false,
      error: "Поле підкатегорії не знайдено.",
    };
  }

  const updatedField = await setSubcategoryFieldActiveStatus(parsed.data);

  return ok(updatedField);
}

function hasTextValue(value: ProductFieldValueInput) {
  return (
    typeof value.valueText === "string" && value.valueText.trim().length > 0
  );
}

function hasNumberValue(value: ProductFieldValueInput) {
  return (
    typeof value.valueNumber === "number" && Number.isFinite(value.valueNumber)
  );
}

function hasBooleanValue(value: ProductFieldValueInput) {
  return typeof value.valueBoolean === "boolean";
}

function hasJsonArrayValue(value: ProductFieldValueInput) {
  return Array.isArray(value.valueJson) && value.valueJson.length > 0;
}

function getNumberValue(value: ProductFieldValueInput) {
  return typeof value.valueNumber === "number" ? value.valueNumber : undefined;
}

function getBooleanValue(value: ProductFieldValueInput) {
  return typeof value.valueBoolean === "boolean"
    ? value.valueBoolean
    : undefined;
}

function getJsonArrayValue(value: ProductFieldValueInput) {
  return Array.isArray(value.valueJson) ? value.valueJson : undefined;
}

function mapProductFieldValueErrors(
  errors: Array<{ fieldId: string; message: string }>,
): Record<string, string[] | undefined> {
  return {
    fieldValues: errors.map((error) => `${error.fieldId}: ${error.message}`),
  };
}

export async function validateProductFieldValuesCompatibility(
  input: unknown,
): Promise<MutationResult<{ fieldValues: NormalizedProductFieldValue[] }>> {
  const parsed = validateProductFieldValuesSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: ValidateProductFieldValuesInput = parsed.data;
  const subcategory = await getSubcategoryById(payload.subcategoryId);

  if (!subcategory) {
    return {
      ok: false,
      error: "Підкатегорію товару не знайдено.",
      fieldErrors: {
        subcategoryId: ["Потрібно вибрати існуючу підкатегорію."],
      },
    };
  }

  if (subcategory.categoryId !== payload.categoryId) {
    return {
      ok: false,
      error:
        "Підкатегорія не належить до вибраної категорії, тому товар не можна зберегти.",
      fieldErrors: {
        subcategoryId: ["Підкатегорія не належить до вибраної категорії."],
      },
    };
  }

  const allowedFields = await listSubcategoryFields(payload.subcategoryId);
  const allowedFieldMap = new Map(
    allowedFields.map((field) => [
      field.id,
      {
        ...field,
        optionMap: new Map(field.options.map((option) => [option.id, option])),
      },
    ]),
  );

  const normalizedValues: NormalizedProductFieldValue[] = [];
  const fieldValueErrors: Array<{ fieldId: string; message: string }> = [];

  for (const fieldValue of payload.fieldValues) {
    const field = allowedFieldMap.get(fieldValue.fieldId);

    if (!field) {
      fieldValueErrors.push({
        fieldId: fieldValue.fieldId,
        message:
          "Поле не належить до вибраної підкатегорії та не може бути збережене для цього товару.",
      });
      continue;
    }

    if (field.type === SubcategoryFieldType.SELECT) {
      if (!fieldValue.optionId) {
        fieldValueErrors.push({
          fieldId: field.key,
          message: "Для SELECT-поля потрібно вибрати одну з дозволених опцій.",
        });
        continue;
      }

      if (!field.optionMap.has(fieldValue.optionId)) {
        fieldValueErrors.push({
          fieldId: field.key,
          message: "Обрана опція не належить до цього поля підкатегорії.",
        });
        continue;
      }

      normalizedValues.push({
        fieldId: field.id,
        optionId: fieldValue.optionId,
      });
      continue;
    }

    if (field.type === SubcategoryFieldType.MULTI_SELECT) {
      if (!hasJsonArrayValue(fieldValue)) {
        fieldValueErrors.push({
          fieldId: field.key,
          message:
            "Для MULTI_SELECT-поля потрібно вибрати хоча б одну дозволену опцію.",
        });
        continue;
      }

      const selectedOptionIds = getJsonArrayValue(fieldValue) ?? [];
      const hasUnknownOption = selectedOptionIds.some(
        (optionId) => !field.optionMap.has(optionId),
      );

      if (hasUnknownOption) {
        fieldValueErrors.push({
          fieldId: field.key,
          message:
            "Одна з обраних опцій не належить до цього поля підкатегорії.",
        });
        continue;
      }

      normalizedValues.push({
        fieldId: field.id,
        valueJson: selectedOptionIds,
      });
      continue;
    }

    if (field.type === SubcategoryFieldType.NUMBER) {
      if (!hasNumberValue(fieldValue)) {
        fieldValueErrors.push({
          fieldId: field.key,
          message: "Для поля типу NUMBER потрібно передати числове значення.",
        });
        continue;
      }

      normalizedValues.push({
        fieldId: field.id,
        valueNumber: getNumberValue(fieldValue),
      });
      continue;
    }

    if (field.type === SubcategoryFieldType.BOOLEAN) {
      if (!hasBooleanValue(fieldValue)) {
        fieldValueErrors.push({
          fieldId: field.key,
          message: "Для поля типу BOOLEAN потрібно передати true або false.",
        });
        continue;
      }

      normalizedValues.push({
        fieldId: field.id,
        valueBoolean: getBooleanValue(fieldValue),
      });
      continue;
    }

    if (!hasTextValue(fieldValue)) {
      fieldValueErrors.push({
        fieldId: field.key,
        message:
          "Для текстового поля потрібно передати непорожнє текстове значення.",
      });
      continue;
    }

    normalizedValues.push({
      fieldId: field.id,
      valueText: fieldValue.valueText,
    });
  }

  const providedFieldIds = new Set(
    payload.fieldValues.map((value) => value.fieldId),
  );
  const missingRequiredFields = allowedFields.filter(
    (field) =>
      field.isActive && field.isRequired && !providedFieldIds.has(field.id),
  );

  for (const field of missingRequiredFields) {
    fieldValueErrors.push({
      fieldId: field.key,
      message: "Обов'язкове поле не заповнене для цього товару.",
    });
  }

  if (fieldValueErrors.length > 0) {
    return {
      ok: false,
      error:
        "Значення характеристик товару не сумісні з вибраною підкатегорією.",
      fieldErrors: mapProductFieldValueErrors(fieldValueErrors),
    };
  }


  return ok({
    fieldValues: normalizedValues,
  });
}

async function normalizeProductFieldValues(input: {
  categoryId: string;
  subcategoryId: string;
  fieldValues: ProductFieldValueInput[];
}) {
  const compatibility = await validateProductFieldValuesCompatibility(input);

  if (!compatibility.ok) {
    return compatibility;
  }

  return compatibility.data.fieldValues;
}

async function validateProductRelations(input: {
  categoryId: string;
  subcategoryId: string;
  brandId?: string;
  currentCategoryId?: string;
  currentBrandId?: string;
  currentSubcategoryId?: string;
}) {
  const category = await ensureCategory(input.categoryId);

  if (!category) {
    return {
      ok: false as const,
      error: "Потрібно вибрати існуючу категорію для товару.",
      fieldErrors: {
        categoryId: ["Потрібно вибрати існуючу категорію."],
      },
    };
  }

  const subcategory = await getSubcategoryById(input.subcategoryId);

  if (!subcategory) {
    return {
      ok: false as const,
      error: "Підкатегорію товару не знайдено.",
      fieldErrors: {
        subcategoryId: ["Потрібно вибрати існуючу підкатегорію."],
      },
    };
  }

  const preservesExistingCatalogRelation =
    input.categoryId === input.currentCategoryId &&
    input.subcategoryId === input.currentSubcategoryId;

  if (
    (!category.isActive || !subcategory.isActive) &&
    !preservesExistingCatalogRelation
  ) {
    return {
      ok: false as const,
      error:
        "Товар можна прив'язувати тільки до активної категорії та активної підкатегорії.",
      fieldErrors: {
        categoryId: !category.isActive
          ? ["Оберіть активну категорію товару."]
          : undefined,
        subcategoryId: !subcategory.isActive
          ? ["Оберіть активну підкатегорію товару."]
          : undefined,
      },
    };
  }

  if (subcategory.categoryId !== input.categoryId) {
    return {
      ok: false as const,
      error:
        "Підкатегорія не належить до вибраної категорії, тому товар не можна зберегти.",
      fieldErrors: {
        subcategoryId: ["Підкатегорія не належить до вибраної категорії."],
      },
    };
  }

  if (!input.brandId) {
    return null;
  }

  const brand = await getBrandById(input.brandId);

  if (!brand) {
    return {
      ok: false as const,
      error: "Бренд товару не знайдено.",
      fieldErrors: {
        brandId: [
          "Потрібно вибрати існуючий бренд або залишити поле порожнім.",
        ],
      },
    };
  }

  const isPreservingCurrentBrand =
    input.brandId === input.currentBrandId &&
    input.subcategoryId === input.currentSubcategoryId;

  if (!isPreservingCurrentBrand && !brand.isActive) {
    return {
      ok: false as const,
      error: "Оберіть активного виробника товару.",
      fieldErrors: {
        brandId: ["Оберіть активного виробника товару."],
      },
    };
  }

  if (brand.subcategoryId !== input.subcategoryId) {
    return {
      ok: false as const,
      error: "Виробник не належить до вибраної підкатегорії.",
      fieldErrors: {
        brandId: ["Виробник не належить до вибраної підкатегорії."],
      },
    };
  }

  return null;
}

async function validateProductSlugUniqueness(
  payload: CreateProductInput | UpdateProductInput,
  currentId?: string,
) {
  const duplicatedSlug = await getProductBySlug(payload.slug);

  if (duplicatedSlug && duplicatedSlug.id !== currentId) {
    return {
      ok: false as const,
      error: "Товар з таким slug вже існує.",
      fieldErrors: {
        slug: ["Товар з таким slug вже існує."],
      },
    };
  }

  const duplicatedOptionSlug = await getProductOptionValueBySlug(payload.slug);

  if (
    duplicatedOptionSlug &&
    duplicatedOptionSlug.productOption.productId !== currentId
  ) {
    return {
      ok: false as const,
      error: "Slug товару вже використовується варіантом іншого товару.",
      fieldErrors: {
        slug: ["Slug товару вже використовується варіантом іншого товару."],
      },
    };
  }

  return null;
}

function normalizeProductOptionPayload(
  payload: CreateProductInput | UpdateProductInput,
): ProductOptionInput | undefined {
  if (!payload.option) {
    return undefined;
  }

  return {
    ...payload.option,
    values: payload.option.values.map((value, index) => {
      const optionSlug =
        value.slug?.trim() ||
        slugifyText(`${payload.slug}-${value.label}`) ||
        `${payload.slug}-option-${index + 1}`;
      const optionTitle = value.titleOverride?.trim() || undefined;

      return {
        ...value,
        image: value.imageRemoved ? "" : value.image,
        imagePublicId: value.imageRemoved ? undefined : value.imagePublicId,
        slug: optionSlug,
        titleOverride: optionTitle,
        seoTitle: value.seoTitle?.trim() || undefined,
        seoDescription: value.seoDescription?.trim() || undefined,
      };
    }),
  };
}

async function validateProductOptionSlugUniqueness(
  option: ProductOptionInput | undefined,
  productSlug: string,
  currentProductId?: string,
) {
  if (!option) {
    return null;
  }

  const seenSlugs = new Set<string>();

  for (const [index, value] of option.values.entries()) {
    const optionSlug = value.slug?.trim();

    if (!optionSlug) {
      continue;
    }

    if (optionSlug === productSlug) {
      return {
        ok: false as const,
        error: "Slug варіанту не може збігатися зі slug основного товару.",
        fieldErrors: {
          option: [
            `Значення опції #${index + 1}: slug не може збігатися зі slug основного товару.`,
          ],
        },
      };
    }

    if (seenSlugs.has(optionSlug)) {
      return {
        ok: false as const,
        error: "Варіанти товару мають дублікати slug.",
        fieldErrors: {
          option: [`Значення опції #${index + 1}: slug дублюється.`],
        },
      };
    }

    seenSlugs.add(optionSlug);

    const productWithSameSlug = await getProductBySlug(optionSlug);

    if (productWithSameSlug && productWithSameSlug.id !== currentProductId) {
      return {
        ok: false as const,
        error: "Slug варіанту вже використовується іншим товаром.",
        fieldErrors: {
          option: [
            `Значення опції #${index + 1}: slug вже використовується іншим товаром.`,
          ],
        },
      };
    }

    const optionWithSameSlug = await getProductOptionValueBySlug(optionSlug);

    if (
      optionWithSameSlug &&
      optionWithSameSlug.productOption.productId !== currentProductId
    ) {
      return {
        ok: false as const,
        error: "Slug варіанту вже використовується іншим варіантом.",
        fieldErrors: {
          option: [
            `Значення опції #${index + 1}: slug вже використовується іншим варіантом.`,
          ],
        },
      };
    }
  }

  return null;
}

async function normalizeProductWritePayload(
  payload: CreateProductInput | UpdateProductInput,
  existingProduct?: {
    brandId?: string | null;
    categoryId: string;
    subcategoryId: string;
  },
): Promise<MutationResult<NormalizedProductWritePayload>> {
  const relationError = await validateProductRelations({
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    brandId: payload.brandId,
    currentCategoryId: existingProduct?.categoryId,
    currentBrandId: existingProduct?.brandId ?? undefined,
    currentSubcategoryId: existingProduct?.subcategoryId,
  });

  if (relationError) {
    return relationError;
  }

  const normalizedFieldValues = await normalizeProductFieldValues({
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    fieldValues: payload.fieldValues,
  });

  if (!Array.isArray(normalizedFieldValues)) {
    return normalizedFieldValues;
  }

  const productSeoTitle =
    payload.seoTitle ??
    `${payload.title}: купити в інтернет-магазині Voodoo Vape`;
  const productSeoDescription =
    payload.seoDescription ??
    `${payload.title}: замовити за вигідною ціною в Україні у Voodoo Vape. Швидке оформлення, зручна доставка по Україні та актуальний асортимент.`;

  const normalizedOption = normalizeProductOptionPayload(payload);
  const optionSlugError = await validateProductOptionSlugUniqueness(
    normalizedOption,
    payload.slug,
    "id" in payload ? payload.id : undefined,
  );

  if (optionSlugError) {
    return optionSlugError;
  }

  return ok({
    availability: payload.availability,
    brandId: payload.brandId,
    categoryId: payload.categoryId,
    description: payload.description,
    fieldValues: normalizedFieldValues,
    id: "id" in payload ? payload.id : undefined,
    images: payload.images,
    isActive: payload.isActive,
    isFeaturedDiscount: payload.isFeaturedDiscount,
    isFeaturedHit: payload.isFeaturedHit,
    isFeaturedNew: payload.isFeaturedNew,
    isFeaturedSale: payload.isFeaturedSale,
    option: normalizedOption,
    price: payload.price,
    seoDescription: productSeoDescription,
    seoTitle: productSeoTitle,
    slug: payload.slug,
    subcategoryId: payload.subcategoryId,
    title: payload.title,
  });
}

async function validateBrandUniqueness(
  payload: CreateBrandInput | UpdateBrandInput,
  currentId?: string,
) {
  const duplicatedName = await getBrandByScopedName({
    subcategoryId: payload.subcategoryId,
    name: payload.name,
  });
  if (duplicatedName && duplicatedName.id !== currentId) {
    return {
      ok: false as const,
      error: "Бренд з такою назвою вже існує.",
      fieldErrors: {
        name: ["Бренд з такою назвою вже існує."],
      },
    };
  }

  const duplicatedSlug = await getBrandByScopedSlug({
    subcategoryId: payload.subcategoryId,
    slug: payload.slug,
  });
  if (duplicatedSlug && duplicatedSlug.id !== currentId) {
    return {
      ok: false as const,
      error: "Бренд з таким slug вже існує.",
      fieldErrors: {
        slug: ["Бренд з таким slug вже існує."],
      },
    };
  }

  return null;
}

export async function createAdminBrand(input: unknown): Promise<
  MutationResult<{
    id: string;
    name: string;
    slug: string;
  }>
> {
  const parsed = createBrandSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: CreateBrandInput = parsed.data;
  const subcategory = await getSubcategoryById(payload.subcategoryId);

  if (!subcategory) {
    return {
      ok: false,
      error: "Потрібно вибрати існуючу підкатегорію для виробника.",
      fieldErrors: {
        subcategoryId: ["Потрібно вибрати існуючу підкатегорію."],
      },
    };
  }

  const uniquenessError = await validateBrandUniqueness(payload);
  if (uniquenessError) {
    return uniquenessError;
  }

  const brand = await createBrand(payload);

  return ok(brand);
}

export async function updateAdminBrand(input: unknown): Promise<
  MutationResult<{
    id: string;
    name: string;
    slug: string;
  }>
> {
  const parsed = updateBrandSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: UpdateBrandInput = parsed.data;
  const existingBrand = await getBrandById(payload.id);

  if (!existingBrand) {
    return {
      ok: false,
      error: "Бренд не знайдено.",
    };
  }

  const subcategory = await getSubcategoryById(payload.subcategoryId);

  if (!subcategory) {
    return {
      ok: false,
      error: "Потрібно вибрати існуючу підкатегорію для виробника.",
      fieldErrors: {
        subcategoryId: ["Потрібно вибрати існуючу підкатегорію."],
      },
    };
  }

  if (
    existingBrand.subcategoryId !== payload.subcategoryId &&
    existingBrand._count.products > 0
  ) {
    return {
      ok: false,
      error:
        "Не можна змінити підкатегорію виробника, поки до нього прив'язані товари.",
      fieldErrors: {
        subcategoryId: [
          "Не можна змінити підкатегорію виробника, поки до нього прив'язані товари.",
        ],
      },
    };
  }

  const uniquenessError = await validateBrandUniqueness(payload, payload.id);
  if (uniquenessError) {
    return uniquenessError;
  }

  const updatedBrand = await updateBrand(payload);

  return ok(updatedBrand);
}

export async function setAdminBrandActiveStatus(input: unknown): Promise<
  MutationResult<{
    id: string;
    isActive: boolean;
  }>
> {
  const parsed = activeStatusSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const brand = await getBrandById(parsed.data.id);

  if (!brand) {
    return {
      ok: false,
      error: "Бренд не знайдено.",
    };
  }

  if (false) {
    return {
      ok: false,
      error:
        "Не можна видалити бренд, поки до нього прив'язані товари. Спершу відв'яжіть товари або деактивуйте бренд.",
    };
  }

  const updatedBrand = await setBrandActiveStatus(parsed.data);

  return ok(updatedBrand);
}

export async function createAdminProduct(input: unknown): Promise<
  MutationResult<{
    id: string;
    slug: string;
    title: string;
  }>
> {
  const parsed = createProductSchema.safeParse(input);

  if (!parsed.success) {
    return productValidationError(parsed.error);
  }

  const payload: CreateProductInput = parsed.data;
  const uniquenessError = await validateProductSlugUniqueness(payload);

  if (uniquenessError) {
    return uniquenessError;
  }

  const normalizedPayload = await normalizeProductWritePayload(payload);

  if (!normalizedPayload.ok) {
    return normalizedPayload;
  }

  const product = await createProduct(normalizedPayload.data);

  return ok({
    id: product.id,
    slug: product.slug,
    title: product.title,
  });
}

export async function updateAdminProduct(input: unknown): Promise<
  MutationResult<{
    id: string;
    slug: string;
    title: string;
  }>
> {
  const parsed = updateProductSchema.safeParse(input);

  if (!parsed.success) {
    return productValidationError(parsed.error);
  }

  const payload: UpdateProductInput = parsed.data;
  const existingProduct = await getProductById(payload.id);

  if (!existingProduct) {
    return {
      ok: false,
      error: "Товар не знайдено.",
    };
  }

  const uniquenessError = await validateProductSlugUniqueness(
    payload,
    payload.id,
  );

  if (uniquenessError) {
    return uniquenessError;
  }

  const normalizedPayload = await normalizeProductWritePayload(
    payload,
    existingProduct,
  );

  if (!normalizedPayload.ok) {
    return normalizedPayload;
  }

  const product = await updateProduct({
    ...normalizedPayload.data,
    id: payload.id,
  });

  return ok({
    id: product.id,
    slug: product.slug,
    title: product.title,
  });
}

export async function deleteAdminProduct(input: unknown): Promise<
  MutationResult<{
    id: string;
    isActive: boolean;
  }>
> {
  const parsed = deleteProductSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: DeleteProductInput = parsed.data;
  const existingProduct = await getProductById(payload.id);

  if (!existingProduct) {
    return {
      ok: false,
      error: "Товар не знайдено.",
    };
  }

  const deletedProduct = await softDeleteProduct(payload.id);

  return ok(deletedProduct);
}
