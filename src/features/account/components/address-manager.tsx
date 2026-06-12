"use client";

import { useActionState, useState } from "react";
import { CheckIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAddressAction,
  makeDefaultAddressAction,
  saveAddressAction,
  type AccountActionState,
} from "@/features/account/actions/account";
import { AccountFormStatus } from "@/features/account/components/account-form-status";

type AddressItem = {
  address: string | null;
  addressLine1: string;
  city: string;
  comment: string | null;
  addressLine2: string | null;
  firstName: string;
  fullName: string | null;
  id: string;
  isDefault: boolean;
  lastName: string;
  phone: string;
};

const emptyAddress = {
  id: "",
  fullName: "",
  phone: "",
  city: "",
  address: "",
  comment: "",
  isDefault: false,
};

const initialState: AccountActionState = {
  ok: false,
};

function normalizeAddress(address: AddressItem) {
  return {
    id: address.id,
    fullName:
      address.fullName ?? [address.firstName, address.lastName].filter(Boolean).join(" "),
    phone: address.phone,
    city: address.city,
    address: address.address ?? address.addressLine1,
    comment: address.comment ?? address.addressLine2 ?? "",
    isDefault: address.isDefault,
  };
}

export function AddressManager({ addresses }: { addresses: AddressItem[] }) {
  const [editingAddress, setEditingAddress] = useState(emptyAddress);
  const [state, formAction, isPending] = useActionState(saveAddressAction, initialState);

  function resetForm() {
    setEditingAddress(emptyAddress);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="border-border/70 bg-card rounded-lg border border-dashed p-8 text-center">
            <MapPinIcon className="text-muted-foreground mx-auto mb-3 size-8" />
            <h2 className="text-lg font-semibold">Адрес ще немає</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Додайте першу адресу, і вона автоматично стане основною.
            </p>
          </div>
        ) : (
          addresses.map((address) => {
            const normalized = normalizeAddress(address);

            return (
              <div
                key={address.id}
                className="border-border/70 bg-card rounded-lg border p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{normalized.fullName}</h2>
                      {address.isDefault ? (
                        <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium">
                          Основна
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-sm">{normalized.phone}</p>
                    <p className="text-sm">
                      {normalized.city}, {normalized.address}
                    </p>
                    {normalized.comment ? (
                      <p className="text-muted-foreground text-sm">
                        {normalized.comment}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!address.isDefault ? (
                      <form action={makeDefaultAddressAction}>
                        <input type="hidden" name="id" value={address.id} />
                        <Button size="sm" variant="outline" className="gap-2 rounded-lg">
                          <CheckIcon className="size-4" />
                          Основна
                        </Button>
                      </form>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-lg"
                      onClick={() => setEditingAddress(normalized)}
                      type="button"
                    >
                      <PencilIcon className="size-4" />
                      Редагувати
                    </Button>
                    <form action={deleteAddressAction}>
                      <input type="hidden" name="id" value={address.id} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive gap-2 rounded-lg"
                      >
                        <TrashIcon className="size-4" />
                        Видалити
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={formAction} className="border-border/70 bg-card h-fit rounded-lg border p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em]">
              Адреса
            </p>
            <h2 className="text-xl font-semibold">
              {editingAddress.id ? "Редагувати адресу" : "Додати адресу"}
            </h2>
          </div>
          {editingAddress.id ? (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Нова
            </Button>
          ) : null}
        </div>
        <input type="hidden" name="id" value={editingAddress.id} />
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">ПІБ</Label>
            <Input
              id="fullName"
              name="fullName"
              value={editingAddress.fullName}
              onChange={(event) =>
                setEditingAddress((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              name="phone"
              value={editingAddress.phone}
              onChange={(event) =>
                setEditingAddress((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              required
              type="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Місто</Label>
            <Input
              id="city"
              name="city"
              value={editingAddress.city}
              onChange={(event) =>
                setEditingAddress((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Адреса</Label>
            <Input
              id="address"
              name="address"
              value={editingAddress.address}
              onChange={(event) =>
                setEditingAddress((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Коментар</Label>
            <Textarea
              id="comment"
              name="comment"
              value={editingAddress.comment}
              onChange={(event) =>
                setEditingAddress((current) => ({
                  ...current,
                  comment: event.target.value,
                }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="isDefault"
              type="checkbox"
              checked={editingAddress.isDefault}
              onChange={(event) =>
                setEditingAddress((current) => ({
                  ...current,
                  isDefault: event.target.checked,
                }))
              }
            />
            Зробити основною
          </label>
        </div>
        <div className="mt-5 space-y-4">
          <AccountFormStatus error={state.error} success={state.success} />
          <Button className="w-full gap-2 rounded-lg" disabled={isPending} type="submit">
            <PlusIcon className="size-4" />
            {editingAddress.id ? "Зберегти адресу" : "Додати адресу"}
          </Button>
        </div>
      </form>
    </div>
  );
}
