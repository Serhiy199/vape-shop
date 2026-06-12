import { AddressManager } from "@/features/account/components/address-manager";
import { requireAuthPage } from "@/lib/auth/permissions";
import { listAccountAddresses } from "@/server/queries/account.query";

export default async function AccountAddressesPage() {
  const session = await requireAuthPage("/account/addresses");
  const addresses = await listAccountAddresses(session.user.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
          Доставка
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Адреси доставки</h2>
      </div>
      <AddressManager addresses={addresses} />
    </div>
  );
}
