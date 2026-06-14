import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PackageIcon } from "lucide-react";

import { currencyFormatter } from "@/components/storefront/product-card";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { buttonVariants } from "@/components/ui/button";
import { RepeatOrderButton } from "@/features/account/components/repeat-order-button";
import { requireAuthPage } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import { getAccountOrderDetail } from "@/server/queries/account.query";

const orderStatusLabels = {
  NEW: "Нове",
  CONFIRMED: "Підтверджено",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELED: "Скасовано",
} as const;

function normalizeOrderItemOptions(item: {
  selectedOptionName: string | null;
  selectedOptionValue: string | null;
  selectedOptions: unknown;
}) {
  if (Array.isArray(item.selectedOptions)) {
    return item.selectedOptions
      .map((option) => {
        if (!option || typeof option !== "object") {
          return null;
        }

        const current = option as {
          optionName?: unknown;
          valueName?: unknown;
        };

        if (
          typeof current.optionName !== "string" ||
          typeof current.valueName !== "string"
        ) {
          return null;
        }

        return {
          optionName: current.optionName,
          valueName: current.valueName,
        };
      })
      .filter(
        (
          option,
        ): option is { optionName: string; valueName: string } =>
          Boolean(option),
      );
  }

  if (item.selectedOptionName && item.selectedOptionValue) {
    return [
      {
        optionName: item.selectedOptionName,
        valueName: item.selectedOptionValue,
      },
    ];
  }

  return [];
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuthPage(`/account/orders/${id}`);
  const order = await getAccountOrderDetail(session.user.id, id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/account/orders"
            className={cn(buttonVariants({ variant: "ghost" }), "-ml-3 gap-2 rounded-lg")}
          >
            <ArrowLeftIcon className="size-4" />
            До замовлень
          </Link>
          <p className="text-muted-foreground mt-3 text-xs font-semibold uppercase tracking-[0.2em]">
            Замовлення
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{order.id}</h2>
        </div>
        <RepeatOrderButton orderId={order.id} className="gap-2 rounded-lg" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <StorefrontCard className="p-5">
          <h3 className="mb-4 text-lg font-semibold">Товари</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0">
                <Link
                  href={`/product/${item.productSlug}`}
                  className="bg-muted/70 grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg"
                >
                  {item.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="text-muted-foreground size-6" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="hover:text-primary font-medium"
                  >
                    {item.productTitle}
                  </Link>
                  {normalizeOrderItemOptions(item).map((option) => (
                    <p
                      key={`${option.optionName}-${option.valueName}`}
                      className="text-muted-foreground text-sm"
                    >
                      {option.optionName}: {option.valueName}
                    </p>
                  ))}
                  <p className="text-muted-foreground text-sm">
                    {item.quantity} x {currencyFormatter.format(Number(item.unitPrice))}
                  </p>
                </div>
                <p className="font-semibold">
                  {currencyFormatter.format(Number(item.lineTotal))}
                </p>
              </div>
            ))}
          </div>
        </StorefrontCard>

        <div className="space-y-5">
          <StorefrontCard className="p-5">
            <h3 className="mb-4 text-lg font-semibold">Підсумок</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Дата</span>
                <span>{order.createdAt.toLocaleDateString("uk-UA")}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Статус</span>
                <span>{orderStatusLabels[order.status]}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Сума товарів</span>
                <span>{currencyFormatter.format(Number(order.subtotalAmount))}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Знижка</span>
                <span>{currencyFormatter.format(Number(order.discountAmount))}</span>
              </div>
              <div className="border-border flex justify-between gap-3 border-t pt-3 text-base font-semibold">
                <span>Разом</span>
                <span>{currencyFormatter.format(Number(order.totalAmount))}</span>
              </div>
            </div>
          </StorefrontCard>
          <StorefrontCard className="p-5">
            <h3 className="mb-4 text-lg font-semibold">Контакти і доставка</h3>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p className="text-foreground">
                {order.firstName} {order.lastName}
              </p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
              <p>
                {order.city}, {order.addressLine1}
              </p>
              {order.customerNote ? <p>{order.customerNote}</p> : null}
            </div>
          </StorefrontCard>
        </div>
      </div>
    </div>
  );
}
