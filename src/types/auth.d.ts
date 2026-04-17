import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      firstName?: string | null;
      lastName?: string | null;
    };
  }

  interface User {
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
    firstName?: string | null;
    lastName?: string | null;
  }
}
