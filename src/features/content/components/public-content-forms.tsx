"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { ReviewType } from "@prisma/client";

import {
  submitContactRequestAction,
  submitReviewAction,
} from "@/features/content/actions/content";

export function ContactRequestForm({ enabled = true }: { enabled?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await submitContactRequestAction({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        comment: String(formData.get("comment") ?? ""),
        website: String(formData.get("website") ?? ""),
      });

      if (result.ok) {
        setMessage("Дякуємо! Заявку відправлено.");
        form.reset();
      } else {
        setMessage(result.error ?? "Не вдалося відправити заявку.");
      }
    });
  };

  if (!enabled) {
    return (
      <p className="text-muted-foreground text-sm">
        Форма тимчасово вимкнена. Зв&apos;яжіться з нами телефоном або email.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="firstName"
          required
          placeholder="Ім'я"
          className="border-input bg-background rounded-lg border px-4 py-3"
        />
        <input
          name="lastName"
          placeholder="Прізвище"
          className="border-input bg-background rounded-lg border px-4 py-3"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border-input bg-background rounded-lg border px-4 py-3"
        />
        <input
          name="phone"
          placeholder="Телефон"
          className="border-input bg-background rounded-lg border px-4 py-3"
        />
      </div>
      <textarea
        name="comment"
        required
        rows={5}
        placeholder="Коментар"
        className="border-input bg-background w-full rounded-lg border px-4 py-3"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "Відправляємо..." : "Відправити"}
      </button>
      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
    </form>
  );
}

export function ReviewSubmitForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await submitReviewAction({
        type: String(formData.get("type") ?? ReviewType.STORE),
        name: String(formData.get("name") ?? ""),
        rating: String(formData.get("rating") ?? "5"),
        text: String(formData.get("text") ?? ""),
      });

      if (result.ok) {
        setMessage("Дякуємо! Відгук зʼявиться після модерації.");
        form.reset();
      } else {
        setMessage(result.error ?? "Не вдалося відправити відгук.");
      }
    });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <select
        name="type"
        className="border-input bg-background w-full rounded-lg border px-4 py-3"
      >
        <option value={ReviewType.STORE}>Про магазин</option>
        <option value={ReviewType.PRODUCT}>Про товар</option>
      </select>
      <input
        name="name"
        required
        placeholder="Ваше ім'я"
        className="border-input bg-background w-full rounded-lg border px-4 py-3"
      />
      <input
        name="rating"
        required
        type="number"
        min={1}
        max={5}
        defaultValue={5}
        className="border-input bg-background w-full rounded-lg border px-4 py-3"
      />
      <textarea
        name="text"
        required
        rows={4}
        placeholder="Ваш відгук"
        className="border-input bg-background w-full rounded-lg border px-4 py-3"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "Відправляємо..." : "Залишити відгук"}
      </button>
      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
    </form>
  );
}
