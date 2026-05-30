import { z } from "zod";

function idField() {
  return z.string().trim().min(1).max(191);
}

function requiredText(max: number) {
  return z.string().trim().min(1).max(max);
}

function urlField(label: string) {
  return z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .refine((value) => {
      if (value.startsWith("/")) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, `${label} must be an internal path or http/https URL.`);
}

function imageUrlField() {
  return z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .url("Image URL must be a valid URL.");
}

function sortOrderField() {
  return z.coerce.number().int().min(0).max(9999);
}

export const bannerBaseSchema = z.object({
  title: requiredText(160),
  imageUrl: imageUrlField(),
  targetUrl: urlField("Target URL"),
  isActive: z.coerce.boolean().default(true),
  sortOrder: sortOrderField(),
});

export const createBannerSchema = bannerBaseSchema;

export const updateBannerSchema = bannerBaseSchema.extend({
  id: idField(),
});

export const deleteBannerSchema = z.object({
  id: idField(),
});

export const bannerActiveStatusSchema = z.object({
  id: idField(),
  isActive: z.coerce.boolean(),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type DeleteBannerInput = z.infer<typeof deleteBannerSchema>;
export type BannerActiveStatusInput = z.infer<typeof bannerActiveStatusSchema>;
