"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  changeContactRequestStatus,
  removeAdminContentPage,
  removeBlogCategory,
  removeBlogPost,
  removeBlogTag,
  removeCertificateGroup,
  removeCertificateItem,
  removeFAQItem,
  removeFAQSection,
  removeReview,
  saveAdminContactSettings,
  saveAdminContentPage,
  saveAdminReview,
  saveBlogCategory,
  saveBlogPost,
  saveBlogTag,
  saveCertificateGroup,
  saveCertificateItem,
  saveCertificateSettings,
  saveFAQItem,
  saveFAQSection,
  savePublicContactRequest,
  savePublicReview,
  toggleAdminContentPage,
  type ContentMutationResult,
} from "@/server/services/admin-content.service";

async function withAdmin<TData>(
  action: () => Promise<ContentMutationResult<TData>>,
) {
  await requireAdmin();
  return action();
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/admin/content/pages");
  revalidatePath("/admin/content/contacts");
  revalidatePath("/admin/content/blog");
  revalidatePath("/admin/content/faq");
  revalidatePath("/admin/content/reviews");
  revalidatePath("/admin/content/certificates");
  revalidatePath("/contacts");
  revalidatePath("/blog");
  revalidatePath("/faq");
  revalidatePath("/reviews");
  revalidatePath("/certificates");
  revalidatePath("/sitemap.xml");
}

async function mutateAdmin<TData>(
  action: () => Promise<ContentMutationResult<TData>>,
) {
  return withAdmin(async () => {
    const result = await action();

    if (result.ok) {
      revalidateContent();
    }

    return result;
  });
}

export async function saveContentPageAction(input: unknown) {
  return mutateAdmin(() => saveAdminContentPage(input));
}

export async function deleteContentPageAction(input: unknown) {
  return mutateAdmin(() => removeAdminContentPage(input));
}

export async function toggleContentPageAction(input: unknown) {
  return mutateAdmin(() => toggleAdminContentPage(input));
}

export async function saveContactSettingsAction(input: unknown) {
  return mutateAdmin(() => saveAdminContactSettings(input));
}

export async function submitContactRequestAction(input: unknown) {
  const result = await savePublicContactRequest(input);

  if (result.ok) {
    revalidatePath("/admin/content/contacts");
  }

  return result;
}

export async function setContactRequestStatusAction(input: unknown) {
  return mutateAdmin(() => changeContactRequestStatus(input));
}

export async function saveBlogCategoryAction(input: unknown) {
  return mutateAdmin(() => saveBlogCategory(input));
}

export async function saveBlogTagAction(input: unknown) {
  return mutateAdmin(() => saveBlogTag(input));
}

export async function saveBlogPostAction(input: unknown) {
  return mutateAdmin(() => saveBlogPost(input));
}

export async function deleteBlogCategoryAction(input: unknown) {
  return mutateAdmin(() => removeBlogCategory(input));
}

export async function deleteBlogTagAction(input: unknown) {
  return mutateAdmin(() => removeBlogTag(input));
}

export async function deleteBlogPostAction(input: unknown) {
  return mutateAdmin(() => removeBlogPost(input));
}

export async function saveFAQSectionAction(input: unknown) {
  return mutateAdmin(() => saveFAQSection(input));
}

export async function saveFAQItemAction(input: unknown) {
  return mutateAdmin(() => saveFAQItem(input));
}

export async function deleteFAQSectionAction(input: unknown) {
  return mutateAdmin(() => removeFAQSection(input));
}

export async function deleteFAQItemAction(input: unknown) {
  return mutateAdmin(() => removeFAQItem(input));
}

export async function saveAdminReviewAction(input: unknown) {
  return mutateAdmin(() => saveAdminReview(input));
}

export async function submitReviewAction(input: unknown) {
  const result = await savePublicReview(input);

  if (result.ok) {
    revalidatePath("/admin/content/reviews");
  }

  return result;
}

export async function deleteReviewAction(input: unknown) {
  return mutateAdmin(() => removeReview(input));
}

export async function saveCertificateSettingsAction(input: unknown) {
  return mutateAdmin(() => saveCertificateSettings(input));
}

export async function saveCertificateGroupAction(input: unknown) {
  return mutateAdmin(() => saveCertificateGroup(input));
}

export async function saveCertificateItemAction(input: unknown) {
  return mutateAdmin(() => saveCertificateItem(input));
}

export async function deleteCertificateGroupAction(input: unknown) {
  return mutateAdmin(() => removeCertificateGroup(input));
}

export async function deleteCertificateItemAction(input: unknown) {
  return mutateAdmin(() => removeCertificateItem(input));
}
