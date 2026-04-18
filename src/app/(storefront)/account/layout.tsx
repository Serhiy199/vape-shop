import { AccessShell } from "@/features/auth/components/access-shell";
import { SessionCard } from "@/features/auth/components/session-card";
import { requireAuthPage } from "@/lib/auth/permissions";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuthPage("/account");

  return (
    <AccessShell
      badge="Кабінет"
      description="Приватна зона клієнта. Цей розділ відкривається лише авторизованому користувачу."
      links={[
        { href: "/account", label: "Головна кабінету" },
        { href: "/", label: "Магазин" },
      ]}
      title="Кабінет клієнта"
    >
      <SessionCard session={session} />
      {children}
    </AccessShell>
  );
}
