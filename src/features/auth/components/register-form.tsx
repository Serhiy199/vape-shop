"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import type { RegisterInput } from "@/features/auth/schemas";
import { registerSchema } from "@/features/auth/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterFormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

const initialValues: RegisterFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
};

function buildPayload(values: RegisterFormValues): RegisterInput {
  return {
    email: values.email,
    password: values.password,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
  };
}

export function RegisterForm() {
  const [values, setValues] = useState(initialValues);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [isPending, startTransition] = useTransition();

  const handleChange =
    (field: keyof RegisterFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));

      setValidationErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
      setErrorMessage(null);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSuccess(false);

    const parsed = registerSchema.safeParse(buildPayload(values));
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setValidationErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        phone: fieldErrors.phone?.[0],
      });

      return;
    }

    setValidationErrors({});

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        });

        const result = (await response.json()) as {
          error?: { message?: string };
          message?: string;
          success: boolean;
        };

        if (!response.ok || !result.success) {
          setErrorMessage(
            result.error?.message ?? "Не вдалося створити акаунт. Спробуйте ще раз.",
          );
          return;
        }

        setValues(initialValues);
        setIsSuccess(true);
      } catch {
        setErrorMessage("Не вдалося створити акаунт. Перевірте з'єднання і повторіть спробу.");
      }
    });
  };

  return (
    <Card className="border-border/70 bg-card/95 w-full max-w-xl shadow-sm backdrop-blur">
      <CardHeader className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Auth</Badge>
          <Badge variant="outline">Крок 2</Badge>
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
            Voodoo Vape
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Створення клієнтського акаунта
          </CardTitle>
          <CardDescription className="max-w-lg text-sm leading-6 sm:text-base">
            Після реєстрації акаунт буде збережений з роллю <b>CLIENT</b>. Вхід
            та сесію підключимо на наступному кроці.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ім'я</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={values.firstName}
                onChange={handleChange("firstName")}
                aria-invalid={Boolean(validationErrors.firstName)}
                placeholder="Іван"
              />
              {validationErrors.firstName ? (
                <p className="text-destructive text-sm">{validationErrors.firstName}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={values.lastName}
                onChange={handleChange("lastName")}
                aria-invalid={Boolean(validationErrors.lastName)}
                placeholder="Петренко"
              />
              {validationErrors.lastName ? (
                <p className="text-destructive text-sm">{validationErrors.lastName}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange("email")}
              aria-invalid={Boolean(validationErrors.email)}
              placeholder="user@example.com"
              required
            />
            {validationErrors.email ? (
              <p className="text-destructive text-sm">{validationErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              name="phone"
              autoComplete="tel"
              value={values.phone}
              onChange={handleChange("phone")}
              aria-invalid={Boolean(validationErrors.phone)}
              placeholder="+380 67 123 45 67"
            />
            {validationErrors.phone ? (
              <p className="text-destructive text-sm">{validationErrors.phone}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange("password")}
              aria-invalid={Boolean(validationErrors.password)}
              placeholder="Мінімум 8 символів"
              required
            />
            {validationErrors.password ? (
              <p className="text-destructive text-sm">{validationErrors.password}</p>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-xl border px-4 py-3 text-sm">
              {errorMessage}
            </div>
          ) : null}

          {isSuccess ? (
            <div className="border-primary/20 bg-primary/8 text-foreground rounded-xl border px-4 py-3 text-sm">
              Акаунт успішно створено. Тепер можна{" "}
              <Link className="font-medium underline underline-offset-4" href="/login">
                увійти
              </Link>{" "}
              з цими даними.
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="sm:min-w-40" disabled={isPending} type="submit">
              {isPending ? "Створюємо..." : "Зареєструватися"}
            </Button>
            <Link
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              href="/"
            >
              Повернутися на головну
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
