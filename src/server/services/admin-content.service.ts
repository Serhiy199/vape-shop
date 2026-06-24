import type { z } from "zod";
import { Prisma } from "@prisma/client";

import {
  activeStatusSchema,
  blogCategoryMutationSchema,
  blogPostMutationSchema,
  blogTagMutationSchema,
  certificateGroupMutationSchema,
  certificateItemMutationSchema,
  certificateSettingsMutationSchema,
  contactRequestSchema,
  contactRequestStatusSchema,
  contactSettingsMutationSchema,
  contentPageMutationSchema,
  faqItemMutationSchema,
  faqSectionMutationSchema,
  idSchema,
  publicReviewSchema,
  reviewMutationSchema,
  systemPageStatusSchema,
} from "@/features/content/schemas";
import { slugifyText } from "@/lib/text/slug";
import {
  createContactRequest,
  deleteBlogCategory,
  deleteBlogPost,
  deleteBlogTag,
  deleteCertificateGroup,
  deleteCertificateItem,
  deleteContentPage,
  deleteFAQItem,
  deleteFAQSection,
  deleteReview,
  getContentPageById,
  getContentPageBySlug,
  setContactRequestStatus,
  setContentPageActiveStatus,
  setSystemPageActiveStatus,
  updateCertificateSettings,
  updateContactSettings,
  upsertBlogCategory,
  upsertBlogPost,
  upsertBlogTag,
  upsertCertificateGroup,
  upsertCertificateItem,
  upsertContentPage,
  upsertFAQItem,
  upsertFAQSection,
  upsertReview,
} from "@/server/repositories/content.repository";

type MutationSuccess<TData> = {
  data: TData;
  ok: true;
};

type MutationFailure = {
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
  ok: false;
};

export type ContentMutationResult<TData> =
  | MutationSuccess<TData>
  | MutationFailure;

function ok<TData>(data: TData): ContentMutationResult<TData> {
  return { data, ok: true };
}

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    error: "Перевірте коректність заповнених даних.",
    fieldErrors,
    ok: false as const,
  };
}

function mutationError(
  error: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ContentMutationResult<never> {
  return {
    error,
    fieldErrors,
    ok: false,
  };
}

async function safelyMutate<TData>(
  action: () => Promise<TData>,
  uniqueField: string = "slug",
): Promise<ContentMutationResult<TData>> {
  try {
    return ok(await action());
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return mutationError("Запис з таким slug вже існує.", {
          [uniqueField]: ["Такий slug вже використовується."],
        });
      }

      if (error.code === "P2021" || error.code === "P2022") {
        return mutationError(
          "Таблиці CMS ще не застосовані в базі даних. Запустіть Prisma migration для production DB.",
        );
      }
    }

    throw error;
  }
}

async function parseInput<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
) {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      result: validationError(parsed.error.flatten().fieldErrors),
      success: false as const,
    };
  }

  return {
    data: parsed.data as z.infer<TSchema>,
    success: true as const,
  };
}

async function ensureContentPageSlugAvailable(
  slug: string,
  currentId?: string,
) {
  const existing = await getContentPageBySlug(slug);

  return !existing || existing.id === currentId;
}

export async function saveAdminContentPage(input: unknown) {
  const parsed = await parseInput(contentPageMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  if (!(await ensureContentPageSlugAvailable(data.slug, data.id))) {
    return {
      error: "Такий slug вже використовується.",
      fieldErrors: { slug: ["Такий slug вже використовується."] },
      ok: false as const,
    };
  }

  return ok(await upsertContentPage(data));
}

export async function removeAdminContentPage(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  const existing = await getContentPageById(data.id);

  if (!existing) {
    return { error: "Сторінку не знайдено.", ok: false as const };
  }

  return ok(await deleteContentPage(data.id));
}

export async function toggleAdminContentPage(input: unknown) {
  const parsed = await parseInput(activeStatusSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await setContentPageActiveStatus(data.id, data.isActive));
}

export async function toggleAdminSystemPage(input: unknown) {
  const parsed = await parseInput(systemPageStatusSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return safelyMutate(() => setSystemPageActiveStatus(data.key, data.isActive));
}

export async function saveAdminContactSettings(input: unknown) {
  const parsed = await parseInput(contactSettingsMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await updateContactSettings(data));
}

export async function savePublicContactRequest(input: unknown) {
  const parsed = await parseInput(contactRequestSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  if (data.website) {
    return ok({ skipped: true });
  }

  return ok(await createContactRequest(data));
}

export async function changeContactRequestStatus(input: unknown) {
  const parsed = await parseInput(contactRequestStatusSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await setContactRequestStatus(data.id, data.status));
}

export async function saveBlogCategory(input: unknown) {
  const parsed = await parseInput(blogCategoryMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  const slug = data.slug || slugifyText(data.name);

  return safelyMutate(() => upsertBlogCategory({ ...data, slug }));
}

export async function saveBlogTag(input: unknown) {
  const parsed = await parseInput(blogTagMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  const slug = data.slug || slugifyText(data.name);

  return safelyMutate(() => upsertBlogTag({ ...data, slug }));
}

export async function saveBlogPost(input: unknown) {
  const parsed = await parseInput(blogPostMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return safelyMutate(() => upsertBlogPost(data));
}

export async function removeBlogCategory(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteBlogCategory(data.id));
}

export async function removeBlogTag(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteBlogTag(data.id));
}

export async function removeBlogPost(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteBlogPost(data.id));
}

export async function saveFAQSection(input: unknown) {
  const parsed = await parseInput(faqSectionMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  const slug = data.slug || slugifyText(data.title);

  return safelyMutate(() => upsertFAQSection({ ...data, slug }));
}

export async function saveFAQItem(input: unknown) {
  const parsed = await parseInput(faqItemMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await upsertFAQItem(data));
}

export async function removeFAQSection(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteFAQSection(data.id));
}

export async function removeFAQItem(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteFAQItem(data.id));
}

export async function saveAdminReview(input: unknown) {
  const parsed = await parseInput(reviewMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await upsertReview(data));
}

export async function savePublicReview(input: unknown) {
  const parsed = await parseInput(publicReviewSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(
    await upsertReview({
      ...data,
      isActive: true,
      isApproved: false,
    }),
  );
}

export async function removeReview(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteReview(data.id));
}

export async function saveCertificateSettings(input: unknown) {
  const parsed = await parseInput(certificateSettingsMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await updateCertificateSettings(data));
}

export async function saveCertificateGroup(input: unknown) {
  const parsed = await parseInput(certificateGroupMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  const slug = data.slug || slugifyText(data.name);

  return safelyMutate(() => upsertCertificateGroup({ ...data, slug }));
}

export async function saveCertificateItem(input: unknown) {
  const parsed = await parseInput(certificateItemMutationSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await upsertCertificateItem(data));
}

export async function removeCertificateGroup(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteCertificateGroup(data.id));
}

export async function removeCertificateItem(input: unknown) {
  const parsed = await parseInput(idSchema, input);

  if (!parsed.success) {
    return parsed.result;
  }
  const data = parsed.data;

  return ok(await deleteCertificateItem(data.id));
}
