"use client";

import { useActionState } from "react";
import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountActionState } from "@/features/account/actions/account";
import { updateProfileAction } from "@/features/account/actions/account";
import { AccountFormStatus } from "@/features/account/components/account-form-status";

type Profile = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

const initialState: AccountActionState = {
  ok: false,
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ім&apos;я</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={profile.firstName ?? ""}
            required
          />
          {state.fieldErrors?.firstName ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.firstName[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Прізвище</Label>
          <Input id="lastName" name="lastName" defaultValue={profile.lastName ?? ""} />
          {state.fieldErrors?.lastName ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.lastName[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phone ?? ""}
            required
            type="tel"
          />
          {state.fieldErrors?.phone ? (
            <p className="text-destructive text-sm">{state.fieldErrors.phone[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} readOnly />
        </div>
      </div>
      <AccountFormStatus error={state.error} success={state.success} />
      <Button className="gap-2 rounded-lg" disabled={isPending} type="submit">
        <SaveIcon className="size-4" />
        Зберегти
      </Button>
    </form>
  );
}
