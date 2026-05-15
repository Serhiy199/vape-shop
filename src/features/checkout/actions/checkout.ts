"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { createStorefrontCheckoutOrder } from "@/server/services/checkout.service";

export async function createCheckoutOrderAction(input: unknown) {
  const session = await auth();
  const result = await createStorefrontCheckoutOrder(input, {
    userId: session?.user?.id,
  });

  if (result.ok) {
    revalidatePath("/admin/orders");
  }

  return result;
}
