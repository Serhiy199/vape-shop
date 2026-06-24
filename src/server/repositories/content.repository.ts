import type {
  ContactRequestStatus,
  Prisma,
  ReviewType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import type {
  BlogPostMutationInput,
  CertificateItemMutationInput,
  ContactSettingsMutationInput,
  ContentPageMutationInput,
  FAQItemMutationInput,
  ReviewMutationInput,
} from "@/features/content/schemas";

function isMissingTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

async function withMissingTableFallback<TData>(
  action: () => Promise<TData>,
  fallback: TData,
) {
  try {
    return await action();
  } catch (error) {
    if (isMissingTableError(error)) {
      return fallback;
    }

    throw error;
  }
}

const fallbackContactSettings = {
  additionalContentHtml: null,
  additionalContentJson: null,
  address: "Доставка по Україні",
  createdAt: new Date(0),
  email: "support@voodoovape.local",
  facebookUrl: null,
  formEnabled: true,
  formRecipientEmail: null,
  formTitle: "Напишіть нам",
  id: "fallback-contact-settings",
  instagramUrl: null,
  mapEmbedUrl: null,
  mapIframeHtml: null,
  phone: "+38 (080) 033-50-94",
  seoDescription: "Контакти магазину Voodoo Vape.",
  seoTitle: "Контакти | Voodoo Vape",
  subtitle:
    "Наш графік роботи: Пн-Нд: 10:00-20:00. Телефонуйте! Будемо раді допомогти.",
  telegramUrl: null,
  tiktokUrl: null,
  title: "Контакти",
  updatedAt: new Date(0),
  viberUrl: null,
  workSchedule: "Пн-Нд: 10:00-20:00",
  youtubeUrl: null,
};

const fallbackCertificateSettings = {
  createdAt: new Date(0),
  id: "fallback-certificate-settings",
  introHtml: null,
  introJson: null,
  seoDescription: null,
  seoTitle: null,
  slug: "certificates",
  title: "Сертифікати відповідності",
  updatedAt: new Date(0),
};

export const systemPageDefinitions = [
  { href: "/contacts", key: "contacts", sortOrder: 100, title: "Контакти" },
  { href: "/blog", key: "blog", sortOrder: 110, title: "Блог" },
  { href: "/faq", key: "faq", sortOrder: 120, title: "FAQ" },
  { href: "/reviews", key: "reviews", sortOrder: 130, title: "Відгуки" },
  {
    href: "/certificates",
    key: "certificates",
    sortOrder: 140,
    title: "Сертифікати",
  },
] as const;

export type SystemPageKey = (typeof systemPageDefinitions)[number]["key"];

const fallbackSystemPageSettings = systemPageDefinitions.map((page) => ({
  createdAt: new Date(0),
  id: `fallback-system-page-${page.key}`,
  isActive: true,
  key: page.key,
  sortOrder: page.sortOrder,
  title: page.title,
  updatedAt: new Date(0),
}));

let systemPageSettingsTableExists: boolean | null = null;

function resolveSystemPageDefinition(key: string) {
  return systemPageDefinitions.find((page) => page.key === key);
}

async function hasSystemPageSettingsTable() {
  if (systemPageSettingsTableExists !== null) {
    return systemPageSettingsTableExists;
  }

  const result = await prisma.$queryRaw<Array<{ exists: string | null }>>`
    SELECT to_regclass('"SystemPageSettings"')::text AS "exists"
  `;

  systemPageSettingsTableExists = Boolean(result[0]?.exists);

  return systemPageSettingsTableExists;
}

export async function listAdminContentPages(search?: string) {
  return withMissingTableFallback(
    () =>
      prisma.contentPage.findMany({
        where: search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getContentPageById(id: string) {
  return prisma.contentPage.findUnique({ where: { id } });
}

export async function getContentPageBySlug(slug: string) {
  return withMissingTableFallback(
    () => prisma.contentPage.findUnique({ where: { slug } }),
    null,
  );
}

export async function getActiveContentPageBySlug(slug: string) {
  return withMissingTableFallback(
    () =>
      prisma.contentPage.findFirst({
        where: { slug, isActive: true },
      }),
    null,
  );
}

export async function upsertContentPage(input: ContentPageMutationInput) {
  const data = {
    contentHtml: input.contentHtml,
    excerpt: input.excerpt,
    heroImage: input.heroImage,
    heroImagePublicId: input.heroImagePublicId,
    isActive: input.isActive,
    seoDescription: input.seoDescription,
    seoImage: input.seoImage,
    seoImagePublicId: input.seoImagePublicId,
    seoTitle: input.seoTitle,
    showInFooter: input.showInFooter,
    showInHeader: input.showInHeader,
    slug: input.slug,
    sortOrder: input.sortOrder,
    title: input.title,
  } satisfies Prisma.ContentPageUncheckedCreateInput;

  if (input.id) {
    return prisma.contentPage.update({
      where: { id: input.id },
      data,
    });
  }

  return prisma.contentPage.create({ data });
}

export async function deleteContentPage(id: string) {
  return prisma.contentPage.delete({ where: { id } });
}

export async function setContentPageActiveStatus(id: string, isActive: boolean) {
  return prisma.contentPage.update({
    where: { id },
    data: { isActive },
  });
}

export async function listFooterContentPages() {
  return withMissingTableFallback(
    () =>
      prisma.contentPage.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: { createdAt: true, id: true, slug: true, title: true },
      }),
    [],
  );
}

export async function listSystemPageSettings() {
  if (!(await hasSystemPageSettingsTable())) {
    return fallbackSystemPageSettings;
  }

  return withMissingTableFallback(
    async () => {
      const settings = await prisma.systemPageSettings.findMany({
        orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
      });

      const existingKeys = new Set(settings.map((item) => item.key));
      const missingDefaults = systemPageDefinitions.filter(
        (page) => !existingKeys.has(page.key),
      );

      if (missingDefaults.length === 0) {
        return settings;
      }

      const created = await Promise.all(
        missingDefaults.map((page) =>
          prisma.systemPageSettings.create({
            data: {
              isActive: true,
              key: page.key,
              sortOrder: page.sortOrder,
              title: page.title,
            },
          }),
        ),
      );

      return [...settings, ...created].sort(
        (first, second) =>
          first.sortOrder - second.sortOrder ||
          first.key.localeCompare(second.key),
      );
    },
    fallbackSystemPageSettings,
  );
}

export async function listActiveSystemPageLinks() {
  const settings = await listSystemPageSettings();

  return settings
    .filter((page) => page.isActive)
    .map((page) => {
      const definition = resolveSystemPageDefinition(page.key);

      return {
        href: definition?.href ?? `/${page.key}`,
        key: page.key,
        label: page.title,
        sortOrder: page.sortOrder,
      };
    });
}

export async function getSystemPageSettings(key: SystemPageKey) {
  const pages = await listSystemPageSettings();

  return pages.find((page) => page.key === key) ?? null;
}

export async function isSystemPageActive(key: SystemPageKey) {
  const page = await getSystemPageSettings(key);

  return page?.isActive ?? true;
}

export async function setSystemPageActiveStatus(
  key: SystemPageKey,
  isActive: boolean,
) {
  const definition = resolveSystemPageDefinition(key);

  return prisma.systemPageSettings.upsert({
    where: { key },
    update: { isActive },
    create: {
      isActive,
      key,
      sortOrder: definition?.sortOrder ?? 0,
      title: definition?.title ?? key,
    },
  });
}

export async function listHeaderContentPages() {
  return withMissingTableFallback(
    () =>
      prisma.contentPage.findMany({
        where: { isActive: true, showInHeader: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: { slug: true, title: true },
      }),
    [],
  );
}

export async function ensureContactSettings() {
  return withMissingTableFallback(async () => {
    const settings = await prisma.contactPageSettings.findFirst();

    if (settings) {
      return settings;
    }

    return prisma.contactPageSettings.create({
      data: {
        title: "Контакти",
        subtitle:
          "Наш графік роботи: Пн-Нд: 10:00-20:00. Телефонуйте! Будемо раді допомогти.",
        formEnabled: true,
      },
    });
  }, fallbackContactSettings);
}

export async function updateContactSettings(
  input: ContactSettingsMutationInput,
) {
  const existing = input.id
    ? await prisma.contactPageSettings.findUnique({ where: { id: input.id } })
    : await prisma.contactPageSettings.findFirst();

  const data = {
    additionalContentHtml: input.additionalContentHtml,
    address: input.address,
    email: input.email,
    facebookUrl: input.facebookUrl,
    formEnabled: input.formEnabled,
    formRecipientEmail: input.formRecipientEmail,
    formTitle: input.formTitle,
    instagramUrl: input.instagramUrl,
    mapEmbedUrl: input.mapEmbedUrl,
    mapIframeHtml: input.mapIframeHtml,
    phone: input.phone,
    seoDescription: input.seoDescription,
    seoTitle: input.seoTitle,
    subtitle: input.subtitle,
    telegramUrl: input.telegramUrl,
    tiktokUrl: input.tiktokUrl,
    title: input.title,
    viberUrl: input.viberUrl,
    workSchedule: input.workSchedule,
    youtubeUrl: input.youtubeUrl,
  } satisfies Prisma.ContactPageSettingsUncheckedUpdateInput;

  if (existing) {
    return prisma.contactPageSettings.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.contactPageSettings.create({
    data: data as Prisma.ContactPageSettingsUncheckedCreateInput,
  });
}

export async function createContactRequest(input: {
  comment: string;
  email?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}) {
  return prisma.contactRequest.create({
    data: input,
  });
}

export async function listContactRequests() {
  return withMissingTableFallback(
    () =>
      prisma.contactRequest.findMany({
        orderBy: { createdAt: "desc" },
      }),
    [],
  );
}

export async function setContactRequestStatus(
  id: string,
  status: ContactRequestStatus,
) {
  return prisma.contactRequest.update({
    where: { id },
    data: { status },
  });
}

export async function listBlogCategories() {
  return withMissingTableFallback(
    () =>
      prisma.blogCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    [],
  );
}

export async function upsertBlogCategory(input: {
  id?: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
}) {
  const data = {
    isActive: input.isActive,
    name: input.name,
    slug: input.slug,
    sortOrder: input.sortOrder,
  };

  return input.id
    ? prisma.blogCategory.update({ where: { id: input.id }, data })
    : prisma.blogCategory.create({ data });
}

export async function deleteBlogCategory(id: string) {
  return prisma.blogCategory.delete({ where: { id } });
}

export async function listBlogTags() {
  return withMissingTableFallback(
    () =>
      prisma.blogTag.findMany({
        orderBy: { name: "asc" },
      }),
    [],
  );
}

export async function upsertBlogTag(input: {
  id?: string;
  isActive: boolean;
  name: string;
  slug: string;
}) {
  const data = {
    isActive: input.isActive,
    name: input.name,
    slug: input.slug,
  };

  return input.id
    ? prisma.blogTag.update({ where: { id: input.id }, data })
    : prisma.blogTag.create({ data });
}

export async function deleteBlogTag(id: string) {
  return prisma.blogTag.delete({ where: { id } });
}

export async function listAdminBlogPosts() {
  return withMissingTableFallback(
    () =>
      prisma.blogPost.findMany({
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: [{ updatedAt: "desc" }],
      }),
    [],
  );
}

export async function listPublishedBlogPosts(filters?: {
  categorySlug?: string;
  tagSlug?: string;
}) {
  return withMissingTableFallback(
    () =>
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { not: null },
          category: filters?.categorySlug
            ? { slug: filters.categorySlug }
            : undefined,
          tags: filters?.tagSlug
            ? { some: { tag: { slug: filters.tagSlug, isActive: true } } }
            : undefined,
        },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getPublishedBlogPost(slug: string) {
  return withMissingTableFallback(
    () =>
      prisma.blogPost.findFirst({
        where: {
          slug,
          status: "PUBLISHED",
          publishedAt: { not: null },
        },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      }),
    null,
  );
}

export async function incrementBlogPostViews(id: string) {
  return prisma.blogPost.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
  });
}

export async function upsertBlogPost(input: BlogPostMutationInput) {
  const publishedAt =
    input.status === "PUBLISHED"
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : new Date()
      : null;
  const data = {
    authorName: input.authorName,
    categoryId: input.categoryId,
    contentHtml: input.contentHtml,
    coverImage: input.coverImage,
    coverImagePublicId: input.coverImagePublicId,
    excerpt: input.excerpt,
    publishedAt,
    readingTime: input.readingTime,
    seoDescription: input.seoDescription,
    seoImage: input.seoImage,
    seoImagePublicId: input.seoImagePublicId,
    seoTitle: input.seoTitle,
    slug: input.slug,
    status: input.status,
    title: input.title,
  };

  return prisma.$transaction(async (tx) => {
    const post = input.id
      ? await tx.blogPost.update({ where: { id: input.id }, data })
      : await tx.blogPost.create({ data });

    await tx.blogPostTag.deleteMany({ where: { postId: post.id } });

    if (input.tagIds.length) {
      await tx.blogPostTag.createMany({
        data: input.tagIds.map((tagId) => ({ postId: post.id, tagId })),
        skipDuplicates: true,
      });
    }

    return post;
  });
}

export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}

export async function listFAQSections() {
  return withMissingTableFallback(
    () =>
      prisma.fAQSection.findMany({
        include: {
          items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      }),
    [],
  );
}

export async function listActiveFAQSections() {
  return withMissingTableFallback(
    () =>
      prisma.fAQSection.findMany({
        where: { isActive: true },
        include: {
          items: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      }),
    [],
  );
}

export async function upsertFAQSection(input: {
  id?: string;
  isActive: boolean;
  slug: string;
  sortOrder: number;
  title: string;
}) {
  const data = {
    isActive: input.isActive,
    slug: input.slug,
    sortOrder: input.sortOrder,
    title: input.title,
  };

  return input.id
    ? prisma.fAQSection.update({ where: { id: input.id }, data })
    : prisma.fAQSection.create({ data });
}

export async function deleteFAQSection(id: string) {
  return prisma.fAQSection.delete({ where: { id } });
}

export async function upsertFAQItem(input: FAQItemMutationInput) {
  const data = {
    answerHtml: input.answerHtml,
    isActive: input.isActive,
    question: input.question,
    sectionId: input.sectionId,
    sortOrder: input.sortOrder,
  };

  return input.id
    ? prisma.fAQItem.update({ where: { id: input.id }, data })
    : prisma.fAQItem.create({ data });
}

export async function deleteFAQItem(id: string) {
  return prisma.fAQItem.delete({ where: { id } });
}

export async function listAdminReviews() {
  return withMissingTableFallback(
    () =>
      prisma.review.findMany({
        include: {
          product: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );
}

export async function listPublicReviews(type?: ReviewType) {
  return withMissingTableFallback(
    () =>
      prisma.review.findMany({
        where: {
          isActive: true,
          isApproved: true,
          type,
        },
        include: {
          product: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );
}

export async function upsertReview(input: ReviewMutationInput) {
  const data = {
    avatar: input.avatar,
    avatarPublicId: input.avatarPublicId,
    initials: input.initials,
    isActive: input.isActive,
    isApproved: input.isApproved,
    name: input.name,
    productId: input.type === "PRODUCT" ? input.productId : undefined,
    rating: input.rating,
    text: input.text,
    type: input.type,
  };

  return input.id
    ? prisma.review.update({ where: { id: input.id }, data })
    : prisma.review.create({ data });
}

export async function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}

export async function ensureCertificateSettings() {
  return withMissingTableFallback(async () => {
    const settings = await prisma.certificatePageSettings.findFirst();

    if (settings) {
      return settings;
    }

    return prisma.certificatePageSettings.create({
      data: {
        title: "Сертифікати відповідності",
        slug: "certificates",
      },
    });
  }, fallbackCertificateSettings);
}

export async function updateCertificateSettings(input: {
  id?: string;
  introHtml?: string;
  seoDescription?: string;
  seoTitle?: string;
  slug: string;
  title: string;
}) {
  const existing = input.id
    ? await prisma.certificatePageSettings.findUnique({
        where: { id: input.id },
      })
    : await prisma.certificatePageSettings.findFirst();
  const data = {
    introHtml: input.introHtml,
    seoDescription: input.seoDescription,
    seoTitle: input.seoTitle,
    slug: input.slug,
    title: input.title,
  };

  return existing
    ? prisma.certificatePageSettings.update({
        where: { id: existing.id },
        data,
      })
    : prisma.certificatePageSettings.create({ data });
}

export async function listCertificateGroups() {
  return withMissingTableFallback(
    () =>
      prisma.certificateGroup.findMany({
        include: {
          items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    [],
  );
}

export async function listActiveCertificateGroups() {
  return withMissingTableFallback(
    () =>
      prisma.certificateGroup.findMany({
        where: { isActive: true },
        include: {
          items: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    [],
  );
}

export async function upsertCertificateGroup(input: {
  descriptionHtml?: string;
  id?: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
}) {
  const data = {
    descriptionHtml: input.descriptionHtml,
    isActive: input.isActive,
    name: input.name,
    slug: input.slug,
    sortOrder: input.sortOrder,
  };

  return input.id
    ? prisma.certificateGroup.update({ where: { id: input.id }, data })
    : prisma.certificateGroup.create({ data });
}

export async function deleteCertificateGroup(id: string) {
  return prisma.certificateGroup.delete({ where: { id } });
}

export async function upsertCertificateItem(input: CertificateItemMutationInput) {
  const data = {
    filePublicId: input.filePublicId,
    fileType: input.fileType,
    fileUrl: input.fileUrl,
    groupId: input.groupId,
    isActive: input.isActive,
    previewImage: input.previewImage,
    previewImagePublicId: input.previewImagePublicId,
    sortOrder: input.sortOrder,
    title: input.title,
  };

  return input.id
    ? prisma.certificateItem.update({ where: { id: input.id }, data })
    : prisma.certificateItem.create({ data });
}

export async function deleteCertificateItem(id: string) {
  return prisma.certificateItem.delete({ where: { id } });
}

export async function listPublishedBlogPostSitemapEntries() {
  return withMissingTableFallback(
    () =>
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { not: null },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    [],
  );
}

export async function listActiveContentPageSitemapEntries() {
  return withMissingTableFallback(
    () =>
      prisma.contentPage.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    [],
  );
}
