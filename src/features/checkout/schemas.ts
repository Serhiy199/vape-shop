import { z } from "zod";

const checkoutPaymentMethods = ["COD", "CARD_TRANSFER"] as const;

function requiredText(max: number, message: string) {
  return z.string().trim().min(1, message).max(max);
}

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .pipe(z.string().max(max).optional());
}

function idField() {
  return z.string().trim().min(1).max(191);
}

export const checkoutFieldPlaceholders = {
  firstName: "Олександр",
  lastName: "Петренко",
  phone: "+380 67 123 45 67",
  email: "example@gmail.com",
  deliveryAddress: "м. Київ, вул. Тараса Шевченка, 1",
  customerNote: "Зателефонуйте перед відправкою",
} as const;

export const checkoutPaymentOptions = [
  {
    description: "Оплата при отриманні після підтвердження менеджером.",
    label: "Накладений платіж",
    value: "COD",
  },
  {
    description:
      "Реквізити для оплати менеджер надішле окремо після замовлення.",
    label: "Оплата на карту",
    value: "CARD_TRANSFER",
  },
] as const;

export const checkoutCartItemSchema = z.object({
  productId: idField(),
  quantity: z.coerce
    .number({
      invalid_type_error: "Кількість має бути числом.",
    })
    .int("Кількість має бути цілим числом.")
    .min(1, "Мінімальна кількість товару - 1.")
    .max(99, "Максимальна кількість одного товару - 99."),
});

export const checkoutCustomerSchema = z.object({
  firstName: requiredText(100, "Вкажіть ім'я."),
  lastName: optionalText(100),
  phone: requiredText(30, "Вкажіть телефон.").min(
    5,
    "Телефон має містити мінімум 5 символів.",
  ),
  email: z
    .string()
    .trim()
    .email("Вкажіть коректний email.")
    .transform((value) => value.toLowerCase()),
  deliveryAddress: requiredText(300, "Вкажіть адресу доставки."),
  paymentMethod: z.enum(checkoutPaymentMethods, {
    invalid_type_error: "Оберіть спосіб оплати.",
    required_error: "Оберіть спосіб оплати.",
  }),
  customerNote: optionalText(1000),
});

export const createCheckoutOrderSchema = checkoutCustomerSchema
  .extend({
    items: z
      .array(checkoutCartItemSchema)
      .min(1, "Кошик порожній.")
      .max(50, "У кошику може бути не більше 50 позицій."),
  })
  .superRefine((value, ctx) => {
    const seenProductIds = new Set<string>();

    value.items.forEach((item, index) => {
      if (seenProductIds.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Один товар не можна передавати декількома позиціями.",
          path: ["items", index, "productId"],
        });
        return;
      }

      seenProductIds.add(item.productId);
    });
  });

export type CheckoutCartItemInput = z.infer<typeof checkoutCartItemSchema>;
export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CreateCheckoutOrderInput = z.infer<
  typeof createCheckoutOrderSchema
>;
