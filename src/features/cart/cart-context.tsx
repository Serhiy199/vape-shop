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
  slug: string;
  title: string;
};

export type CartItem = CartProductSnapshot & {
  quantity: number;
};

type CartContextValue = {
  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  clearCart: () => void;
  decrementItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  isHydrated: boolean;
  itemCount: number;
  items: CartItem[];
  removeItem: (productId: string) => void;
  totalAmount: number;
  updateQuantity: (productId: string, quantity: number) => void;
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
    price: item.price,
    productId: item.productId,
    quantity: clampQuantity(
      typeof item.quantity === "number" ? item.quantity : MIN_QUANTITY,
    ),
    slug: item.slug,
    title: item.title,
  };
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
    setItems(readStoredCart());
    setIsHydrated(true);
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

      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.productId === product.productId,
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === product.productId
              ? {
                  ...item,
                  ...product,
                  quantity: clampQuantity(item.quantity + quantityToAdd),
                }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            ...product,
            quantity: quantityToAdd,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: clampQuantity(quantity),
            }
          : item,
      ),
    );
  }, []);

  const incrementItem = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: clampQuantity(item.quantity + 1),
            }
          : item,
      ),
    );
  }, []);

  const decrementItem = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
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
