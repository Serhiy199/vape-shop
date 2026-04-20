import {
  createBrandSchema,
  createSubcategorySchema,
  deleteBrandSchema,
  deleteSubcategorySchema,
  updateBrandSchema,
  updateCategorySchema,
  updateSubcategorySchema,
  type CreateBrandInput,
  type CreateSubcategoryInput,
  type DeleteBrandInput,
  type DeleteSubcategoryInput,
  type UpdateBrandInput,
  type UpdateCategoryInput,
  type UpdateSubcategoryInput,
} from "@/features/catalog/schemas";
import {
  createBrand,
  createSubcategory,
  deleteBrand,
  deleteSubcategory,
  getBrandById,
  getBrandByName,
  getBrandBySlug,
  getCategoryById,
  getCategoryByName,
  getCategoryBySlug,
  getSubcategoryById,
  getSubcategoryByScopedName,
  getSubcategoryByScopedSlug,
  updateBrand,
  updateFixedCategory,
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
