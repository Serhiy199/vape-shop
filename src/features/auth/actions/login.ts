"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth/auth";
import { loginSchema } from "@/features/auth/schemas";

export type LoginFormState = {
  error: string | null;
};

export const initialLoginFormState: LoginFormState = {
  error: null,
};

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? "/",
  });

  if (!parsed.success) {
    return {
      error: "Вкажіть коректний email і пароль.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.redirectTo,
    });

    return initialLoginFormState;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Невірний email або пароль.",
        };
      }

      return {
        error: "Не вдалося виконати вхід. Спробуйте ще раз.",
      };
    }

    throw error;
  }
}
