"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

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
import { loginAction } from "@/features/auth/actions/login";

const initialLoginFormState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="sm:min-w-36" disabled={pending} type="submit">
      {pending ? "Входимо..." : "Увійти"}
    </Button>
  );
}

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(loginAction, initialLoginFormState);

  return (
    <Card className="border-border/70 bg-card/95 w-full max-w-lg shadow-sm backdrop-blur">
      <CardHeader className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Авторизація</Badge>
          <Badge variant="outline">Крок 3</Badge>
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
            Voodoo Vape
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Вхід до акаунта
          </CardTitle>
          <CardDescription className="max-w-lg text-sm leading-6 sm:text-base">
            Увійдіть за електронною поштою та паролем, які ви створили на
            попередньому кроці.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-2">
            <Label htmlFor="email">Електронна пошта</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Ваш пароль"
              required
            />
          </div>

          {state.error ? (
            <div className="border-destructive/20 bg-destructive/8 text-destructive rounded-xl border px-4 py-3 text-sm">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SubmitButton />
            <Link
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              href="/register"
            >
              Створити новий акаунт
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
