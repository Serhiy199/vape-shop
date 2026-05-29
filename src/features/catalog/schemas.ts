import { ProductAvailability, SubcategoryFieldType } from "@prisma/client";
import { z } from "zod";

function optionalTrimmedString(max: number) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .pipe(z.string().max(max).optional());
}

function optionalTrimmedLongText() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .pipe(z.string().optional());
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

function slugify(value: string) {
  const transliterationMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ю: "iu",
    я: "ia",
  };

  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => transliterationMap[char] ?? char)
    .join("")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function slugFromNameSchema() {
  return z
    .object({
      name: requiredName(120),
      slug: z.string().trim().max(120).optional(),
    })
    .transform((value) => ({
      ...value,
      slug:
        value.slug && value.slug.length > 0 ? value.slug : slugify(value.name),
    }))
    .pipe(
      z.object({
        name: requiredName(120),
        slug: slugField(),
      }),
    );
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

function availabilityField() {
  return z.nativeEnum(ProductAvailability);
}

function optionalIdField() {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(191).optional());
}

function optionalTextField(max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(max).optional());
}

function optionalImageField() {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    },
    z
      .string()
      .max(2048)
      .refine(
        (value) => /^https?:\/\//.test(value),
        "Image має бути коректним http/https URL.",
      )
      .nullable()
      .optional(),
  );
}

function priceField() {
  return z
    .union([z.number(), z.string()])
    .transform((value) => {
      if (typeof value === "number") {
        return value;
      }

      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return value;
      }

      const normalized = trimmed.replace(",", ".");
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : value;
    })
    .pipe(
      z
        .number({
          invalid_type_error: "Ціна має бути числом.",
        })
        .min(0, "Ціна не може бути меншою за 0.")
        .max(999999.99, "Ціна перевищує дозволений ліміт.")
        .refine(
          (value) => Number.isInteger(value * 100),
          "Ціна може містити не більше 2 знаків після коми.",
        ),
    );
}

const subcategoryFieldOptionSchema = z.object({
  label: requiredName(120),
  value: z.string().trim().min(1).max(120),
  sortOrder: sortOrderField(),
});

const productFieldValueSchema = z.object({
  fieldId: idField(),
  optionId: optionalIdField(),
  valueJson: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  valueBoolean: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => {
      if (typeof value === "boolean" || value === undefined) {
        return value;
      }

      const normalized = value.trim().toLowerCase();
      if (normalized === "true") {
        return true;
      }

      if (normalized === "false") {
        return false;
      }

      return value;
    })
    .pipe(z.union([z.boolean(), z.string(), z.undefined()])),
  valueNumber: z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (typeof value === "number" || value === undefined) {
        return value;
      }

      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return undefined;
      }

      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : value;
    })
    .pipe(z.union([z.number(), z.string(), z.undefined()])),
  valueText: optionalTextField(2000),
});

const productFieldValuesSchema = z
  .array(productFieldValueSchema)
  .superRefine((values, ctx) => {
    const seenFieldIds = new Set<string>();

    values.forEach((value, index) => {
      if (seenFieldIds.has(value.fieldId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Одне поле товару не можна передавати більше одного разу.",
          path: [index, "fieldId"],
        });
        return;
      }

      seenFieldIds.add(value.fieldId);
    });
  });

const productImageSchema = z.object({
  id: optionalIdField(),
  url: z.string().trim().url().max(2048),
  publicId: requiredName(255),
  alt: optionalTrimmedString(160),
  sortOrder: sortOrderField(),
  isPrimary: z.coerce.boolean().default(false),
});

const productOptionValueSchema = z.object({
  id: optionalIdField(),
  label: requiredName(120),
  slug: z.string().trim().max(160).optional(),
  titleOverride: optionalTrimmedString(160),
  seoTitle: optionalTrimmedString(160),
  seoDescription: optionalTrimmedString(320),
  image: z.string().trim().url().max(2048),
  imagePublicId: optionalTrimmedString(255),
  sortOrder: sortOrderField(),
});

const productOptionSchema = z.object({
  id: optionalIdField(),
  name: requiredName(80),
  values: z
    .array(productOptionValueSchema)
    .min(1, "Потрібно додати хоча б одне значення опції товару.")
    .max(100, "Опція товару може містити максимум 100 значень."),
});

const productImagesSchema = z
  .array(productImageSchema)
  .superRefine((images, ctx) => {
    const primaryImages = images.filter((image) => image.isPrimary);
    const galleryImagesCount = images.filter(
      (image) => !image.isPrimary,
    ).length;

    if (images.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Потрібно додати головне фото товару.",
        path: [],
      });
    }

    if (primaryImages.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Товар повинен мати рівно одне головне фото.",
        path: [],
      });
    }

    if (galleryImagesCount > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "У галереї може бути не більше 10 фото.",
        path: [],
      });
    }

    if (images.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Товар може містити максимум 11 фото разом із головним.",
        path: [],
      });
    }

    const seenPublicIds = new Set<string>();

    images.forEach((image, index) => {
      const normalizedPublicId = image.publicId.trim().toLowerCase();

      if (seenPublicIds.has(normalizedPublicId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Одне й те саме зображення не можна додавати двічі.",
          path: [index, "publicId"],
        });
        return;
      }

      seenPublicIds.add(normalizedPublicId);
    });
  });

