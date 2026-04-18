import { SessionCard } from "@/features/auth/components/session-card";
import { AccessShell } from "@/features/auth/components/access-shell";
import { requireAdminPage } from "@/lib/auth/permissions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminPage();

  return (
    <AccessShell
      badge="Admin"
      description="Закрита адмін-зона. Доступ мають лише користувачі з роллю ADMIN."
      links={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/orders", label: "Orders" },
        { href: "/", label: "Storefront" },
      ]}
      title="Адмін-панель"
    >
      <SessionCard session={session} variant="admin" />
      {children}
    </AccessShell>
  );
}
