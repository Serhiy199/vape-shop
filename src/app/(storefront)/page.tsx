import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon, ShoppingBagIcon } from "lucide-react";

import { HomeBannersSlider } from "@/components/storefront/home-banners-slider";
import { StorefrontCategoryCard } from "@/components/storefront/category-card";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import {
  StorefrontActionLink,
  StorefrontCard,
  StorefrontGrid,
  StorefrontSection,
  StorefrontSectionHeader,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { getStorefrontHomePageData } from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

const merchandisingBlocks = [
  {
    description:
      "Добірки new, sale та hit допомагають швидко перейти до найпомітніших пропозицій каталогу.",
    href: "/catalog?badge=hit",
    label: "Популярні товари",
  },
  {
    description:
      "Окрема зона для акційних товарів, промокодів і бонусних пропозицій.",
    href: "/catalog?badge=sale",
    label: "Акції та кешбек",
  },
  {
    description:
      "Швидкий шлях для клієнта, який вже знає бренд або сумісну модель комплектуючих.",
    href: "/catalog?sort=brands",
    label: "Пошук за брендом",
  },
];

export default async function StorefrontHomePage() {
  const {
    banners,
    brands,
    categories,
    featuredProducts,
    newProducts,
    saleProducts,
  } =
    await getStorefrontHomePageData();
  const homeBanners = banners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    imageUrl: banner.imageUrl,
    targetUrl: banner.targetUrl,
  }));

  return (
    <>
      {homeBanners.length > 0 ? (
        <StorefrontSection spacing="sm" className="overflow-hidden">
          <HomeBannersSlider banners={homeBanners} />
        </StorefrontSection>
      ) : null}

      <StorefrontSection tone="muted">
        <StorefrontSectionHeader
          eyebrow="Популярні категорії"
          title="Основні напрямки магазину"
          description="Категорії побудовані так, щоб клієнт швидко знайшов потрібний тип товару, а потім перейшов до підкатегорій і фільтрів."
          action={
            <StorefrontActionLink
              href="/category"
              variant="outline"
              size="default"
            >
              Усі категорії
            </StorefrontActionLink>
          }
        />
        <StorefrontGrid variant="categories">
          {categories.map((category) => (
            <StorefrontCategoryCard key={category.href} category={category} />
          ))}
        </StorefrontGrid>
      </StorefrontSection>

      <StorefrontSection>
        <StorefrontSectionHeader
          eyebrow="Новинки"
          title="Свіжі надходження"
          description="Добірка активних товарів, позначених в адмін-панелі як новинки."
          action={
            <StorefrontActionLink
              href="/catalog?badge=new"
              variant="outline"
              size="default"
            >
              Усі новинки
            </StorefrontActionLink>
          }
        />
        <StorefrontProductGrid
          products={newProducts}
          emptyTitle="Новинки ще не додані"
          emptyDescription="Позначте активні товари як новинки в адмін-панелі, і вони з'являться в цій секції."
        />
      </StorefrontSection>

      <StorefrontSection tone="muted">
        <StorefrontSectionHeader
          eyebrow="Акції"
          title="Товари зі знижками та промо"
          description="Окрема вітрина для товарів, які адміністратор позначив як акційні."
          action={
            <StorefrontActionLink
              href="/catalog?badge=sale"
              variant="outline"
              size="default"
            >
              Усі акції
            </StorefrontActionLink>
          }
        />
        <StorefrontProductGrid
          products={saleProducts}
          emptyTitle="Акційні товари ще не додані"
          emptyDescription="Коли товар отримає прапорець акції в адмін-панелі, він автоматично потрапить у цю добірку."
        />
      </StorefrontSection>

      <StorefrontSection>
        <StorefrontSectionHeader
          eyebrow="Бренди"
          title="Швидкий перехід за виробником"
          description="Клієнт може одразу звузити каталог до бренду, який уже знає або шукає."
          action={
            <StorefrontActionLink
              href="/catalog"
              variant="outline"
              size="default"
            >
              Перейти в каталог
            </StorefrontActionLink>
          }
        />
        {brands.length > 0 ? (
          <StorefrontGrid variant="content">
            {brands.map((brand) => (
              <StorefrontCard key={brand.value} interactive className="p-5">
                <Link
                  href={`/catalog?brand=${brand.value}`}
                  className="flex h-full flex-col gap-4"
                >
                  <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-lg">
                    <BadgeCheckIcon className="size-5" />
                  </span>
                  <span className="space-y-2">
                    <span className="block text-xl font-semibold tracking-tight">
                      {brand.label}
                    </span>
                    <span className={storefrontPatterns.bodyText}>
                      {typeof brand.count === "number"
                        ? `${brand.count} товарів у каталозі`
                        : "Переглянути товари бренду"}
                    </span>
                  </span>
                  <span className="text-primary mt-auto inline-flex items-center gap-2 text-sm font-medium">
                    Дивитись бренд
                    <ArrowRightIcon className="size-4" />
                  </span>
                </Link>
              </StorefrontCard>
            ))}
          </StorefrontGrid>
        ) : (
          <StorefrontGrid variant="content">
            {merchandisingBlocks.map((block) => (
              <StorefrontCard key={block.href} interactive className="p-5">
                <Link href={block.href} className="flex h-full flex-col gap-5">
                  <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-lg">
                    <ShoppingBagIcon className="size-5" />
                  </span>
                  <span className="space-y-2">
                    <span className="block text-xl font-semibold tracking-tight">
                      {block.label}
                    </span>
                    <span className={storefrontPatterns.bodyText}>
                      {block.description}
                    </span>
                  </span>
                  <span className="text-primary mt-auto inline-flex items-center gap-2 text-sm font-medium">
                    Переглянути
                    <ArrowRightIcon className="size-4" />
                  </span>
                </Link>
              </StorefrontCard>
            ))}
          </StorefrontGrid>
        )}
      </StorefrontSection>

      <StorefrontSection tone="muted">
        <StorefrontSectionHeader
          eyebrow="Товарна вітрина"
          title="Популярні товари"
          description="Добірка hit, new і sale товарів працює як запасний merchandising блок для головної."
        />
        <StorefrontProductGrid
          products={featuredProducts}
          emptyTitle="Активні товари ще не додані"
          emptyDescription="Створіть активні товари в адмінці, позначте їх як new, sale або hit, і вони з'являться на storefront."
        />
      </StorefrontSection>
    </>
  );
}
