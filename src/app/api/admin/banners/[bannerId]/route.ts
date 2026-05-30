import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  deleteAdminBanner,
  updateAdminBanner,
} from "@/server/services/admin-banner.service";

type Params = Promise<{
  bannerId: string;
}>;

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

async function requireAdminApi() {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "FORBIDDEN";
    return message === "UNAUTHORIZED"
      ? jsonError(401, "UNAUTHORIZED", "Authentication is required.")
      : jsonError(403, "FORBIDDEN", "Admin access is required.");
  }
}

function revalidateBannerPaths() {
  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/api/banners");
  revalidatePath("/api/admin/banners");
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const authError = await requireAdminApi();
  if (authError) {
    return authError;
  }

  const { bannerId } = await params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const result = await updateAdminBanner({
    ...(typeof payload === "object" && payload !== null ? payload : {}),
    id: bannerId,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: result.error,
          fieldErrors: result.fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  revalidateBannerPaths();

  return NextResponse.json({
    success: true,
    data: {
      banner: result.data,
    },
    message: "Banner updated successfully.",
  });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const authError = await requireAdminApi();
  if (authError) {
    return authError;
  }

  const { bannerId } = await params;
  const result = await deleteAdminBanner({
    id: bannerId,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: result.error,
          fieldErrors: result.fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  revalidateBannerPaths();

  return NextResponse.json({
    success: true,
    data: {
      banner: result.data,
    },
    message: "Banner deleted successfully.",
  });
}
