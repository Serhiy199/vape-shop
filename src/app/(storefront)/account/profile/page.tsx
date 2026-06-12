import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { ProfileForm } from "@/features/account/components/profile-form";
import { requireAuthPage } from "@/lib/auth/permissions";
import { getAccountProfile } from "@/server/queries/account.query";

export default async function AccountProfilePage() {
  const session = await requireAuthPage("/account/profile");
  const profile = await getAccountProfile(session.user.id);

  return (
    <StorefrontCard className="p-5">
      <div className="mb-5 space-y-1">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
          Профіль
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Мої дані</h2>
        <p className="text-muted-foreground text-sm">
          Email використовується для входу й не редагується у кабінеті.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </StorefrontCard>
  );
}
