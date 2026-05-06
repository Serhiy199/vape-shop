import { notFound } from "next/navigation";

import { StorefrontProductGallery } from "@/components/storefront/product-gallery";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import { StorefrontProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
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
          { label: product.title },
        ]}
        eyebrow={product.brand?.name ?? product.category.name}
        title={product.title}
      />

      <StorefrontSection>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <StorefrontProductGallery
            images={product.images}
            title={product.title}
          />
          <StorefrontProductPurchasePanel
            highlights={purchaseHighlights}
            product={product.card}
          />
        </div>
      </StorefrontSection>

      <StorefrontSection tone="muted">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <StorefrontCard className="p-5">
            <div className="space-y-4">
              <h2 className={storefrontPatterns.sectionTitle}>Опис товару</h2>
              <p className={storefrontPatterns.bodyText}>
                {product.description ??
                  "Опис товару ще не доданий. Його можна заповнити в адмін-панелі разом із SEO-даними та зображеннями."}
              </p>
            </div>
          </StorefrontCard>

          <StorefrontCard className="p-5">
            <div className="space-y-4">
              <h2 className={storefrontPatterns.sectionTitle}>
                Доставка та оплата
              </h2>
              <div className="text-muted-foreground grid gap-3 text-sm">
                <p>
                  Доставка по Україні. Детальні сценарії будуть підключені в
                  checkout.
                </p>
                <p>
                  Оплата та промокоди будуть активовані на наступних e-commerce
                  етапах.
                </p>
              </div>
            </div>
          </StorefrontCard>
        </div>
      </StorefrontSection>

      <StorefrontSection>
        <StorefrontSectionHeader
          eyebrow="Характеристики"
          title="Параметри товару"
          description="Dynamic fields з адмін-панелі відображаються як характеристики storefront-товару."
        />
        {product.fieldValues.length > 0 ? (
          <StorefrontCard className="p-5">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.fieldValues.map((fieldValue) => (
                <div
                  key={fieldValue.id}
                  className="border-border/70 bg-background rounded-lg border p-4"
                >
                  <dt className="text-muted-foreground text-sm">
                    {fieldValue.label}
                  </dt>
                  <dd className="mt-1 font-medium">{fieldValue.value}</dd>
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
