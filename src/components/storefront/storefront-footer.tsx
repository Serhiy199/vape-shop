import Link from "next/link";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { StorefrontLogo } from "@/components/storefront/storefront-logo";
import {
  storefrontCategories,
  storefrontInfoLinks,
  storefrontServiceLinks,
  storefrontTrustItems,
} from "@/components/storefront/storefront-config";
import { Separator } from "@/components/ui/separator";
import { listFooterContentPages } from "@/server/repositories/content.repository";

export async function StorefrontFooter() {
  const cmsInfoLinks = (await listFooterContentPages()).map((page) => ({
    href: `/${page.slug}`,
    label: page.title,
  }));
  const infoLinks = [...storefrontInfoLinks, ...cmsInfoLinks];

  return (
    <footer>
      <section className="mx-auto grid w-full max-w-screen-2xl gap-6 bg-background px-4 py-8 text-foreground sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {storefrontTrustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-start gap-4"
            >
              <span className="grid size-12 shrink-0 place-items-center text-primary">
                <Icon className="size-11 stroke-[1.8]" />
              </span>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="text-muted-foreground text-sm leading-5 md:max-w-[260px]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="border-y border-border/70 bg-sky-50 px-4 py-3 text-center text-sm font-medium text-blue-900 sm:px-6">
        Сайт kalyan-city.com.ua призначений{" "}
        <span className="text-primary">виключно для осіб віком 18+</span>.
        Продаж електронних сигарет та нікотиновмісної продукції неповнолітнім
        заборонений законом.
      </div>

      <Separator className="bg-[#2b211a]" />

      <div className="bg-[#17130f] text-[#f7f1e8]">
        <div className="mx-auto grid w-full max-w-screen-2xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:px-8">
          <div className="space-y-4">
            <StorefrontLogo />
            <p className="max-w-sm text-sm leading-6 text-[#c9beb1]">
              Магазин для повнолітніх клієнтів із фокусом на зрозумілий каталог,
              швидкий пошук, прозорі умови та зручний шлях до покупки.
            </p>
            <div className="grid gap-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <PhoneIcon className="text-primary size-4" />
                +38 (080) 033-50-94
              </span>
              <span className="inline-flex items-center gap-2">
                <MailIcon className="text-primary size-4" />
                support@voodoovape.local
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="text-primary size-4" />
                Доставка по Україні
              </span>
            </div>
          </div>

          <FooterColumn title="Каталог">
            {storefrontCategories.map((category) => (
              <Link key={category.href} href={category.href}>
                {category.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Інформація">
            {infoLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Сервіс">
            {storefrontServiceLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2"
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
            <span className="pt-2 text-xs leading-5 text-[#c9beb1]">
              Продаж електронних сигарет і нікотиновмісної продукції
              неповнолітнім заборонений.
            </span>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-[#2b211a] bg-[#17130f]">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-2 px-4 py-4 text-xs text-[#c9beb1] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 Voodoo Vape. Тільки для повнолітніх клієнтів.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Політика конфіденційності</Link>
            <Link href="/terms">Умови використання</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <nav className="grid content-start gap-3 text-sm" aria-label={title}>
      <h2 className="font-semibold text-[#f7f1e8]">{title}</h2>
      <div className="grid gap-2 text-[#c9beb1]">{children}</div>
    </nav>
  );
}
