import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SessionCard } from "@/features/auth/components/session-card";
import { auth } from "@/lib/auth/auth";
import { isAdminRole } from "@/lib/auth/roles";

export default async function StorefrontHomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Етап 1</Badge>
            <Badge variant="outline">Магазин + адмінка</Badge>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
              Voodoo Vape
            </p>
            <CardTitle className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Технічний фундамент готовий до наступних етапів розробки.
            </CardTitle>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
              У проєкті вже є App Router, Tailwind, shadcn/ui, базова інтеграція
              Prisma/Auth, alias-шляхи та модульна структура папок.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8" id="phase-1">
          <SessionCard session={session} />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "src/app для маршрутів, layout-файлів і route handlers",
              "src/features для доменних модулів",
              "src/server для репозиторіїв, сервісів і запитів",
            ].map((item) => (
              <div
                key={item}
                className="border-border/70 bg-background/80 text-muted-foreground rounded-2xl border p-4 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex flex-wrap gap-3">
            {isAdminRole(session?.user?.role) ? (
              <a className={buttonVariants()} href="/admin">
                Відкрити адмінку
              </a>
            ) : (
              <a className={buttonVariants()} href="/account">
                Відкрити кабінет
              </a>
            )}
            {session?.user && !isAdminRole(session.user.role) ? (
              <a className={buttonVariants({ variant: "outline" })} href="/account">
                Кабінет клієнта
              </a>
            ) : null}
            {isAdminRole(session?.user?.role) ? (
              <a className={buttonVariants({ variant: "outline" })} href="/admin/users">
                Користувачі
              </a>
            ) : null}
            {!session?.user ? (
              <>
                <a className={buttonVariants({ variant: "outline" })} href="/login">
                  Увійти
                </a>
                <a
                  className={buttonVariants({ variant: "secondary" })}
                  href="/register"
                >
                  Створити акаунт
                </a>
              </>
            ) : null}
            <a className={buttonVariants({ variant: "outline" })} href="#phase-1">
              Подивитися стартовий обсяг
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
