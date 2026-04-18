import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/permissions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminPage();

  return <AdminShell session={session}>{children}</AdminShell>;
}
