import { notFound } from "next/navigation";

import { CatalogAction, CmsPageShell, CmsRichContent } from "@/components/storefront/cms-content";
import { buildCmsMetadata, getCmsContentPage } from "@/lib/storefront/cms-pages";

export async function generateMetadata() {
  return buildCmsMetadata(await getCmsContentPage("privacy"));
}

export default async function PrivacyPage() {
  const page = await getCmsContentPage("privacy");

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
