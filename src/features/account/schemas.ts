import { z } from "zod";

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z
      .string()
      .trim()
      .transform((value) => (value.length === 0 ? undefined : value))
      .pipe(z.string().max(max).optional()),
  );

export const profileSchema = z.object({
  firstName: requiredText(100, "Вкажіть ім'я."),
  lastName: optionalText(100),
  phone: requiredText(30, "Вкажіть телефон.").min(
    5,
    "Телефон має містити мінімум 5 символів.",
  ),
});

export const addressSchema = z.object({
  id: optionalText(191),
  fullName: requiredText(160, "Вкажіть ПІБ."),
  phone: requiredText(30, "Вкажіть телефон.").min(
    5,
    "Телефон має містити мінімум 5 символів.",
  ),
  city: requiredText(100, "Вкажіть місто."),
  address: requiredText(300, "Вкажіть адресу доставки."),
  comment: optionalText(500),
  isDefault: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Вкажіть поточний пароль.").max(128),
    newPassword: z
      .string()
      .min(8, "Новий пароль має містити мінімум 8 символів.")
      .max(128),
    confirmPassword: z.string().min(1, "Повторіть новий пароль.").max(128),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Новий пароль і повтор не збігаються.",
        path: ["confirmPassword"],
      });
    }
  });

export type AccountAddressInput = z.infer<typeof addressSchema>;
export type AccountProfileInput = z.infer<typeof profileSchema>;
