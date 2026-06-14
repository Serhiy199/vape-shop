"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import {
  addressSchema,
  passwordSchema,
  profileSchema,
} from "@/features/account/schemas";
import { auth } from "@/lib/auth/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma/client";
import {
  getAccountOrderDetail,
  getRepeatOrderProducts,
  isAccountProductOrderable,
} from "@/server/queries/account.query";

export type AccountActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  ok: boolean;
  success?: string;
};

type RepeatCartItem = {
  availability: "in_stock";
  imageAlt?: string;
  imageSrc?: string;
  price: number;
  productId: string;
  quantity: number;
  selectedOptions?: Array<{
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
    valueSlug?: string | null;
  }>;
  selectedOptionName?: string;
  selectedOptionValue?: string;
  selectedOptionValueId?: string;
  slug: string;
  title: string;
};

type RepeatOrderResult =
  | {
      addedItems: RepeatCartItem[];
      message: string;
      ok: true;
      skippedItems: string[];
    }
  | {
      error: string;
      ok: false;
    };

async function requireAccountUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}

function parseFormData(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function validationFailure(
  fieldErrors: Record<string, string[] | undefined>,
): AccountActionState {
  return {
    ok: false,
    error: "Перевірте коректність заповнених даних.",
    fieldErrors,
  };
}

function splitFullName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName: firstName || fullName.trim(),
    lastName: rest.join(" "),
  };
}

export async function updateProfileAction(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const userId = await requireAccountUserId();
  const parsed = profileSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  });

  revalidatePath("/account/profile");

  return {
    ok: true,
    success: "Профіль оновлено.",
  };
}

export async function saveAddressAction(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const userId = await requireAccountUserId();
  const parsed = addressSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  const input = parsed.data;
  const nameParts = splitFullName(input.fullName);

  await prisma.$transaction(async (tx) => {
    const addressCount = await tx.address.count({ where: { userId } });
    const shouldBeDefault = input.isDefault || addressCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    if (input.id) {
      const existingAddress = await tx.address.findFirst({
        where: {
          id: input.id,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!existingAddress) {
        return;
      }

      await tx.address.update({
        where: {
          id: input.id,
        },
        data: {
          fullName: input.fullName,
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          phone: input.phone,
          city: input.city,
          address: input.address,
          addressLine1: input.address,
          comment: input.comment,
          addressLine2: input.comment,
          isDefault: shouldBeDefault,
        },
      });
      return;
    }

    await tx.address.create({
      data: {
        userId,
        fullName: input.fullName,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        phone: input.phone,
        city: input.city,
        address: input.address,
        addressLine1: input.address,
        comment: input.comment,
        addressLine2: input.comment,
        isDefault: shouldBeDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");

  return {
    ok: true,
    success: input.id ? "Адресу оновлено." : "Адресу додано.",
  };
}

export async function deleteAddressAction(formData: FormData) {
  const userId = await requireAccountUserId();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id, userId },
      select: { isDefault: true },
    });

    if (!address) {
      return;
    }

    await tx.address.delete({
      where: { id },
    });

    if (address.isDefault) {
      const nextAddress = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (nextAddress) {
        await tx.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function makeDefaultAddressAction(formData: FormData) {
  const userId = await requireAccountUserId();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!address) {
      return;
    }

    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    await tx.address.update({
      where: { id },
      data: { isDefault: true },
    });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function changePasswordAction(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const userId = await requireAccountUserId();
  const parsed = passwordSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return {
      ok: false,
      error: "Для цього акаунта зміна пароля недоступна.",
    };
  }

  const isCurrentPasswordValid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    return {
      ok: false,
      error: "Поточний пароль неправильний.",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
    },
  });

  return {
    ok: true,
    success: "Пароль змінено.",
  };
}

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      ok: false as const,
      error: "Щоб додати товар в обране, увійдіть у акаунт.",
      code: "UNAUTHORIZED" as const,
    };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      category: { isActive: true },
      subcategory: { isActive: true },
    },
    select: { id: true },
  });

  if (!product) {
    return {
      ok: false as const,
      error: "Товар недоступний.",
    };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });
    revalidatePath("/account/wishlist");

    return {
      ok: true as const,
      isWishlisted: false,
      message: "Товар видалено з обраного.",
    };
  }

  await prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
  });
  revalidatePath("/account/wishlist");

  return {
    ok: true as const,
    isWishlisted: true,
    message: "Товар додано в обране.",
  };
}

