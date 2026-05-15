"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { CreditCardIcon, PackageCheckIcon, TruckIcon } from "lucide-react";

import { currencyFormatter } from "@/components/storefront/product-card";
import {
  StorefrontActionLink,
  StorefrontCard,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  checkoutFieldPlaceholders,
  checkoutPaymentOptions,
} from "@/features/checkout/schemas";
import { createCheckoutOrderAction } from "@/features/checkout/actions/checkout";
import { useCart } from "@/features/cart/cart-context";
import { cn } from "@/lib/utils";

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

function CheckoutField({
  autoComplete,
  label,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  autoComplete?: string;
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      <Input
        autoComplete={autoComplete}
        className="bg-background h-11"
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

function EmptyCheckout() {
  return (
    <StorefrontCard className="grid place-items-center p-8 text-center">
      <div className="max-w-sm space-y-4">
        <span className="bg-muted text-muted-foreground mx-auto grid size-14 place-items-center rounded-lg">
          <PackageCheckIcon className="size-7" />
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Checkout очікує товари
          </h2>
          <p className={storefrontPatterns.bodyText}>
            Додайте товари в кошик, перевірте кількість і поверніться до
            оформлення.
          </p>
        </div>
        <StorefrontActionLink href="/catalog" size="default">
          Перейти в каталог
        </StorefrontActionLink>
      </div>
    </StorefrontCard>
  );
}

export function CheckoutForm() {
  const { clearCart, isHydrated, itemCount, items, totalAmount } = useCart();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      customerNote: formData.get("customerNote"),
      deliveryAddress: formData.get("deliveryAddress"),
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedOptionName: item.selectedOptionName,
        selectedOptionValue: item.selectedOptionValue,
        selectedOptionValueId: item.selectedOptionValueId,
      })),
      lastName: formData.get("lastName"),
      paymentMethod: formData.get("paymentMethod"),
      phone: formData.get("phone"),
    };

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(() => {
      void createCheckoutOrderAction(payload).then((result) => {
        if (!result.ok) {
          setErrorMessage(result.error);
          return;
        }

        clearCart();
        setSuccessMessage(`Замовлення ${result.data.id} створено.`);
      });
    });
  }

  if (!isHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <StorefrontCard className="h-96 animate-pulse p-5" />
        <StorefrontCard className="h-80 animate-pulse p-5" />
      </div>
    );
  }

  if (items.length === 0 && successMessage) {
    return (
      <StorefrontCard className="grid place-items-center p-8 text-center">
        <div className="max-w-sm space-y-4">
          <span className="bg-primary/10 text-primary mx-auto grid size-14 place-items-center rounded-lg">
            <PackageCheckIcon className="size-7" />
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Замовлення створено
            </h2>
            <p className={storefrontPatterns.bodyText}>{successMessage}</p>
          </div>
          <StorefrontActionLink href="/catalog" size="default">
            Повернутися в каталог
          </StorefrontActionLink>
        </div>
      </StorefrontCard>
    );
  }

  if (items.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form id="checkout-form" className="space-y-5" onSubmit={handleSubmit}>
        <StorefrontCard className="p-5">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className={storefrontPatterns.eyebrow}>Контактні дані</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Хто оформлює замовлення
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CheckoutField
                autoComplete="given-name"
                label="Ім'я"
                name="firstName"
                placeholder={checkoutFieldPlaceholders.firstName}
                required
              />
              <CheckoutField
                autoComplete="family-name"
                label="Прізвище"
                name="lastName"
                placeholder={checkoutFieldPlaceholders.lastName}
              />
              <CheckoutField
                autoComplete="tel"
                label="Телефон"
                name="phone"
                placeholder={checkoutFieldPlaceholders.phone}
                required
                type="tel"
              />
              <CheckoutField
                autoComplete="email"
                label="Email"
                name="email"
                placeholder={checkoutFieldPlaceholders.email}
                required
                type="email"
              />
            </div>
          </div>
        </StorefrontCard>

        <StorefrontCard className="p-5">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className={storefrontPatterns.eyebrow}>Доставка</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Адреса доставки
              </h2>
              <p className={storefrontPatterns.bodyText}>
                Вкажіть адресу вручну. Відділення та поштового оператора
                менеджер уточнить після замовлення.
              </p>
            </div>

            <CheckoutField
              autoComplete="street-address"
              label="Адреса доставки"
              name="deliveryAddress"
              placeholder={checkoutFieldPlaceholders.deliveryAddress}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="customerNote">Коментар</Label>
              <Textarea
                className="bg-background min-h-24"
                id="customerNote"
                name="customerNote"
                placeholder={checkoutFieldPlaceholders.customerNote}
              />
            </div>
          </div>
        </StorefrontCard>

        <StorefrontCard className="p-5">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className={storefrontPatterns.eyebrow}>Оплата</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Спосіб оплати
              </h2>
            </div>

            <div className="grid gap-3">
              {checkoutPaymentOptions.map((option, index) => (
                <label
                  key={option.value}
                  className={cn(
                    "border-border/70 bg-background hover:border-primary/40 flex cursor-pointer gap-3 rounded-lg border p-4 transition",
                    index === 0 && "ring-primary/15 ring-2",
                  )}
                >
                  <input
                    className="accent-primary mt-1 size-4"
                    defaultChecked={index === 0}
                    name="paymentMethod"
                    required
                    type="radio"
                    value={option.value}
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">{option.label}</span>
                    <span className="text-muted-foreground block text-sm leading-6">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </StorefrontCard>

        {errorMessage ? (
          <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-2xl border px-4 py-3 text-sm">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="border-primary/20 bg-primary/8 rounded-2xl border px-4 py-3 text-sm">
            {successMessage}
          </div>
        ) : null}

        <div className="lg:hidden">
          <Button
            className="h-12 w-full rounded-lg"
            disabled={isPending}
            type="submit"
          >
            Перейти до створення замовлення
          </Button>
        </div>
      </form>

      <aside className="lg:sticky lg:top-40 lg:self-start">
        <StorefrontCard className="p-5">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className={storefrontPatterns.eyebrow}>Підсумок</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ваше замовлення
              </h2>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.lineItemId} className="flex gap-3 text-sm">
                  <Link
                    href={`/product/${item.slug}`}
                    className="bg-muted/70 grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg"
                  >
                    {item.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageSrc}
                        alt={item.imageAlt ?? item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PackageCheckIcon className="text-muted-foreground size-5" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="hover:text-primary line-clamp-2 font-medium"
                    >
                      {item.title}
                    </Link>
                    <p className="text-muted-foreground">
                      {item.quantity} x {currencyFormatter.format(item.price)}
                    </p>
                    {item.selectedOptionName && item.selectedOptionValue ? (
                      <p className="text-muted-foreground">
                        {item.selectedOptionName}: {item.selectedOptionValue}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-border/70 bg-background grid gap-3 rounded-lg border p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Товарів</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Доставка</span>
                <span className="font-medium">Уточнить менеджер</span>
              </div>
              <div className="border-border flex items-center justify-between gap-3 border-t pt-3">
                <span className="font-medium">Сума товарів</span>
                <span className="text-xl font-semibold">
                  {currencyFormatter.format(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              className="hidden h-12 w-full rounded-lg lg:inline-flex"
              disabled={isPending}
              form="checkout-form"
              type="submit"
            >
              Перейти до створення замовлення
            </Button>

            <div className="text-muted-foreground grid gap-3 text-sm leading-6">
              <span className="inline-flex gap-3">
                <TruckIcon className="text-primary mt-0.5 size-5 shrink-0" />
                Менеджер уточнить доставку після отримання заявки.
              </span>
              <span className="inline-flex gap-3">
                <CreditCardIcon className="text-primary mt-0.5 size-5 shrink-0" />
                Онлайн-оплата на MVP не підключається.
              </span>
            </div>
          </div>
        </StorefrontCard>
      </aside>
    </div>
  );
}
