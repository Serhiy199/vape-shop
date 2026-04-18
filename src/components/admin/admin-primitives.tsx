import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PrimitiveAction = {
  href: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  badges = [],
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  badges?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {badges.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

export function AdminActionsBar({
  actions,
  note,
}: {
  actions: PrimitiveAction[];
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={`${action.href}-${action.label}`}
            href={action.href}
            className={buttonVariants({ variant: action.variant ?? "outline" })}
          >
            {action.label}
          </Link>
        ))}
      </div>
      {note ? (
        <p className="text-muted-foreground text-sm leading-6">{note}</p>
      ) : null}
    </div>
  );
}

export function AdminSectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-background/80 shadow-none">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="max-w-2xl leading-6">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  action?: PrimitiveAction;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-6">
      {Icon ? (
        <div className="bg-background flex size-12 items-center justify-center rounded-2xl border border-border/70">
          <Icon className="text-muted-foreground size-5" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">
          {description}
        </p>
      </div>
      {action ? (
        <Link
          href={action.href}
          className={cn(
            buttonVariants({ variant: action.variant ?? "outline" }),
            "gap-2",
          )}
        >
          {action.label}
          <ArrowRightIcon className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function AdminStatsGrid({
  items,
}: {
  items: Array<{ label: string; value: string; note: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border/70 bg-card/90 p-4"
        >
          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
            {item.label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {item.note}
          </p>
        </div>
      ))}
    </div>
  );
}
