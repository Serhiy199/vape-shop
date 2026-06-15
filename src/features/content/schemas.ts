import {
  BlogPostStatus,
  ContactRequestStatus,
  ReviewType,
} from "@prisma/client";
import { z } from "zod";

import { slugifyText } from "@/lib/text/slug";

export const reservedContentSlugs = new Set([
  "admin",
  "api",
  "product",
  "category",
  "cart",
  "checkout",
  "account",
  "blog",
  "faq",
  "reviews",
  "certificates",
  "contacts",
  "brands",
  "search",
  "wishlist",
  "orders",
  "login",
  "register",
]);

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const htmlString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug обов'язковий")
  .transform((value) => slugifyText(value))
  .refine((value) => value.length > 0, "Slug обов'язковий");

const optionalSlugSchema = optionalString.transform((value) =>
  value ? slugifyText(value) : undefined,
);

export const contentPageSlugSchema = slugSchema.refine(
  (value) => !reservedContentSlugs.has(value),
  "Цей slug зарезервований системним маршрутом.",
);

export const contentPageMutationSchema = z.object({
  id: optionalString,
  title: z.string().trim().min(1, "Назва обов'язкова"),
  slug: contentPageSlugSchema,
  excerpt: optionalString,
  contentHtml: htmlString,
  heroImage: optionalString,
  heroImagePublicId: optionalString,
  seoTitle: optionalString,
  seoDescription: optionalString,
  seoImage: optionalString,
  seoImagePublicId: optionalString,
  isActive: z.boolean().default(true),
  showInHeader: z.boolean().default(false),
  showInFooter: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const idSchema = z.object({
  id: z.string().trim().min(1, "ID обов'язковий"),
});

export const activeStatusSchema = idSchema.extend({
  isActive: z.boolean(),
});

export const contactSettingsMutationSchema = z.object({
  id: optionalString,
  title: z.string().trim().min(1, "Заголовок обов'язковий"),
  subtitle: optionalString,
  workSchedule: optionalString,
  phone: optionalString,
  email: optionalString,
  address: optionalString,
  telegramUrl: optionalString,
  viberUrl: optionalString,
  instagramUrl: optionalString,
  youtubeUrl: optionalString,
  facebookUrl: optionalString,
  tiktokUrl: optionalString,
  formTitle: optionalString,
  formEnabled: z.boolean().default(true),
  formRecipientEmail: optionalString,
  mapEmbedUrl: optionalString,
  mapIframeHtml: htmlString,
  additionalContentHtml: htmlString,
  seoTitle: optionalString,
  seoDescription: optionalString,
});

export const contactRequestSchema = z.object({
  firstName: z.string().trim().min(1, "Ім'я обов'язкове"),
  lastName: optionalString,
  email: optionalString,
  phone: optionalString,
  comment: z.string().trim().min(5, "Коментар обов'язковий"),
  website: optionalString,
});

export const contactRequestStatusSchema = idSchema.extend({
  status: z.nativeEnum(ContactRequestStatus),
});

export const blogCategoryMutationSchema = z.object({
  id: optionalString,
  name: z.string().trim().min(1, "Назва обов'язкова"),
  slug: optionalSlugSchema,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const blogTagMutationSchema = z.object({
  id: optionalString,
  name: z.string().trim().min(1, "Назва обов'язкова"),
  slug: slugSchema,
  isActive: z.boolean().default(true),
});

export const blogPostMutationSchema = z.object({
  id: optionalString,
  title: z.string().trim().min(1, "Назва обов'язкова"),
  slug: slugSchema,
  excerpt: optionalString,
  coverImage: optionalString,
  coverImagePublicId: optionalString,
  contentHtml: htmlString,
  authorName: optionalString,
  readingTime: z.coerce.number().int().min(0).optional().catch(undefined),
  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),
  publishedAt: optionalString,
  categoryId: optionalString,
  tagIds: z.array(z.string()).default([]),
  seoTitle: optionalString,
  seoDescription: optionalString,
  seoImage: optionalString,
  seoImagePublicId: optionalString,
});

export const faqSectionMutationSchema = z.object({
  id: optionalString,
  title: z.string().trim().min(1, "Назва обов'язкова"),
  slug: optionalSlugSchema,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const faqItemMutationSchema = z.object({
  id: optionalString,
  sectionId: z.string().trim().min(1, "Розділ обов'язковий"),
  question: z.string().trim().min(1, "Питання обов'язкове"),
  answerHtml: htmlString,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const reviewMutationSchema = z.object({
  id: optionalString,
  type: z.nativeEnum(ReviewType).default(ReviewType.STORE),
  productId: optionalString,
  name: z.string().trim().min(1, "Ім'я обов'язкове"),
  initials: optionalString,
  avatar: optionalString,
  avatarPublicId: optionalString,
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(3, "Текст відгуку обов'язковий"),
  isApproved: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const publicReviewSchema = reviewMutationSchema.omit({
  id: true,
  isApproved: true,
  isActive: true,
});

export const certificateSettingsMutationSchema = z.object({
  id: optionalString,
  title: z.string().trim().min(1, "Заголовок обов'язковий"),
  slug: slugSchema.default("certificates"),
  introHtml: htmlString,
  seoTitle: optionalString,
  seoDescription: optionalString,
});

export const certificateGroupMutationSchema = z.object({
  id: optionalString,
  name: z.string().trim().min(1, "Назва обов'язкова"),
  slug: optionalSlugSchema,
  descriptionHtml: htmlString,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const certificateItemMutationSchema = z.object({
  id: optionalString,
  groupId: z.string().trim().min(1, "Група обов'язкова"),
  title: z.string().trim().min(1, "Назва обов'язкова"),
  previewImage: optionalString,
  previewImagePublicId: optionalString,
  fileUrl: optionalString,
  filePublicId: optionalString,
  fileType: optionalString,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ContentPageMutationInput = z.infer<
  typeof contentPageMutationSchema
>;
export type ContactSettingsMutationInput = z.infer<
  typeof contactSettingsMutationSchema
>;
export type BlogPostMutationInput = z.infer<typeof blogPostMutationSchema>;
export type FAQItemMutationInput = z.infer<typeof faqItemMutationSchema>;
export type ReviewMutationInput = z.infer<typeof reviewMutationSchema>;
export type CertificateItemMutationInput = z.infer<
  typeof certificateItemMutationSchema
>;
