import { SessionCard } from "@/features/auth/components/session-card";
import { AccessShell } from "@/features/auth/components/access-shell";
import { requireAuthPage } from "@/lib/auth/permissions";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuthPage("/account");

  return (
    <AccessShell
      badge="Account"
      description="Приватна зона клієнта. Цей розділ відкривається лише авторизованому користувачу."
      links={[
        { href: "/account", label: "Account home" },
        { href: "/", label: "Storefront" },
      ]}
      title="Кабінет клієнта"
    >
      <SessionCard session={session} />
      {children}
    </AccessShell>
  );
}
