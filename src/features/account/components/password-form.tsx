"use client";

import { useActionState } from "react";
import { KeyRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountActionState } from "@/features/account/actions/account";
import { changePasswordAction } from "@/features/account/actions/account";
import { AccountFormStatus } from "@/features/account/components/account-form-status";

const initialState: AccountActionState = {
  ok: false,
};

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Поточний пароль</Label>
          <Input id="currentPassword" name="currentPassword" required type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Новий пароль</Label>
          <Input id="newPassword" name="newPassword" minLength={8} required type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Повтор нового пароля</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            minLength={8}
            required
            type="password"
          />
          {state.fieldErrors?.confirmPassword ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          ) : null}
        </div>
      </div>
      <AccountFormStatus error={state.error} success={state.success} />
      <Button className="gap-2 rounded-lg" disabled={isPending} type="submit">
        <KeyRoundIcon className="size-4" />
        Змінити пароль
      </Button>
    </form>
  );
}
