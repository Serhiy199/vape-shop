import { CartView } from "@/features/cart/components/cart-view";
import {
  StorefrontPageHeader,
  StorefrontSection,
} from "@/components/storefront/storefront-primitives";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[{ href: "/", label: "Головна" }, { label: "Кошик" }]}
        eyebrow="Кошик"
        title="Перевірте товари перед оформленням"
        description="Змініть кількість, видаліть зайві позиції або переходьте до checkout, коли все готово."
      />

      <StorefrontSection>
        <CartView />
      </StorefrontSection>
    </>
  );
}
