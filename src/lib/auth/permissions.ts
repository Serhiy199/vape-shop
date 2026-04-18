import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "./auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

export async function requireAuthPage(callbackUrl?: string) {
  const session = await auth();

  if (!session?.user) {
    const loginPath = new URLSearchParams();

    if (callbackUrl) {
      loginPath.set("callbackUrl", callbackUrl);
    }

    const search = loginPath.toString();
    redirect(search ? `/login?${search}` : "/login");
  }

  return session;
}

export async function requireAdminPage() {
  const session = await requireAuthPage("/admin");

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return session;
}
