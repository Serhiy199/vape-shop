import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AccessShellLink = {
  href: string;
  label: string;
};

export function AccessShell({
  badge,
  description,
  links,
  title,
  children,
}: {
  badge: string;
  description: string;
  links: AccessShellLink[];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{badge}</Badge>
            <Badge variant="outline">Захищена зона</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "bg-background/80",
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Separator />
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