export async function removeWishlistItemAction(formData: FormData) {
  const userId = await requireAccountUserId();
  const productId = String(formData.get("productId") ?? "");

  if (!productId) {
    return;
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });

  revalidatePath("/account/wishlist");
}

function normalizeSelectedOptions(item: {
  selectedOptionName: string | null;
  selectedOptionValue: string | null;
  selectedOptionValueId: string | null;
  selectedOptions: Prisma.JsonValue | null;
}): Array<{
  optionId?: string;
  optionName?: string;
  valueId: string;
  valueName?: string;
}> {
  if (Array.isArray(item.selectedOptions)) {
    return item.selectedOptions.flatMap((option) => {
      if (!option || typeof option !== "object" || Array.isArray(option)) {
        return [];
      }

      const current = option as {
        optionId?: unknown;
        optionName?: unknown;
        valueId?: unknown;
        valueName?: unknown;
      };

      if (typeof current.valueId !== "string") {
        return [];
      }

      return [
        {
          optionId:
            typeof current.optionId === "string" ? current.optionId : undefined,
          optionName:
            typeof current.optionName === "string"
              ? current.optionName
              : undefined,
          valueId: current.valueId,
          valueName:
            typeof current.valueName === "string"
              ? current.valueName
              : undefined,
        },
      ];
    });
  }

  if (
    item.selectedOptionName &&
    item.selectedOptionValue &&
    item.selectedOptionValueId
  ) {
    return [
      {
        optionName: item.selectedOptionName,
        valueId: item.selectedOptionValueId,
        valueName: item.selectedOptionValue,
      },
    ];
  }

  return [];
}

export async function repeatOrderAction(orderId: string): Promise<RepeatOrderResult> {
  const userId = await requireAccountUserId();
  const order = await getAccountOrderDetail(userId, orderId);

  if (!order) {
    return {
      ok: false,
      error: "Замовлення не знайдено.",
    };
  }

  const products = await getRepeatOrderProducts(
    order.items.map((item) => item.productId),
  );
  const productsById = new Map(products.map((product) => [product.id, product]));
  const addedItems: RepeatCartItem[] = [];
  const skippedItems: string[] = [];

  for (const item of order.items) {
    const product = productsById.get(item.productId);

    if (!product || !isAccountProductOrderable(product)) {
      skippedItems.push(item.productTitle);
      continue;
    }

    const storedSelectedOptions = normalizeSelectedOptions(item);
    const storedSelectedOptionsById = new Map(
      storedSelectedOptions
        .filter((option) => typeof option.optionId === "string")
        .map((option) => [option.optionId, option]),
    );
    const firstStoredOption = storedSelectedOptions[0];
    const selectedOptionValueId =
      firstStoredOption?.valueId ?? item.selectedOptionValueId;

    const firstProductOption = product.options[0] ?? null;
    const selectedOptions = product.options.flatMap((option, optionIndex) => {
      const storedOption = storedSelectedOptionsById.get(option.id);
      const legacyValueId =
        optionIndex === 0 ? selectedOptionValueId : undefined;
      const valueId = storedOption?.valueId ?? legacyValueId;
      const value = valueId
        ? option.values.find((current) => current.id === valueId)
        : (option.values[0] ?? null);

      if (!value) {
        return [];
      }

      return [
        {
          optionId: option.id,
          optionName: option.name,
          valueId: value.id,
          valueName: value.label,
          valueSlug: value.slug ?? null,
        },
      ];
    });
    const selectedOptionValue = selectedOptions[0]
      ? firstProductOption?.values.find(
          (value) => value.id === selectedOptions[0].valueId,
        )
      : null;

    addedItems.push({
      availability: "in_stock",
      imageAlt: product.images[0]?.alt ?? product.title,
      imageSrc: selectedOptionValue?.image ?? product.images[0]?.url,
      price: Number(product.price),
      productId: product.id,
      quantity: item.quantity,
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
      selectedOptionName:
        firstProductOption && selectedOptionValue
          ? firstProductOption.name
          : undefined,
      selectedOptionValue: selectedOptionValue?.label,
      selectedOptionValueId: selectedOptionValue?.id,
      slug: product.slug,
      title: product.title,
    });
  }

  if (addedItems.length === 0) {
    return {
      ok: false,
      error: "Товари з цього замовлення більше недоступні.",
    };
  }

  return {
    ok: true,
    addedItems,
    skippedItems,
    message: `${addedItems.length} товари додано в кошик. ${skippedItems.length} товарів пропущено.`,
  };
}

export async function redirectToProfileAction() {
  redirect("/account/profile");
}