const subcategoryFieldBaseSchema = z.object({
  subcategoryId: idField(),
  label: requiredName(120),
  key: fieldKey(),
  type: fieldType(),
  isRequired: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  sortOrder: sortOrderField(),
  options: z.array(subcategoryFieldOptionSchema).default([]),
});

function isOptionBackedFieldType(value: SubcategoryFieldType) {
  return (
    value === SubcategoryFieldType.SELECT ||
    value === SubcategoryFieldType.MULTI_SELECT
  );
}

function validateFieldOptions(
  value: z.input<typeof subcategoryFieldBaseSchema>,
  ctx: z.RefinementCtx,
) {
  const options = value.options ?? [];

  if (isOptionBackedFieldType(value.type)) {
    if (options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Для поля типу SELECT або MULTI_SELECT потрібно додати хоча б одну опцію.",
        path: ["options"],
      });
    }
  } else if (options.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Опції дозволені лише для полів типу SELECT або MULTI_SELECT.",
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

const categoryBaseSchema = z.intersection(
  slugFromNameSchema(),
  z.object({
    image: optionalImageField(),
    description: optionalTrimmedLongText(),
    sortOrder: sortOrderField(),
    isActive: z.coerce.boolean().default(true),
    seoTitle: optionalTrimmedString(160),
    seoDescription: optionalTrimmedString(320),
  }),
);

export const createCategorySchema = categoryBaseSchema;

export const updateCategorySchema = categoryBaseSchema.and(
  z.object({
    id: idField(),
  }),
);

const subcategoryBaseSchema = z.intersection(
  slugFromNameSchema(),
  z.object({
    categoryId: idField(),
    description: optionalTrimmedLongText(),
    sortOrder: sortOrderField(),
    isActive: z.coerce.boolean().default(true),
    seoTitle: optionalTrimmedString(160),
    seoDescription: optionalTrimmedString(320),
  }),
);

export const createSubcategorySchema = subcategoryBaseSchema;

export const updateSubcategorySchema = subcategoryBaseSchema.and(
  z.object({
    id: idField(),
  }),
);

export const createBrandSchema = z.intersection(
  slugFromNameSchema(),
  z.object({
    subcategoryId: idField(),
    description: optionalTrimmedLongText(),
    isActive: z.coerce.boolean().default(true),
    seoTitle: optionalTrimmedString(160),
    seoDescription: optionalTrimmedString(320),
  }),
);

export const updateBrandSchema = createBrandSchema.and(
  z.object({
    id: idField(),
  }),
);

export const deleteBrandSchema = z.object({
  id: idField(),
});

export const createSubcategoryFieldSchema =
  subcategoryFieldBaseSchema.superRefine(validateFieldOptions);

export const updateSubcategoryFieldSchema = subcategoryFieldBaseSchema
  .extend({
    id: idField(),
  })
  .superRefine(validateFieldOptions);

export const deleteSubcategoryFieldSchema = z.object({
  id: idField(),
});

export const validateProductFieldValuesSchema = z.object({
  categoryId: idField(),
  subcategoryId: idField(),
  fieldValues: productFieldValuesSchema.default([]),
});

const productBaseSchema = z.object({
  categoryId: idField(),
  subcategoryId: idField(),
  brandId: optionalIdField(),
  title: requiredName(160),
  slug: slugField(),
  description: optionalTrimmedString(5000),
  price: priceField(),
  availability: availabilityField().default(ProductAvailability.IN_STOCK),
  isActive: z.coerce.boolean().default(true),
  isFeaturedNew: z.coerce.boolean().default(false),
  isFeaturedSale: z.coerce.boolean().default(false),
  isFeaturedHit: z.coerce.boolean().default(false),
  isFeaturedDiscount: z.coerce.boolean().default(false),
  seoTitle: optionalTrimmedString(160),
  seoDescription: optionalTrimmedString(320),
  images: productImagesSchema,
  fieldValues: productFieldValuesSchema.default([]),
  option: productOptionSchema
    .nullable()
    .optional()
    .transform((value) => value ?? undefined),
});

export const createProductSchema = productBaseSchema;

export const updateProductSchema = productBaseSchema.extend({
  id: idField(),
});

export const deleteProductSchema = z.object({
  id: idField(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
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
export type ProductFieldValueInput = z.infer<typeof productFieldValueSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductOptionInput = z.infer<typeof productOptionSchema>;
export type ProductOptionValueInput = z.infer<typeof productOptionValueSchema>;
export type ValidateProductFieldValuesInput = z.infer<
  typeof validateProductFieldValuesSchema
>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
