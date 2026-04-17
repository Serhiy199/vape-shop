import { UserRole } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyPassword } from "./password";
import { getUserByEmail } from "@/server/repositories/user.repository";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await getUserByEmail(email);
        if (!user?.passwordHash || !user.isActive) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          password,
          user.passwordHash,
        );
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.CLIENT;
        session.user.firstName = (token.firstName as string | null | undefined) ?? null;
        session.user.lastName = (token.lastName as string | null | undefined) ?? null;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
