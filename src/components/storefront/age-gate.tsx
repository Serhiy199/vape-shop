"use client";

import { useEffect, useState } from "react";
import { ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const AGE_GATE_STORAGE_KEY = "voodoo-vape-age-confirmed";
const AGE_GATE_SESSION_KEY = "voodoo-vape-age-session";
const AGE_GATE_COOKIE_KEY = "voodoo_vape_age_confirmed";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function getCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setConsentCookie(name: string) {
  document.cookie = `${name}=true; Max-Age=${ONE_YEAR_IN_SECONDS}; Path=/; SameSite=Lax`;
}

function hasAgeConfirmation() {
  return (
    window.localStorage.getItem(AGE_GATE_STORAGE_KEY) === "true" ||
    window.sessionStorage.getItem(AGE_GATE_SESSION_KEY) === "true" ||
    getCookie(AGE_GATE_COOKIE_KEY) === "true"
  );
}

export function AgeGate() {
  const [isReady, setIsReady] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const confirmed = hasAgeConfirmation();

      setIsConfirmed(confirmed);
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isReady || isConfirmed) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isConfirmed, isReady]);

  if (!isReady || isConfirmed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/85 px-4 backdrop-blur-md">
      <div
        aria-describedby="age-gate-description"
        aria-labelledby="age-gate-title"
        aria-modal="true"
        role="dialog"
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-2xl"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheckIcon className="size-6" />
        </span>
        <p className="text-muted-foreground mt-5 text-xs font-medium uppercase tracking-[0.22em]">
          Підтвердження віку
        </p>
        <h2 id="age-gate-title" className="mt-3 text-2xl font-semibold tracking-tight">
          Вам уже є 18 років?
        </h2>
        <p id="age-gate-description" className="text-muted-foreground mt-3 text-sm leading-6">
          Voodoo Vape призначений тільки для повнолітніх клієнтів. Підтвердіть
          вік, щоб переглядати каталог, товари та інформаційні сторінки магазину.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            className="h-11 rounded-lg"
            disabled={!isReady}
            onClick={() => {
              window.localStorage.setItem(AGE_GATE_STORAGE_KEY, "true");
              window.sessionStorage.setItem(AGE_GATE_SESSION_KEY, "true");
              setConsentCookie(AGE_GATE_COOKIE_KEY);
              window.dispatchEvent(new Event("voodoo-vape-age-confirmed"));
              setIsConfirmed(true);
            }}
          >
            Так, мені є 18+
          </Button>
          <Button
            className="h-11 rounded-lg"
            variant="outline"
            onClick={() => {
              window.location.href = "https://www.google.com/";
            }}
          >
            Ні, вийти
          </Button>
        </div>
      </div>
    </div>
  );
}
