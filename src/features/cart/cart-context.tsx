"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_STORAGE_KEY = "voodoo-vape-cart";
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export type CartProductSnapshot = {
  availability?: "in_stock" | "out_of_stock";
  imageAlt?: string;
  imageSrc?: string;
  price: number;
  productId: string;
  selectedOptionName?: string;
  selectedOptionValue?: string;
  selectedOptionValueId?: string;
  slug: string;
  title: string;
};

export type CartItem = CartProductSnapshot & {
  lineItemId: string;
  quantity: number;
};

type CartContextValue = {
  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  clearCart: () => void;
  decrementItem: (lineItemId: string) => void;
  incrementItem: (lineItemId: string) => void;
  isHydrated: boolean;
  itemCount: number;
  items: CartItem[];
  removeItem: (lineItemId: string) => void;
  totalAmount: number;
  updateQuantity: (lineItemId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return MIN_QUANTITY;
  }

  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}

function normalizeStoredItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<CartItem>;

  if (
    typeof item.productId !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.title !== "string" ||
    typeof item.price !== "number"
  ) {
    return null;
  }

  return {
    availability:
      item.availability === "out_of_stock" ? "out_of_stock" : "in_stock",
    imageAlt: typeof item.imageAlt === "string" ? item.imageAlt : undefined,
    imageSrc: typeof item.imageSrc === "string" ? item.imageSrc : undefined,
    lineItemId:
      typeof item.lineItemId === "string"
        ? item.lineItemId
        : createCartLineItemId({
            productId: item.productId,
            selectedOptionValueId:
              typeof item.selectedOptionValueId === "string"
                ? item.selectedOptionValueId
                : undefined,
          }),
    price: item.price,
    productId: item.productId,
    quantity: clampQuantity(
      typeof item.quantity === "number" ? item.quantity : MIN_QUANTITY,
    ),
    selectedOptionName:
      typeof item.selectedOptionName === "string"
        ? item.selectedOptionName
        : undefined,
    selectedOptionValue:
      typeof item.selectedOptionValue === "string"
        ? item.selectedOptionValue
        : undefined,
    selectedOptionValueId:
      typeof item.selectedOptionValueId === "string"
        ? item.selectedOptionValueId
        : undefined,
    slug: item.slug,
    title: item.title,
  };
}

function createCartLineItemId(product: {
  productId: string;
  selectedOptionValueId?: string;
}) {
  return product.selectedOptionValueId
    ? `${product.productId}:${product.selectedOptionValueId}`
    : product.productId;
}

function readStoredCart() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      return [];
    }

    const parsed = JSON.parse(rawCart);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeStoredItem)
      .filter((item): item is CartItem => Boolean(item));
  } catch {
    return [];
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setItems(readStoredCart());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isHydrated, items]);

  const addItem = useCallback(
    (product: CartProductSnapshot, quantity = MIN_QUANTITY) => {
      const quantityToAdd = clampQuantity(quantity);
      const lineItemId = createCartLineItemId(product);

      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.lineItemId === lineItemId,
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.lineItemId === lineItemId
              ? {
                  ...item,
                  ...product,
                  lineItemId,
                  quantity: clampQuantity(item.quantity + quantityToAdd),
                }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            ...product,
            lineItemId,
            quantity: quantityToAdd,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((lineItemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.lineItemId !== lineItemId),
    );
  }, []);

  const updateQuantity = useCallback((lineItemId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.lineItemId === lineItemId
          ? {
              ...item,
              quantity: clampQuantity(quantity),
            }
          : item,
      ),
    );
  }, []);

  const incrementItem = useCallback((lineItemId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.lineItemId === lineItemId
          ? {
              ...item,
              quantity: clampQuantity(item.quantity + 1),
            }
          : item,
      ),
    );
  }, []);

  const decrementItem = useCallback((lineItemId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.lineItemId === lineItemId
          ? {
              ...item,
              quantity: clampQuantity(item.quantity - 1),
            }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );
  const totalAmount = useMemo(
    () =>
      roundMoney(
        items.reduce((total, item) => total + item.price * item.quantity, 0),
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      addItem,
      clearCart,
      decrementItem,
      incrementItem,
      isHydrated,
      itemCount,
      items,
      removeItem,
      totalAmount,
      updateQuantity,
    }),
    [
      addItem,
      clearCart,
      decrementItem,
      incrementItem,
      isHydrated,
      itemCount,
      items,
      removeItem,
      totalAmount,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
