import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { registerSchema } from "@/features/auth/schemas";
import { hashPassword } from "@/lib/auth/password";
import {
  createUser,
  getUserByEmail,
} from "@/server/repositories/user.repository";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid registration payload.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(parsed.data.email);
  if (existingUser) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "A user with this email already exists.",
        },
      },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await createUser({
    email: parsed.data.email,
    passwordHash,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    phone: parsed.data.phone,
    role: UserRole.CLIENT,
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: user.id,
        email: user.email,
      },
      message: "Account created successfully.",
    },
    { status: 201 },
  );
}
