import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { currencyFormatter } from "@/components/storefront/product-card";
import {
  StorefrontActionLink,
  StorefrontCard,
  StorefrontEmptyState,
} from "@/components/storefront/storefront-primitives";
import { WishlistProductActions } from "@/features/wishlist/components/wishlist-product-actions";
import { requireAuthPage } from "@/lib/auth/permissions";
import { listAccountWishlist } from "@/server/queries/account.query";

export default async function AccountWishlistPage() {
  const session = await requireAuthPage("/account/wishlist");
  const wishlist = await listAccountWishlist(session.user.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
          Обране
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Wishlist</h2>
      </div>
      {wishlist.length === 0 ? (
        <StorefrontEmptyState
          icon={<HeartIcon className="size-6" />}
          title="Обраних товарів ще немає"
          description="Натискайте сердечко на товарах, щоб зберегти їх тут."
          action={<StorefrontActionLink href="/catalog">Перейти в каталог</StorefrontActionLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {wishlist.map((item) => (
            <StorefrontCard key={item.id} className="p-4">
              <Link
                href={item.product.href}
                className="bg-muted/70 mb-4 grid aspect-square place-items-center overflow-hidden rounded-lg"
              >
                {item.product.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.imageSrc}
                    alt={item.product.imageAlt ?? item.product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <HeartIcon className="text-muted-foreground size-8" />
                )}
              </Link>
              <div className="space-y-3">
                <Link href={item.product.href} className="hover:text-primary font-medium">
                  {item.product.title}
                </Link>
                <p className="text-lg font-semibold">
                  {currencyFormatter.format(item.product.price)}
                </p>
                <WishlistProductActions product={item.product} />
              </div>
            </StorefrontCard>
          ))}
        </div>
      )}
    </div>
  );
}
