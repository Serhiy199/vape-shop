import { StorefrontContentPage } from "@/components/storefront/content-page";
import { CatalogAction, CmsPageShell, CmsRichContent } from "@/components/storefront/cms-content";
import { storefrontContentPages } from "@/lib/storefront/content-pages";
import { buildCmsMetadata, getCmsContentPage } from "@/lib/storefront/cms-pages";

export async function generateMetadata() {
  return buildCmsMetadata(await getCmsContentPage("about"));
}

export default async function AboutPage() {
  const page = await getCmsContentPage("about");

  if (page) {
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

  return <StorefrontContentPage page={storefrontContentPages.about} />;
}
