import Link from "next/link";
import { ChevronRightIcon, SearchXIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      default: "max-w-screen-2xl",
      narrow: "max-w-5xl",
      prose: "max-w-3xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const sectionVariants = cva("w-full", {
  variants: {
    tone: {
      default: "bg-background",
      muted: "bg-muted/45",
      surface: "bg-card",
      dark: "bg-foreground text-background",
      catalog: "storefront-catalog-pattern",
    },
    spacing: {
      sm: "py-6 sm:py-8",
      default: "py-8 sm:py-10 lg:py-12",
      lg: "py-10 sm:py-14 lg:py-16",
    },
  },
  defaultVariants: {
    tone: "default",
    spacing: "default",
  },
});

const storefrontBadgeVariants = cva(
  "h-6 rounded-md border px-2.5 text-xs font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      tone: {
        default: "border-primary/20 bg-primary/10 text-primary",
        new: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        hit: "border-amber-500/25 bg-amber-500/15 text-amber-700",
        sale: "border-destructive/20 bg-destructive/10 text-destructive",
        stock: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

const gridVariants = cva("grid", {
  variants: {
    variant: {
      categories: "grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
      products: "grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5",
      content: "grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
      split: "grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
    },
  },
  defaultVariants: {
    variant: "content",
  },
});

export const storefrontPatterns = {
  card:
    "rounded-lg border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
  cardInteractive:
    "rounded-lg border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
  media:
    "aspect-square overflow-hidden rounded-md bg-muted/70 object-cover transition duration-300 group-hover/card:scale-[1.03]",
  sectionTitle: "text-2xl font-semibold tracking-tight sm:text-3xl",
  eyebrow:
    "text-muted-foreground text-xs font-semibold uppercase tracking-[0.22em]",
  bodyText: "text-muted-foreground text-sm leading-6 sm:text-base",
  productTitle:
    "line-clamp-2 min-h-10 text-sm font-medium leading-5 text-foreground",
  price: "text-lg font-semibold tracking-tight text-foreground",
};

export function StorefrontContainer({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof containerVariants>) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}

export function StorefrontSection({
  children,
  className,
  containerClassName,
  containerSize,
  spacing,
  tone,
  ...props
}: React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants> & {
    containerClassName?: string;
    containerSize?: VariantProps<typeof containerVariants>["size"];
  }) {
  return (
    <section className={cn(sectionVariants({ tone, spacing }), className)} {...props}>
      <StorefrontContainer size={containerSize} className={containerClassName}>
        {children}
      </StorefrontContainer>
    </section>
  );
}

export function StorefrontSectionHeader({
  action,
  children,
  className,
  description,
  eyebrow,
  title,
}: {
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-2">
        {eyebrow ? <p className={storefrontPatterns.eyebrow}>{eyebrow}</p> : null}
        <h2 className={storefrontPatterns.sectionTitle}>{title}</h2>
        {description ? (
          <p className={storefrontPatterns.bodyText}>{description}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StorefrontPageHeader({
  actions,
  breadcrumbs,
  className,
  description,
  eyebrow,
  summary,
  title,
  tone = "surface",
}: {
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  description?: string;
  eyebrow?: string;
  summary?: React.ReactNode;
  title: string;
  tone?: VariantProps<typeof sectionVariants>["tone"];
}) {
  return (
    <StorefrontSection
      tone={tone}
      spacing="sm"
      className={cn("border-b border-border/70", className)}
    >
      <div className="space-y-5">
        {breadcrumbs ? <StorefrontBreadcrumbs items={breadcrumbs} /> : null}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-2">
            {eyebrow ? <p className={storefrontPatterns.eyebrow}>{eyebrow}</p> : null}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {summary ? (
              <div className="text-muted-foreground text-sm leading-6">
                {summary}
              </div>
            ) : null}
            {description ? (
              <p className={storefrontPatterns.bodyText}>{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </StorefrontSection>
  );
}

export type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function StorefrontBreadcrumbs({
  className,
  items,
}: {
  className?: string;
  items: BreadcrumbItem[];
}) {
  return (
    <nav
      aria-label="Хлібні крихти"
      className={cn("text-muted-foreground flex flex-wrap items-center gap-1 text-sm", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-foreground transition">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && "text-foreground font-medium")}>
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRightIcon className="size-3.5" /> : null}
          </span>
        );
      })}
    </nav>
  );
}

export function StorefrontEmptyState({
  action,
  className,
  description = "Спробуйте змінити фільтри або повернутися до каталогу.",
  icon,
  title = "Нічого не знайдено",
}: {
  action?: React.ReactNode;
  className?: string;
  description?: string;
  icon?: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-lg border border-dashed border-border bg-card px-4 py-12 text-center",
        className,
      )}
    >
      <div className="max-w-sm space-y-4">
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-muted-foreground">
          {icon ?? <SearchXIcon className="size-6" />}
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className={storefrontPatterns.bodyText}>{description}</p>
        </div>
        {action ? <div className="flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

export function StorefrontCard({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<typeof Card> & { interactive?: boolean }) {
  return (
    <Card
      className={cn(
        interactive ? storefrontPatterns.cardInteractive : storefrontPatterns.card,
        className,
      )}
      {...props}
    />
  );
}

export function StorefrontGrid({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof gridVariants>) {
  return <div className={cn(gridVariants({ variant }), className)} {...props} />;
}

export function StorefrontBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<typeof Badge> & VariantProps<typeof storefrontBadgeVariants>) {
  return (
    <Badge
      variant="outline"
      className={cn(storefrontBadgeVariants({ tone }), className)}
      {...props}
    />
  );
}

export function StorefrontActionLink({
  children,
  className,
  href,
  size = "lg",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size }),
        "rounded-lg px-4",
        className,
      )}
    >
      {children}
    </Link>
  );
}
