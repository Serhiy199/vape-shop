import type { Metadata } from "next";

import { getActiveContentPageBySlug } from "@/server/repositories/content.repository";

export const legacyContentRouteSlugs = {
  about: "about",
  delivery: "delivery",
  payment: "payment",
  privacy: "privacy",
  terms: "terms",
} as const;

export async function getCmsContentPage(route: keyof typeof legacyContentRouteSlugs) {
  return getActiveContentPageBySlug(legacyContentRouteSlugs[route]);
}

export function buildCmsMetadata(page: {
  excerpt?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  seoTitle?: string | null;
  title: string;
} | null): Metadata {
  if (!page) {
    return {};
  }

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || page.excerpt || undefined;

  return {
    description,
    openGraph: {
      description,
      images: page.seoImage ? [page.seoImage] : undefined,
      title,
    },
    title,
  };
}
