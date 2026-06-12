"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartIcon,
  KeyRoundIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/logout";
import { cn } from "@/lib/utils";

const accountLinks = [
  {
    href: "/account/profile",
    icon: UserIcon,
    label: "Мій профіль",
  },
  {
    href: "/account/orders",
    icon: PackageIcon,
    label: "Мої замовлення",
  },
  {
    href: "/account/addresses",
    icon: MapPinIcon,
    label: "Адреси доставки",
  },
  {
    href: "/account/wishlist",
    icon: HeartIcon,
    label: "Wishlist",
  },
  {
    href: "/account/change-password",
    icon: KeyRoundIcon,
    label: "Зміна пароля",
  },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2" aria-label="Меню кабінету">
      {accountLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "border-border/70 bg-background hover:border-primary/40 hover:text-primary inline-flex h-11 items-center gap-3 rounded-lg border px-3 text-sm font-medium transition",
              isActive && "border-primary/35 bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <form action={logoutAction}>
        <Button
          className="h-11 w-full justify-start gap-3 rounded-lg"
          type="submit"
          variant="outline"
        >
          <LogOutIcon className="size-4" />
          Вийти
        </Button>
      </form>
    </nav>
  );
}
