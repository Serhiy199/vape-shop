import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import {
  StorefrontPageHeader,
  StorefrontSection,
} from "@/components/storefront/storefront-primitives";
import { auth } from "@/lib/auth/auth";
import { getAccountProfile, listCheckoutAddresses } from "@/server/queries/account.query";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const [profile, addresses] = session?.user?.id
    ? await Promise.all([
        getAccountProfile(session.user.id),
        listCheckoutAddresses(session.user.id),
      ])
    : [null, []];

  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[
          { href: "/", label: "Головна" },
          { href: "/cart", label: "Кошик" },
          { label: "Оформлення" },
        ]}
        eyebrow="Checkout"
        title="Оформлення замовлення"
        description="Заповніть контактні дані, адресу доставки та оберіть спосіб оплати. Після оформлення менеджер зв'яжеться для підтвердження."
      />

      <StorefrontSection>
        <CheckoutForm addresses={addresses} profile={profile} />
      </StorefrontSection>
    </>
  );
}
