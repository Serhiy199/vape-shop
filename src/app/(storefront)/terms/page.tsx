import { notFound } from "next/navigation";

import { CatalogAction, CmsPageShell, CmsRichContent } from "@/components/storefront/cms-content";
import { buildCmsMetadata, getCmsContentPage } from "@/lib/storefront/cms-pages";

export async function generateMetadata() {
  return buildCmsMetadata(await getCmsContentPage("terms"));
}

export default async function TermsPage() {
  const page = await getCmsContentPage("terms");

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
