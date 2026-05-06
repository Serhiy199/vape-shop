import {
  OrderStatus,
  ProductAvailability,
  type PaymentMethod,
  type Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

const checkoutProductSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  availability: true,
  isActive: true,
  images: {
    orderBy: [
      { isPrimary: "desc" },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    take: 1,
    select: {
      alt: true,
      url: true,
    },
  },
} satisfies Prisma.ProductSelect;

const checkoutOrderSelect = {
  id: true,
  status: true,
  paymentMethod: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  city: true,
  addressLine1: true,
  addressLine2: true,
  customerNote: true,
  subtotalAmount: true,
  discountAmount: true,
  totalAmount: true,
  createdAt: true,
  items: {
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      productId: true,
      productTitle: true,
      productSlug: true,
      unitPrice: true,
      quantity: true,
      lineTotal: true,
    },
  },
} satisfies Prisma.OrderSelect;

export type CheckoutProductRecord = Prisma.ProductGetPayload<{
  select: typeof checkoutProductSelect;
}>;

export type CheckoutOrderRecord = Prisma.OrderGetPayload<{
  select: typeof checkoutOrderSelect;
}>;

export type CheckoutOrderItemWriteInput = {
  lineTotal: number;
  productId: string;
  productSlug: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
};

export async function listCheckoutProductsByIds(productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: checkoutProductSelect,
  });
}

export function isProductOrderable(product: CheckoutProductRecord) {
  return (
    product.isActive && product.availability === ProductAvailability.IN_STOCK
  );
}

export async function createCheckoutOrder(input: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  customerNote?: string;
  discountAmount: number;
  email: string;
  firstName: string;
  items: CheckoutOrderItemWriteInput[];
  lastName?: string;
  paymentMethod: PaymentMethod;
  phone: string;
  subtotalAmount: number;
  totalAmount: number;
  userId?: string;
}) {
  return prisma.order.create({
    data: {
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      customerNote: input.customerNote,
      discountAmount: input.discountAmount,
      email: input.email,
      firstName: input.firstName,
      items: {
        create: input.items.map((item) => ({
          lineTotal: item.lineTotal,
          productId: item.productId,
          productSlug: item.productSlug,
          productTitle: item.productTitle,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
      lastName: input.lastName ?? "",
      paymentMethod: input.paymentMethod,
      phone: input.phone,
      status: OrderStatus.NEW,
      subtotalAmount: input.subtotalAmount,
      totalAmount: input.totalAmount,
      userId: input.userId,
    },
    select: checkoutOrderSelect,
  });
}
