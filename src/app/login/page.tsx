import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth/auth";

type SearchParams = Record<string, string | string[] | undefined>;

function normalizeRedirectTo(value: string | string[] | undefined) {
  if (!value) {
    return "/";
  }

  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  return candidate;
}

export default async function LoginPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const [session, searchParams] = await Promise.all([
    auth(),
    props.searchParams ?? Promise.resolve<SearchParams>({}),
  ]);

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  const redirectTo = normalizeRedirectTo(searchParams.callbackUrl);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.93_0.06_36_/_0.42),transparent_30%),radial-gradient(circle_at_bottom_right,oklch(0.95_0.04_86_/_0.72),transparent_36%)]" />
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
