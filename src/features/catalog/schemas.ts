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

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
export type DeleteSubcategoryInput = z.infer<typeof deleteSubcategorySchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type DeleteBrandInput = z.infer<typeof deleteBrandSchema>;
