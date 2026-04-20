import { SubcategoryFieldType } from "@prisma/client";

import {
  createBrandSchema,
  createSubcategoryFieldSchema,
  createSubcategorySchema,
  deleteBrandSchema,
  deleteSubcategoryFieldSchema,
  deleteSubcategorySchema,
  updateBrandSchema,
  updateCategorySchema,
  updateSubcategoryFieldSchema,
  updateSubcategorySchema,
  type CreateBrandInput,
  type CreateSubcategoryFieldInput,
  type CreateSubcategoryInput,
  type DeleteBrandInput,
  type DeleteSubcategoryFieldInput,
  type DeleteSubcategoryInput,
  type UpdateBrandInput,
  type UpdateCategoryInput,
  type UpdateSubcategoryFieldInput,
  type UpdateSubcategoryInput,
} from "@/features/catalog/schemas";
import {
  createBrand,
  createSubcategoryField,
  createSubcategory,
  deleteBrand,
  deleteSubcategoryField,
  deleteSubcategory,
  getBrandById,
  getBrandByName,
  getBrandBySlug,
  getAdminSubcategoryFieldById,
  getCategoryById,
  getCategoryByName,
  getCategoryBySlug,
  getSubcategoryFieldById,
  getSubcategoryFieldByScopedKey,
  getSubcategoryById,
  getSubcategoryByScopedName,
  getSubcategoryByScopedSlug,
  updateBrand,
  updateFixedCategory,
  updateSubcategoryField,
  updateSubcategory,
} from "@/server/repositories/catalog.repository";

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

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    ok: false as const,
    error: "Перевірте коректність заповнених даних.",
    fieldErrors,
  };
}

function ok<TData>(data: TData): MutationResult<TData> {
  return {
    ok: true,
    data,
  };
}

async function ensureFixedCategory(categoryId: string) {
  const category = await getCategoryById(categoryId);

  if (!category || !category.isFixed) {
    return null;
  }

  return category;
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
  const category = await ensureFixedCategory(payload.id);

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

  const updatedCategory = await updateFixedCategory(payload);

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
        type: ["Не можна змінити тип поля, поки воно вже використовується в товарах."],
      },
    };
  }

  if (input.nextType !== SubcategoryFieldType.SELECT) {
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
  const category = await ensureFixedCategory(payload.categoryId);

  if (!category) {
    return {
      ok: false,
      error: "Потрібно вибрати існуючу fixed category для підкатегорії.",
      fieldErrors: {
        categoryId: ["Потрібно вибрати існуючу fixed category."],
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

  const category = await ensureFixedCategory(payload.categoryId);
  if (!category) {
    return {
      ok: false,
      error: "Потрібно вибрати існуючу fixed category для підкатегорії.",
      fieldErrors: {
        categoryId: ["Потрібно вибрати існуючу fixed category."],
      },
    };
  }

  const uniquenessError = await validateSubcategoryUniqueness(payload, payload.id);
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

export async function deleteAdminSubcategory(input: unknown): Promise<
  MutationResult<{
    id: string;
  }>
> {
  const parsed = deleteSubcategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: DeleteSubcategoryInput = parsed.data;
  const subcategory = await getSubcategoryById(payload.id);

  if (!subcategory) {
    return {
      ok: false,
      error: "Підкатегорію не знайдено.",
    };
  }

  if (subcategory._count.products > 0 || subcategory._count.fields > 0) {
    return {
      ok: false,
      error:
        "Не можна видалити підкатегорію, поки до неї прив'язані товари або поля.",
    };
  }

  const deletedSubcategory = await deleteSubcategory(payload.id);

  return ok(deletedSubcategory);
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

async function validateBrandUniqueness(
  payload: CreateBrandInput | UpdateBrandInput,
  currentId?: string,
) {
  const duplicatedName = await getBrandByName(payload.name);
  if (duplicatedName && duplicatedName.id !== currentId) {
    return {
      ok: false as const,
      error: "Бренд з такою назвою вже існує.",
      fieldErrors: {
        name: ["Бренд з такою назвою вже існує."],
      },
    };
  }

  const duplicatedSlug = await getBrandBySlug(payload.slug);
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

  const uniquenessError = await validateBrandUniqueness(payload, payload.id);
  if (uniquenessError) {
    return uniquenessError;
  }

  const updatedBrand = await updateBrand(payload);

  return ok(updatedBrand);
}

export async function deleteAdminBrand(input: unknown): Promise<
  MutationResult<{
    id: string;
  }>
> {
  const parsed = deleteBrandSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: DeleteBrandInput = parsed.data;
  const brand = await getBrandById(payload.id);

  if (!brand) {
    return {
      ok: false,
      error: "Бренд не знайдено.",
    };
  }

  if (brand._count.products > 0) {
    return {
      ok: false,
      error:
        "Не можна видалити бренд, поки до нього прив'язані товари. Спершу відв'яжіть товари або деактивуйте бренд.",
    };
  }

  const deletedBrand = await deleteBrand(payload.id);

  return ok(deletedBrand);
}
