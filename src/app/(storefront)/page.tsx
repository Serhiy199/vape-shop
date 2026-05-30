import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon, ShoppingBagIcon } from "lucide-react";

import { HomeBannersSlider } from "@/components/storefront/home-banners-slider";
import { StorefrontCategoryCard } from "@/components/storefront/category-card";
import { StorefrontProductGrid } from "@/components/storefront/product-grid";
import { StorefrontSearchForm } from "@/components/storefront/storefront-search-form";
import { storefrontHomePromos } from "@/components/storefront/storefront-config";
import {
  StorefrontActionLink,
  StorefrontBadge,
  StorefrontCard,
  StorefrontGrid,
  StorefrontSection,
  StorefrontSectionHeader,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { getStorefrontHomePageData } from "@/server/queries/storefront-catalog.query";

export const dynamic = "force-dynamic";

const popularSearches = [
  "POD-системи",
  "Картриджі",
  "Сольові рідини",
  "Vaporesso",
  "Oxva",
  "Випарники",
];

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
      <StorefrontSection spacing="lg" className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="max-w-4xl space-y-7">
            <div className="flex flex-wrap gap-2">
              <StorefrontBadge tone="default">18+ storefront</StorefrontBadge>
              <StorefrontBadge tone="hit">Швидкий вибір</StorefrontBadge>
            </div>

            <div className="space-y-4">
              <p className={storefrontPatterns.eyebrow}>Voodoo Vape</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Зручний vape-магазин з фокусом на каталог, пошук і швидкий
                вибір.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
                Обирайте пристрої, рідини, комплектуючі та аксесуари через
                зрозумілі категорії, швидкий пошук і добірки для популярних
                сценаріїв.
              </p>
            </div>

            <div className="border-border/70 bg-card max-w-2xl rounded-xl border p-2 shadow-sm">
              <StorefrontSearchForm
                inputClassName="h-12 border-0 bg-background shadow-none"
                placeholder="Почніть вводити назву товару"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {popularSearches.map((item) => (
                <Link
                  key={item}
                  href={`/catalog?search=${encodeURIComponent(item)}`}
                  className="text-muted-foreground border-border bg-card hover:border-primary/40 hover:text-foreground rounded-full border px-3 py-1.5 text-sm transition"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <StorefrontActionLink href="/catalog">
                Перейти в каталог
                <ArrowRightIcon className="size-4" />
              </StorefrontActionLink>
              <StorefrontActionLink href="/category" variant="outline">
                Дивитись категорії
              </StorefrontActionLink>
            </div>
          </div>

          <StorefrontCard className="relative min-h-[360px] p-5">
            <div className="absolute inset-x-5 top-5 flex items-center justify-between">
              <StorefrontBadge tone="stock">Вітрина</StorefrontBadge>
              <span className="text-muted-foreground text-xs">18+</span>
            </div>
            <div className="grid h-full place-items-center pt-12">
              <div className="w-full max-w-xs space-y-4">
                {storefrontHomePromos.map((promo) => {
                  const Icon = promo.icon;

                  return (
                    <Link
                      key={promo.href}
                      href={promo.href}
                      className="group border-border/70 bg-background hover:border-primary/40 flex gap-4 rounded-lg border p-4 transition hover:shadow-sm"
                    >
                      <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-lg">
                        <Icon className="size-5" />
                      </span>
                      <span className="space-y-1">
                        <span className="block font-medium">{promo.label}</span>
                        <span className="text-muted-foreground block text-sm leading-5">
                          {promo.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </StorefrontCard>
        </div>
      </StorefrontSection>

      {homeBanners.length > 0 ? (
        <StorefrontSection spacing="sm" className="overflow-hidden pt-0">
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

      <StorefrontSection tone="dark">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="space-y-3">
            <p className="text-background/70 text-xs font-semibold tracking-[0.22em] uppercase">
              Підбір товару
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Знайдіть потрібну категорію та переходьте до каталогу.
            </h2>
            <p className="text-background/75 max-w-2xl text-sm leading-6 sm:text-base">
              Каталог об’єднає товари, фільтри, характеристики й добірки, щоб
              вибір пристрою або рідини був швидким і зрозумілим.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BadgeCheckIcon className="text-primary size-5" />
            <span className="text-background/80 text-sm">
              Категорії та пошук завжди поруч
            </span>
          </div>
        </div>
      </StorefrontSection>
    </>
  );
}
