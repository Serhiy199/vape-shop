"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AwardIcon,
  BookOpenIcon,
  BoxesIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  PackageIcon,
  ScanSearchIcon,
  ShieldUserIcon,
  ShoppingCartIcon,
  StarIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  enabled: boolean;
};

type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Основне",
    items: [
      {
        href: "/admin",
        icon: LayoutDashboardIcon,
        label: "Огляд адмінки",
        enabled: true,
      },
    ],
  },
  {
    label: "Каталог",
    items: [
      {
        href: "/admin/categories",
        icon: BoxesIcon,
        label: "Категорії",
        enabled: true,
      },
      {
        href: "/admin/subcategories",
        icon: ChevronRightIcon,
        label: "Підкатегорії",
        enabled: true,
      },
      {
        href: "/admin/brands",
        icon: TagsIcon,
        label: "Виробники",
        enabled: true,
      },
      {
        href: "/admin/products",
        icon: PackageIcon,
        label: "Товари",
        enabled: true,
      },
      {
        href: "/admin/fields",
        icon: ScanSearchIcon,
        label: "Характеристики",
        enabled: true,
      },
    ],
  },
  {
    label: "Контент",
    items: [
      {
        href: "/admin/content/pages",
        icon: FileTextIcon,
        label: "Інформаційні сторінки",
        enabled: true,
      },
      {
        href: "/admin/content/contacts",
        icon: MessageSquareIcon,
        label: "Контакти",
        enabled: true,
      },
      {
        href: "/admin/content/blog",
        icon: BookOpenIcon,
        label: "Блог",
        enabled: true,
      },
      {
        href: "/admin/content/faq",
        icon: CircleHelpIcon,
        label: "FAQ",
        enabled: true,
      },
      {
        href: "/admin/content/reviews",
        icon: StarIcon,
        label: "Відгуки",
        enabled: true,
      },
      {
        href: "/admin/content/certificates",
        icon: AwardIcon,
        label: "Сертифікати",
        enabled: true,
      },
    ],
  },
  {
    label: "Продажі та клієнти",
    items: [
      {
        href: "/admin/orders",
        icon: ShoppingCartIcon,
        label: "Замовлення",
        enabled: true,
      },
      {
        href: "/admin/users",
        icon: UsersIcon,
        label: "Користувачі",
        enabled: true,
      },
      {
        href: "/admin/promo-codes",
        icon: MegaphoneIcon,
        label: "Промокоди",
        enabled: true,
      },
      {
        href: "/admin/banners",
        icon: MegaphoneIcon,
        label: "Банери",
        enabled: true,
      },
    ],
  },
  {
    label: "Налаштування",
    items: [
      {
        href: "/admin/seo",
        icon: ShieldUserIcon,
        label: "SEO",
        enabled: true,
      },
    ],
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavigationList({
  pathname,
  compact = false,
}: {
  pathname: string;
  compact?: boolean;
}) {
  return (
    <nav className="space-y-5" aria-label="Навігація адмінки">
      {adminNavGroups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-muted-foreground px-3 text-xs tracking-[0.24em] uppercase">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item.href);
              const Icon = item.icon;

              if (!item.enabled) {
                return (
                  <div
                    key={item.href}
                    className={cn(
                      "text-muted-foreground/80 border-border/70 flex items-center justify-between rounded-2xl border border-dashed px-3 py-3",
                      compact ? "text-sm" : "text-[0.95rem]",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-xl">
                        <Icon className="size-4" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <Badge variant="outline">Незабаром</Badge>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors",
                    compact ? "text-sm" : "text-[0.95rem]",
                    active
                      ? "border-primary/25 bg-primary/10 text-foreground"
                      : "hover:border-border/70 hover:bg-muted/60 border-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {active ? <Badge variant="secondary">Активно</Badge> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminNavigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return <AdminNavigationList pathname={pathname} compact={compact} />;
}
