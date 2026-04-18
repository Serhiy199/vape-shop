import type { Session } from "next-auth";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SessionCard } from "@/features/auth/components/session-card";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/admin", label: "Огляд адмінки" },
  { href: "/admin/users", label: "Користувачі" },
  { href: "/", label: "Перейти на сайт" },
];

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:items-start lg:px-8">
        <aside className="hidden lg:sticky lg:top-4 lg:block lg:w-88 lg:shrink-0">
          <div className="space-y-4">
            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">Адмінка</Badge>
                  <Badge variant="outline">Етап 4</Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Панель керування магазином
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Зібрали єдиний shell для всієї адмін-зони. Тепер у нас є
                    структурована навігація, окрема робоча область і стабільна
                    точка входу для майбутніх CRUD-модулів.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <AdminNavigation />

                <Separator />

                <div className="space-y-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                    Швидкі дії
                  </p>
                  <div className="flex flex-col gap-2">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "justify-start bg-background/70",
                        )}
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <SessionCard session={session} variant="admin" />
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="flex flex-col gap-4 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                    Основа адмінки
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Адмін-панель магазину
                  </h1>
                </div>

                <div className="flex items-start justify-between gap-3 lg:hidden">
                  <p className="text-muted-foreground max-w-xl text-sm leading-6">
                    У мобільній версії навігація доступна з меню, а робоча
                    область лишається чистою та зручною для контенту.
                  </p>
                  <Sheet>
                    <SheetTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Відкрити навігацію адмінки"
                        />
                      }
                    >
                      <MenuIcon className="size-4" />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-sm">
                      <SheetHeader className="border-b border-border/70">
                        <SheetTitle>Навігація адмінки</SheetTitle>
                        <SheetDescription>
                          Виберіть розділ, з яким хочете працювати далі.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="space-y-5 p-4">
                        <AdminNavigation compact />
                        <Separator />
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                            Швидкі дії
                          </p>
                          <div className="flex flex-col gap-2">
                            {quickLinks.map((link) => (
                              <Link
                                key={link.href}
                                className={cn(
                                  buttonVariants({ variant: "outline" }),
                                  "justify-start",
                                )}
                                href={link.href}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                Усі сторінки в зоні <code>/admin/*</code> вже працюють у
                спільному каркасі з єдиною навігацією. Далі можна
                послідовно додавати screen primitives, форми й окремі модулі.
              </p>
            </CardContent>
          </Card>

          <div className="lg:hidden">
            <SessionCard session={session} variant="admin" />
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
