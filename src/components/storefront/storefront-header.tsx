import Link from "next/link";
import {
  ChevronDownIcon,
  ClockIcon,
  HeartIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";

import { StorefrontCartLink } from "@/components/storefront/cart-link";
import { StorefrontLogo } from "@/components/storefront/storefront-logo";
import { StorefrontMobileMenu } from "@/components/storefront/mobile-menu";
import { StorefrontSearchForm } from "@/components/storefront/storefront-search-form";
import {
  storefrontBrand,
  storefrontInfoLinks,
} from "@/components/storefront/storefront-config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StorefrontHeader() {
  return (
    <header className="border-border/70 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="border-border/60 bg-foreground text-background border-b">
        <div className="mx-auto flex h-9 w-full max-w-screen-2xl items-center justify-between gap-4 px-4 text-xs sm:px-6 lg:px-8">
          <div className="hidden items-center gap-4 md:flex">
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="size-3.5" />
              Пн-Нд: 10:00-20:00
            </span>
            <span className="inline-flex items-center gap-2">
              <PhoneIcon className="size-3.5" />
              +38 (080) 033-50-94
            </span>
          </div>
          <p className="truncate">{storefrontBrand.legalAgeNotice}</p>
          <nav
            className="hidden items-center gap-4 lg:flex"
            aria-label="Корисні посилання"
          >
            {storefrontInfoLinks.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="opacity-85 hover:opacity-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <StorefrontMobileMenu />

        <StorefrontLogo />

        <Link
          href="/catalog"
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden h-11 shrink-0 gap-2 rounded-lg px-4 lg:inline-flex",
          )}
        >
          Каталог товарів
          <ChevronDownIcon className="size-4" />
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block">
          <StorefrontSearchForm
            inputClassName="border-border/80 pr-48"
            placeholder="Почніть вводити назву товару"
            showHint
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/wishlist"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "bg-card hidden rounded-lg sm:inline-flex",
            )}
            aria-label="Обране"
          >
            <HeartIcon className="size-4" />
          </Link>
          <Link
            href="/account"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "bg-card hidden rounded-lg sm:inline-flex",
            )}
            aria-label="Особистий кабінет"
          >
            <UserIcon className="size-4" />
          </Link>
          <StorefrontCartLink />
        </div>
      </div>
    </header>
  );
}
