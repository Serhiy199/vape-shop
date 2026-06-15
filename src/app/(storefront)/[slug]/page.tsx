import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogAction, CmsPageShell, CmsRichContent } from "@/components/storefront/cms-content";
import { reservedContentSlugs } from "@/features/content/schemas";
import { buildCmsMetadata } from "@/lib/storefront/cms-pages";
import { getActiveContentPageBySlug } from "@/server/repositories/content.repository";

type CmsSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CmsSlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (reservedContentSlugs.has(slug)) {
    return {};
  }

  return buildCmsMetadata(await getActiveContentPageBySlug(slug));
}

export default async function CmsSlugPage({ params }: CmsSlugPageProps) {
  const { slug } = await params;

  if (reservedContentSlugs.has(slug)) {
    notFound();
  }

  const page = await getActiveContentPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <CmsPageShell
      title={page.title}
      description={page.excerpt}
      actions={<CatalogAction />}
    >
      <CmsRichContent heroImage={page.heroImage} html={page.contentHtml} />
    </CmsPageShell>
  );
}
