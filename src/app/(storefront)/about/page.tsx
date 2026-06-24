import { notFound } from "next/navigation";

import { CatalogAction, CmsPageShell, CmsRichContent } from "@/components/storefront/cms-content";
import { buildCmsMetadata, getCmsContentPage } from "@/lib/storefront/cms-pages";

export async function generateMetadata() {
  return buildCmsMetadata(await getCmsContentPage("about"));
}

export default async function AboutPage() {
  const page = await getCmsContentPage("about");

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
