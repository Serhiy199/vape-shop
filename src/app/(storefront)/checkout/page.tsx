import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import {
  StorefrontPageHeader,
  StorefrontSection,
} from "@/components/storefront/storefront-primitives";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
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
        <CheckoutForm />
      </StorefrontSection>
    </>
  );
}
