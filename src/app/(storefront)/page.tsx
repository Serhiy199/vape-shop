import { auth } from "@/lib/auth/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SessionCard } from "@/features/auth/components/session-card";
import { isAdminRole } from "@/lib/auth/roles";

export default async function StorefrontHomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Phase 1</Badge>
            <Badge variant="outline">Storefront + Admin</Badge>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
              Voodoo Vape
            </p>
            <CardTitle className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Technical bootstrap is ready for the next feature wave.
            </CardTitle>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
              The project now includes App Router, Tailwind, shadcn/ui,
              Prisma/Auth groundwork, alias paths, and a feature-first folder
              structure.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8" id="phase-1">
          <SessionCard session={session} />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "src/app for routes, layouts, and route handlers",
              "src/features for domain-level modules",
              "src/server for repositories, services, and queries",
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
                Open admin shell
              </a>
            ) : (
              <a className={buttonVariants()} href="/account">
                Open account
              </a>
            )}
            {session?.user && !isAdminRole(session.user.role) ? (
              <a className={buttonVariants({ variant: "outline" })} href="/account">
                Client cabinet
              </a>
            ) : null}
            {isAdminRole(session?.user?.role) ? (
              <a className={buttonVariants({ variant: "outline" })} href="/admin/users">
                Manage users
              </a>
            ) : null}
            {!session?.user ? (
              <>
                <a className={buttonVariants({ variant: "outline" })} href="/login">
                  Login
                </a>
                <a
                  className={buttonVariants({ variant: "secondary" })}
                  href="/register"
                >
                  Create client account
                </a>
              </>
            ) : null}
            <a className={buttonVariants({ variant: "outline" })} href="#phase-1">
              Review bootstrap scope
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
