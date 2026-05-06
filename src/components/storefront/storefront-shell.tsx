import { AgeGate } from "@/components/storefront/age-gate";
import { CookieConfirm } from "@/components/storefront/cookie-confirm";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { CartProvider } from "@/features/cart/cart-context";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="bg-background text-foreground min-h-screen">
        <StorefrontHeader />
        <main className="min-h-[calc(100vh-420px)]">{children}</main>
        <StorefrontFooter />
        <AgeGate />
        <CookieConfirm />
      </div>
    </CartProvider>
  );
}
