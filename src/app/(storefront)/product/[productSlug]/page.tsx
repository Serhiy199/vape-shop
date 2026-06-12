import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { ProductInfoAccordion } from "@/components/storefront/product-info-accordion";
import { StorefrontProductDetailExperience } from "@/components/storefront/product-detail-experience";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import { SafeRichTextContent } from "@/components/storefront/safe-rich-text-content";
import {
  StorefrontCard,
  StorefrontPageHeader,
  StorefrontSection,
  StorefrontSectionHeader,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import {
  getActiveStorefrontProductBySlug,
  listActiveStorefrontProducts,
} from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    productSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await getActiveStorefrontProductBySlug(productSlug);

  if (!product) {
    return {};
  }

  return {
    title: product.metaTitle,
    description: product.metaDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productSlug } = await params;
  const product = await getActiveStorefrontProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (
    await listActiveStorefrontProducts({
      categorySlug: product.category.slug,
      limit: 6,
    })
  ).filter((item) => item.slug !== product.slug);
  const purchaseHighlights = [
    { label: "Категорія", value: product.category.name },
    { label: "Підкатегорія", value: product.subcategory.name },
    ...product.fieldValues.slice(0, 4).map((fieldValue) => ({
      label: fieldValue.label,
      value: fieldValue.value,
    })),
  ].filter((highlight) => highlight.value);

  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[
          { href: "/", label: "Головна" },
          { href: "/catalog", label: "Каталог" },
          {
            href: `/category/${product.category.slug}`,
            label: product.category.name,
          },
          {
            href: `/category/${product.category.slug}/${product.subcategory.slug}`,
            label: product.subcategory.name,
          },
          { label: product.pageTitle },
        ]}
        eyebrow={product.brand?.name ?? product.category.name}
        title={product.pageTitle}
      />

      <StorefrontSection>
        <StorefrontProductDetailExperience
          highlights={purchaseHighlights}
          images={product.images}
          option={product.option}
          product={product.card}
          selectedOptionValue={product.selectedOptionValue}
          title={product.pageTitle}
        />
      </StorefrontSection>

      <StorefrontSection tone="muted">
        <div className="space-y-4">
          <StorefrontCard className="p-5">
            <div className="space-y-4">
              <h2 className={storefrontPatterns.sectionTitle}>Опис товару</h2>
              {product.description ? (
                <SafeRichTextContent html={product.description} />
              ) : (
                <p className={storefrontPatterns.bodyText}>
                  Опис товару ще не доданий. Його можна заповнити в
                  адмін-панелі разом із SEO-даними та зображеннями.
                </p>
              )}
            </div>
          </StorefrontCard>

          {product.fieldValues.length > 0 ? (
            <StorefrontCard className="overflow-hidden p-0">
              <div className="border-border/70 border-b px-5 py-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Характеристики
                </h2>
              </div>
              <dl className="px-5 py-4">
                {product.fieldValues.map((fieldValue) => (
                  <div
                    key={fieldValue.id}
                    className="flex items-baseline gap-3 py-2 text-sm sm:text-base"
                  >
                    <dt className="text-muted-foreground shrink-0">
                      {fieldValue.label}
                    </dt>
                    <dd className="flex min-w-0 flex-1 items-baseline gap-3 text-right">
                      <span className="border-border/80 h-px flex-1 border-b border-dashed" />
                      <span className="max-w-[48%] leading-6 font-medium">
                        {fieldValue.value}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </StorefrontCard>
          ) : (
            <StorefrontCard className="p-5">
              <p className={storefrontPatterns.bodyText}>
                Для цього товару ще не додані характеристики.
              </p>
            </StorefrontCard>
          )}

          <ProductInfoAccordion title="Доставка та оплата">
            <p>
              Доставка по Україні. Детальні сценарії будуть підключені в
              checkout.
            </p>
            <p>
              Оплата та промокоди будуть активовані на наступних e-commerce
              етапах.
            </p>
          </ProductInfoAccordion>

          <ProductInfoAccordion title="Гарантія">
            <p>
              За посиланням нижче Ви можете детально ознайомитись з гарантією,
              яку надає наш магазин.
            </p>
            <Link
              href="/terms"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Гарантія та повернення
            </Link>
          </ProductInfoAccordion>
        </div>
      </StorefrontSection>

      <StorefrontSection tone="muted">
        <StorefrontSectionHeader
          eyebrow="Схожі товари"
          title="Інші товари з цієї категорії"
          description="Добірка активних товарів з тієї ж категорії."
        />
        <StorefrontProductGrid
          products={relatedProducts}
          emptyTitle="Схожих товарів поки немає"
          emptyDescription="Коли в категорії з’явиться більше активних товарів, вони будуть показані тут."
        />
      </StorefrontSection>
    </>
  );
}
