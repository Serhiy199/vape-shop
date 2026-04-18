import type { Session } from "next-auth";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getRoleLabel, isAdminRole } from "@/lib/auth/roles";

function getDisplayName(session: Session | null) {
  const firstName = session?.user?.firstName?.trim();
  const lastName = session?.user?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (fullName) {
    return fullName;
  }

  return session?.user?.email ?? "Guest";
}

export function SessionCard({
  session,
  variant = "storefront",
}: {
  session: Session | null;
  variant?: "storefront" | "admin";
}) {
  const isAuthenticated = Boolean(session?.user);
  const title =
    variant === "admin" ? "Поточна адмін-сесія" : "Стан авторизації";

  return (
    <Card
      className={
        variant === "admin"
          ? "border-border/70 bg-card/95 shadow-sm"
          : "border-border/70 bg-background/80 shadow-none"
      }
      size="sm"
    >
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isAuthenticated ? "secondary" : "outline"}>
            {isAuthenticated ? "Authenticated" : "Guest"}
          </Badge>
          {session?.user?.role ? (
            <Badge variant={isAdminRole(session.user.role) ? "default" : "outline"}>
              {getRoleLabel(session.user.role)}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card px-4 py-3">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                  Користувач
                </p>
                <p className="mt-2 font-medium">{getDisplayName(session)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card px-4 py-3">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                  Email
                </p>
                <p className="mt-2 break-all font-medium">{session?.user?.email}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 sm:col-span-2">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                  Роль
                </p>
                <p className="mt-2 font-medium">
                  {getRoleLabel(session?.user?.role)}
                </p>
              </div>
            </div>
            <LogoutButton />
          </>
        ) : (
          <p className="text-muted-foreground text-sm leading-6">
            Користувач ще не увійшов у систему. Після login тут з&apos;являться
            роль, email і кнопка виходу.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
