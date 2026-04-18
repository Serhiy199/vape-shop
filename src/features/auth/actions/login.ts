"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth/auth";
import { loginSchema } from "@/features/auth/schemas";
import { getUserByEmail } from "@/server/repositories/user.repository";
import { getRoleHomePath } from "@/lib/auth/roles";

export type LoginFormState = {
  error: string | null;
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
    const user = await getUserByEmail(parsed.data.email);
    const redirectTo =
      parsed.data.redirectTo === "/"
        ? getRoleHomePath(user?.role)
        : parsed.data.redirectTo;

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });

    return { error: null };
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
