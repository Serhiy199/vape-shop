import Link from "next/link";
import { PackageSearchIcon } from "lucide-react";

import { currencyFormatter } from "@/components/storefront/product-card";
import {
  StorefrontActionLink,
  StorefrontCard,
  StorefrontEmptyState,
} from "@/components/storefront/storefront-primitives";
import { buttonVariants } from "@/components/ui/button";
import { RepeatOrderButton } from "@/features/account/components/repeat-order-button";
import { requireAuthPage } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import { listAccountOrders } from "@/server/queries/account.query";

const orderStatusLabels = {
  NEW: "Нове",
  CONFIRMED: "Підтверджено",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELED: "Скасовано",
} as const;

export default async function AccountOrdersPage() {
  const session = await requireAuthPage("/account/orders");
  const orders = await listAccountOrders(session.user.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
          Історія
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Мої замовлення</h2>
      </div>
      {orders.length === 0 ? (
        <StorefrontEmptyState
          icon={<PackageSearchIcon className="size-6" />}
          title="Замовлень ще немає"
          description="Після оформлення покупки її історія з'явиться тут."
          action={<StorefrontActionLink href="/catalog">Перейти в каталог</StorefrontActionLink>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <StorefrontCard key={order.id} className="p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="grid gap-3 sm:grid-cols-5">
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground text-xs">Номер</p>
                    <p className="font-mono text-sm font-semibold">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Дата</p>
                    <p className="text-sm">{order.createdAt.toLocaleDateString("uk-UA")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Статус</p>
                    <p className="text-sm">{orderStatusLabels[order.status]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Сума</p>
                    <p className="text-sm font-semibold">
                      {currencyFormatter.format(Number(order.totalAmount))}
                    </p>
                    <p className="text-muted-foreground text-xs">{order.itemCount} товарів</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "rounded-lg")}
                  >
                    Детальніше
                  </Link>
                  <RepeatOrderButton orderId={order.id} className="gap-2 rounded-lg" />
                </div>
              </div>
            </StorefrontCard>
          ))}
        </div>
      )}
    </div>
  );
}
