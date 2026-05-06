"use client";

import Link from "next/link";
import { MenuIcon, UserIcon } from "lucide-react";

import { StorefrontCartLink } from "@/components/storefront/cart-link";
import { StorefrontLogo } from "@/components/storefront/storefront-logo";
import { StorefrontSearchForm } from "@/components/storefront/storefront-search-form";
import {
  storefrontCategories,
  storefrontInfoLinks,
  storefrontMainNavigation,
} from "@/components/storefront/storefront-config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function StorefrontMobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Відкрити меню магазину"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-border/70 border-b px-5 py-4 text-left">
          <StorefrontLogo compact />
          <SheetTitle className="sr-only">Мобільне меню магазину</SheetTitle>
          <SheetDescription>
            Каталог, пошук, кабінет і кошик в одному швидкому меню.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-5 py-5">
          <StorefrontSearchForm
            inputClassName="bg-background"
            placeholder="Пошук товару"
            submitLabel="OK"
          />

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/account"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <UserIcon className="size-4" />
              Кабінет
            </Link>
            <StorefrontCartLink
              className="w-full justify-center"
              showTotal={false}
            />
          </div>

          <Separator />

          <nav className="grid gap-2" aria-label="Основна навігація">
            {storefrontMainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-border/70 bg-background rounded-lg border px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Separator />

          <nav className="space-y-4" aria-label="Мобільний каталог">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.22em] uppercase">
              Каталог
            </p>
            {storefrontCategories.map((category) => (
              <div key={category.href} className="space-y-2">
                <Link href={category.href} className="font-medium">
                  {category.label}
                </Link>
                <div className="grid gap-2 pl-3">
                  {category.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-muted-foreground text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <Separator />

          <nav className="grid gap-2" aria-label="Інформаційні сторінки">
            {storefrontInfoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
