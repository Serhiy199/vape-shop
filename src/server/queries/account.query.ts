import { ProductAvailability, type Prisma } from "@prisma/client";

import { currencyFormatter } from "@/components/storefront/product-card";
import type { StorefrontProductCardItem } from "@/components/storefront/product-types";
import { prisma } from "@/lib/prisma/client";

const accountProductSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  availability: true,
  isActive: true,
  category: {
    select: {
      isActive: true,
    },
  },
  subcategory: {
    select: {
      isActive: true,
    },
  },
  brand: {
    select: {
      name: true,
      isActive: true,
    },
  },
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
  options: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      values: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          image: true,
          label: true,
          slug: true,
        },
      },
    },
  },
  _count: {
    select: {
      orderItems: true,
      wishlistItems: true,
    },
  },
} satisfies Prisma.ProductSelect;

export type AccountProductRecord = Prisma.ProductGetPayload<{
  select: typeof accountProductSelect;
}>;

function mapProductToCard(product: AccountProductRecord): StorefrontProductCardItem {
  const primaryImage = product.images[0];

  return {
    availability:
      product.availability === ProductAvailability.IN_STOCK
        ? "in_stock"
        : "out_of_stock",
    brand: product.brand?.name,
    href: `/product/${product.slug}`,
    id: product.id,
    imageAlt: primaryImage?.alt ?? product.title,
    imageSrc: primaryImage?.url,
    price: Number(product.price),
    productId: product.id,
    rating: 5,
    reviewCount: product._count.orderItems + product._count.wishlistItems,
    slug: product.slug,
    title: product.title,
    type: "product",
  };
}

export function isAccountProductOrderable(product: AccountProductRecord) {
  return (
    product.isActive &&
    product.category.isActive &&
    product.subcategory.isActive &&
    (product.brand ? product.brand.isActive : true) &&
    product.availability === ProductAvailability.IN_STOCK
  );
}

export async function getAccountProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  });
}

export async function listAccountOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      totalAmount: true,
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  return orders.map((order) => ({
    ...order,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    totalLabel: currencyFormatter.format(Number(order.totalAmount)),
  }));
}

export async function getAccountOrderDetail(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    select: {
      id: true,
      createdAt: true,
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
      items: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          productId: true,
          productTitle: true,
          productSlug: true,
          productImage: true,
          selectedOptions: true,
          selectedOptionName: true,
          selectedOptionValue: true,
          selectedOptionValueId: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
        },
      },
    },
  });
}

export async function listAccountAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      fullName: true,
      firstName: true,
      lastName: true,
      phone: true,
      city: true,
      address: true,
      addressLine1: true,
      comment: true,
      addressLine2: true,
      isDefault: true,
    },
  });
}

export async function listCheckoutAddresses(userId?: string) {
  if (!userId) {
    return [];
  }

  const addresses = await listAccountAddresses(userId);

  return addresses.map((address) => ({
    id: address.id,
    fullName:
      address.fullName ??
      [address.firstName, address.lastName].filter(Boolean).join(" "),
    phone: address.phone,
    city: address.city,
    address: address.address ?? address.addressLine1,
    comment: address.comment ?? address.addressLine2 ?? "",
    isDefault: address.isDefault,
  }));
}

export async function listAccountWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      product: {
        select: accountProductSelect,
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    createdAt: item.createdAt,
    product: mapProductToCard(item.product),
  }));
}

export async function getRepeatOrderProducts(productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: accountProductSelect,
  });
}
