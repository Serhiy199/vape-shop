"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminToastVariant = "error" | "success";

type AdminToastPayload = {
  message: string;
  title?: string;
  variant?: AdminToastVariant;
};

type AdminToastItem = Required<AdminToastPayload> & {
  id: number;
};

const ADMIN_TOAST_EVENT = "admin-toast";

export function showAdminToast(payload: AdminToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AdminToastPayload>(ADMIN_TOAST_EVENT, {
      detail: payload,
    }),
  );
}

export function AdminToastViewport() {
  const [items, setItems] = useState<AdminToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<AdminToastPayload>).detail;
      const id = Date.now();

      setItems((current) => [
        ...current,
        {
          id,
          message: detail.message,
          title:
            detail.title ?? (detail.variant === "error" ? "Помилка" : "Готово"),
          variant: detail.variant ?? "success",
        },
      ]);

      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 4200);
    };

    window.addEventListener(ADMIN_TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(ADMIN_TOAST_EVENT, handleToast);
    };
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 grid w-[min(420px,calc(100vw-2rem))] gap-3">
      {items.map((item) => {
        const Icon = item.variant === "error" ? XCircleIcon : CheckCircleIcon;

        return (
          <div
            key={item.id}
            className={cn(
              "bg-card rounded-xl border px-4 py-3 shadow-lg",
              item.variant === "error"
                ? "border-destructive/25"
                : "border-primary/25",
            )}
          >
            <div className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  item.variant === "error"
                    ? "text-destructive"
                    : "text-primary",
                )}
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-muted-foreground text-sm leading-6">
                  {item.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
