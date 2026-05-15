import {
  createCheckoutOrderSchema,
  type CheckoutCartItemInput,
  type CreateCheckoutOrderInput,
} from "@/features/checkout/schemas";
import {
  createCheckoutOrder,
  isProductOrderable,
  listCheckoutProductsByIds,
  type CheckoutOrderRecord,
  type CheckoutProductRecord,
} from "@/server/repositories/checkout.repository";

type MutationSuccess<TData> = {
  data: TData;
  ok: true;
};

type MutationFailure = {
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
  ok: false;
};

export type CheckoutMutationResult<TData> =
  | MutationSuccess<TData>
  | MutationFailure;

export type CheckoutOrderSummary = {
  discountAmount: number;
  id: string;
  itemCount: number;
  paymentMethod: CheckoutOrderRecord["paymentMethod"];
  status: CheckoutOrderRecord["status"];
  subtotalAmount: number;
  totalAmount: number;
};

type NormalizedCheckoutItem = {
  lineTotal: number;
  product: CheckoutProductRecord;
  quantity: number;
  selectedOptionName?: string;
  selectedOptionValue?: string;
  selectedOptionValueId?: string;
  unitPrice: number;
};

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    ok: false as const,
    error: "Перевірте коректність заповнених даних.",
    fieldErrors,
  };
}

function ok<TData>(data: TData): CheckoutMutationResult<TData> {
  return {
    ok: true,
    data,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function extractCityFromManualAddress(deliveryAddress: string) {
  const [firstSegment] = deliveryAddress
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return firstSegment || "Адреса вказана вручну";
}

function aggregateItems(items: CheckoutCartItemInput[]) {
  const itemsByLineId = new Map<
    string,
    CheckoutCartItemInput & { quantity: number }
  >();

  items.forEach((item) => {
    const lineItemId = item.selectedOptionValueId
      ? `${item.productId}:${item.selectedOptionValueId}`
      : item.productId;
    const current = itemsByLineId.get(lineItemId);

    itemsByLineId.set(lineItemId, {
      ...item,
      quantity: (current?.quantity ?? 0) + item.quantity,
    });
  });

  return [...itemsByLineId.values()];
}

async function resolveCheckoutItems(items: CheckoutCartItemInput[]) {
  const aggregatedItems = aggregateItems(items);
  const products = await listCheckoutProductsByIds(
    aggregatedItems.map((item) => item.productId),
  );
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );

  const normalizedItems: NormalizedCheckoutItem[] = [];

  for (const item of aggregatedItems) {
    const product = productsById.get(item.productId);

    if (!product) {
      return {
        ok: false as const,
        error: "Один із товарів у кошику більше не існує.",
      };
    }

    if (!isProductOrderable(product)) {
      return {
        ok: false as const,
        error: `Товар "${product.title}" зараз недоступний для замовлення.`,
      };
    }

    const unitPrice = Number(product.price);
    const lineTotal = roundMoney(unitPrice * item.quantity);

    normalizedItems.push({
      lineTotal,
      product,
      quantity: item.quantity,
      selectedOptionName: item.selectedOptionName,
      selectedOptionValue: item.selectedOptionValue,
      selectedOptionValueId: item.selectedOptionValueId,
      unitPrice,
    });
  }

  return {
    ok: true as const,
    data: normalizedItems,
  };
}

function mapOrderToSummary(order: CheckoutOrderRecord): CheckoutOrderSummary {
  return {
    discountAmount: Number(order.discountAmount),
    id: order.id,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    paymentMethod: order.paymentMethod,
    status: order.status,
    subtotalAmount: Number(order.subtotalAmount),
    totalAmount: Number(order.totalAmount),
  };
}

export async function createStorefrontCheckoutOrder(
  input: unknown,
  context?: {
    userId?: string;
  },
): Promise<CheckoutMutationResult<CheckoutOrderSummary>> {
  const parsed = createCheckoutOrderSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const payload: CreateCheckoutOrderInput = parsed.data;
  const resolvedItems = await resolveCheckoutItems(payload.items);

  if (!resolvedItems.ok) {
    return {
      ok: false,
      error: resolvedItems.error,
    };
  }

  const subtotalAmount = roundMoney(
    resolvedItems.data.reduce((total, item) => total + item.lineTotal, 0),
  );
  const discountAmount = 0;
  const totalAmount = roundMoney(subtotalAmount - discountAmount);

  const order = await createCheckoutOrder({
    addressLine1: payload.deliveryAddress,
    city: extractCityFromManualAddress(payload.deliveryAddress),
    customerNote: payload.customerNote,
    discountAmount,
    email: payload.email,
    firstName: payload.firstName,
    items: resolvedItems.data.map((item) => ({
      lineTotal: item.lineTotal,
      productId: item.product.id,
      productSlug: item.product.slug,
      productTitle: item.product.title,
      quantity: item.quantity,
      selectedOptionName: item.selectedOptionName,
      selectedOptionValue: item.selectedOptionValue,
      selectedOptionValueId: item.selectedOptionValueId,
      unitPrice: item.unitPrice,
    })),
    lastName: payload.lastName,
    paymentMethod: payload.paymentMethod,
    phone: payload.phone,
    subtotalAmount,
    totalAmount,
    userId: context?.userId,
  });

  return ok(mapOrderToSummary(order));
}
