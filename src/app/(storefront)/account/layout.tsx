import { AccountNav } from "@/features/account/components/account-nav";
import { requireAuthPage } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthPage("/account");

  return (
    <section className="bg-background">
      <div className="mx-auto grid w-full max-w-screen-2xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border-border/70 bg-card rounded-lg border p-4">
            <div className="mb-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
                Кабінет
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Особистий кабінет
              </h1>
            </div>
            <AccountNav />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </section>
  );
}
