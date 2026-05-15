"use client";

import Link from "next/link";
import {
  ImageIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  Trash2Icon,
} from "lucide-react";

import { currencyFormatter } from "@/components/storefront/product-card";
import {
  StorefrontActionLink,
  StorefrontCard,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/features/cart/cart-context";

function CartProductMedia({ item }: { item: CartItem }) {
  return (
    <Link
      href={`/product/${item.slug}`}
      className="bg-muted/70 grid aspect-square size-24 shrink-0 place-items-center overflow-hidden rounded-lg sm:size-28"
    >
      {item.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageSrc}
          alt={item.imageAlt ?? item.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon className="text-muted-foreground size-8" />
      )}
    </Link>
  );
}

function CartQuantityControls({ item }: { item: CartItem }) {
  const { decrementItem, incrementItem, removeItem, updateQuantity } =
    useCart();

  return (
    <div className="flex items-center gap-2">
      <div className="border-border bg-background flex h-10 items-center rounded-lg border">
        <Button
          aria-label="Зменшити кількість"
          className="size-10 rounded-r-none border-0"
          disabled={item.quantity <= 1}
          onClick={() => decrementItem(item.lineItemId)}
          size="icon"
          type="button"
          variant="outline"
        >
          <MinusIcon className="size-4" />
        </Button>
        <input
          aria-label="Кількість товару"
          className="border-border h-10 w-12 border-x bg-transparent text-center text-sm font-medium outline-none"
          inputMode="numeric"
          min={1}
          max={99}
          onChange={(event) =>
            updateQuantity(item.lineItemId, Number(event.target.value))
          }
          type="number"
          value={item.quantity}
        />
        <Button
          aria-label="Збільшити кількість"
          className="size-10 rounded-l-none border-0"
          disabled={item.quantity >= 99}
          onClick={() => incrementItem(item.lineItemId)}
          size="icon"
          type="button"
          variant="outline"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
      <Button
        aria-label="Видалити товар"
        onClick={() => removeItem(item.lineItemId)}
        size="icon"
        type="button"
        variant="destructive"
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  return (
    <StorefrontCard className="p-3 sm:p-4">
      <div className="flex gap-4">
        <CartProductMedia item={item} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Link
                href={`/product/${item.slug}`}
                className="hover:text-primary line-clamp-2 font-medium"
              >
                {item.title}
              </Link>
              <p className="text-muted-foreground text-sm">
                {currencyFormatter.format(item.price)} за одиницю
              </p>
              {item.selectedOptionName && item.selectedOptionValue ? (
                <p className="text-muted-foreground text-sm">
                  {item.selectedOptionName}: {item.selectedOptionValue}
                </p>
              ) : null}
            </div>
            <p className="text-lg font-semibold tracking-tight">
              {currencyFormatter.format(item.price * item.quantity)}
            </p>
          </div>
          <CartQuantityControls item={item} />
        </div>
      </div>
    </StorefrontCard>
  );
}

function EmptyCart() {
  return (
    <StorefrontCard className="grid place-items-center p-8 text-center">
      <div className="max-w-sm space-y-4">
        <span className="bg-muted text-muted-foreground mx-auto grid size-14 place-items-center rounded-lg">
          <ShoppingBagIcon className="size-7" />
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Кошик порожній
          </h2>
          <p className={storefrontPatterns.bodyText}>
            Додайте товари з каталогу, а потім поверніться сюди для перевірки
            замовлення.
          </p>
        </div>
        <StorefrontActionLink href="/catalog" size="default">
          Перейти в каталог
        </StorefrontActionLink>
      </div>
    </StorefrontCard>
  );
}

export function CartView() {
  const { clearCart, isHydrated, itemCount, items, totalAmount } = useCart();

  if (!isHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <StorefrontCard className="h-64 animate-pulse p-5" />
        <StorefrontCard className="h-64 animate-pulse p-5" />
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-3">
        {items.map((item) => (
          <CartItemRow key={item.lineItemId} item={item} />
        ))}
      </div>

      <aside className="lg:sticky lg:top-40 lg:self-start">
        <StorefrontCard className="p-5">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className={storefrontPatterns.eyebrow}>Ваше замовлення</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Разом до оформлення
              </h2>
            </div>

            <div className="border-border/70 bg-background grid gap-3 rounded-lg border p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Товарів</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Сума товарів</span>
                <span className="font-medium">
                  {currencyFormatter.format(totalAmount)}
                </span>
              </div>
              <div className="border-border flex items-center justify-between gap-3 border-t pt-3">
                <span className="font-medium">До сплати</span>
                <span className="text-xl font-semibold">
                  {currencyFormatter.format(totalAmount)}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <StorefrontActionLink
                href="/checkout"
                className="h-11 w-full justify-center"
              >
                Оформити замовлення
              </StorefrontActionLink>
              <Button
                className="h-10 rounded-lg"
                onClick={clearCart}
                type="button"
                variant="outline"
              >
                Очистити кошик
              </Button>
            </div>

            <div className="text-muted-foreground space-y-2 text-sm leading-6">
              <p>
                На checkout менеджер отримає ваше замовлення й підтвердить
                деталі доставки вручну.
              </p>
              <p>
                Доступні способи оплати: накладений платіж або оплата на карту.
              </p>
            </div>
          </div>
        </StorefrontCard>
      </aside>
    </div>
  );
}
