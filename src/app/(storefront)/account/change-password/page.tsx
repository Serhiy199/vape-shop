import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { PasswordForm } from "@/features/account/components/password-form";

export default function ChangePasswordPage() {
  return (
    <StorefrontCard className="max-w-2xl p-5">
      <div className="mb-5 space-y-1">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
          Безпека
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Зміна пароля</h2>
      </div>
      <PasswordForm />
    </StorefrontCard>
  );
}
