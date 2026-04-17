import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

function createLoginRedirectUrl(req: Parameters<Parameters<typeof auth>[0]>[0]) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
  );

  return loginUrl;
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = Boolean(req.auth?.user);

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(createLoginRedirectUrl(req));
    }

    if (req.auth?.user?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/account") && !isLoggedIn) {
    return NextResponse.redirect(createLoginRedirectUrl(req));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
