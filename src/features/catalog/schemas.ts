import { SubcategoryFieldType } from "@prisma/client";
import { z } from "zod";

function optionalTrimmedString(max: number) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .pipe(z.string().max(max).optional());
}

function requiredName(max: number) {
  return z.string().trim().min(1).max(max);
}

function slugField() {
  return z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug може містити лише латиницю в нижньому регістрі, цифри та дефіси.",
    });
}

function sortOrderField() {
  return z.coerce.number().int().min(0).max(9999);
}

function idField() {
  return z.string().trim().min(1).max(191);
}

function fieldKey() {
  return z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/, {
      message:
        "Ключ поля може містити лише латиницю в нижньому регістрі, цифри та `_`, і має починатися з літери.",
    });
}

function fieldType() {
  return z.nativeEnum(SubcategoryFieldType);
}

const subcategoryFieldOptionSchema = z.object({
  label: requiredName(120),
  value: z.string().trim().min(1).max(120),
  sortOrder: sortOrderField(),
});

const subcategoryFieldBaseSchema = z.object({
  subcategoryId: idField(),
  label: requiredName(120),
  key: fieldKey(),
  type: fieldType(),
  isRequired: z.coerce.boolean().default(false),
  sortOrder: sortOrderField(),
  options: z.array(subcategoryFieldOptionSchema).default([]),
});

function validateFieldOptions(
  value: z.input<typeof subcategoryFieldBaseSchema>,
  ctx: z.RefinementCtx,
) {
  const options = value.options ?? [];

  if (value.type === SubcategoryFieldType.SELECT) {
    if (options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Для поля типу SELECT потрібно додати хоча б одну опцію.",
        path: ["options"],
      });
    }
  } else if (options.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Опції дозволені лише для поля типу SELECT.",
      path: ["options"],
    });
  }

  const seenValues = new Set<string>();

  options.forEach((option, index) => {
    const normalizedValue = option.value.trim().toLowerCase();

    if (seenValues.has(normalizedValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Значення опції має бути унікальним в межах одного поля.",
        path: ["options", index, "value"],
      });
      return;
    }

    seenValues.add(normalizedValue);
  });
}

export const updateCategorySchema = z.object({
  id: idField(),
  name: requiredName(120),
  slug: slugField(),
  sortOrder: sortOrderField(),
  seoTitle: optionalTrimmedString(160),
  seoDescription: optionalTrimmedString(320),
});

export const createSubcategorySchema = z.object({
  categoryId: idField(),
  name: requiredName(120),
  slug: slugField(),
  description: optionalTrimmedString(500),
  sortOrder: sortOrderField(),
  isActive: z.coerce.boolean().default(true),
  seoTitle: optionalTrimmedString(160),
  seoDescription: optionalTrimmedString(320),
});

export const updateSubcategorySchema = createSubcategorySchema.extend({
  id: idField(),
});

export const deleteSubcategorySchema = z.object({
  id: idField(),
});

export const createBrandSchema = z.object({
  name: requiredName(120),
  slug: slugField(),
  description: optionalTrimmedString(500),
  sortOrder: sortOrderField(),
  isActive: z.coerce.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.extend({
  id: idField(),
});

export const deleteBrandSchema = z.object({
  id: idField(),
});

export const createSubcategoryFieldSchema = subcategoryFieldBaseSchema.superRefine(
  validateFieldOptions,
);

export const updateSubcategoryFieldSchema =
  subcategoryFieldBaseSchema.extend({
    id: idField(),
  }).superRefine(validateFieldOptions);

export const deleteSubcategoryFieldSchema = z.object({
  id: idField(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
export type DeleteSubcategoryInput = z.infer<typeof deleteSubcategorySchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type DeleteBrandInput = z.infer<typeof deleteBrandSchema>;
export type SubcategoryFieldOptionInput = z.infer<
  typeof subcategoryFieldOptionSchema
>;
export type CreateSubcategoryFieldInput = z.infer<
  typeof createSubcategoryFieldSchema
>;
export type UpdateSubcategoryFieldInput = z.infer<
  typeof updateSubcategoryFieldSchema
>;
export type DeleteSubcategoryFieldInput = z.infer<
  typeof deleteSubcategoryFieldSchema
>;
