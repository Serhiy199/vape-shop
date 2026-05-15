import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getCloudinaryUploadConstraints,
  uploadProductOptionImageToCloudinary,
} from "@/lib/cloudinary/upload";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  if (session.user.role !== UserRole.ADMIN) {
    return jsonError(403, "FORBIDDEN", "Admin access is required.");
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError(
      400,
      "INVALID_FORM_DATA",
      "Request body must be valid multipart form data.",
    );
  }

  const productSlugValue = formData.get("productSlug");
  const productSlug =
    typeof productSlugValue === "string" ? productSlugValue.trim() : "";
  const valueNumberValue = formData.get("valueNumber");
  const valueNumber = Number(valueNumberValue ?? 0);
  const fileValue = formData.get("file");
  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const constraints = getCloudinaryUploadConstraints();

  if (!productSlug) {
    return jsonError(
      400,
      "PRODUCT_SLUG_REQUIRED",
      "Product slug is required before option image upload.",
    );
  }

  if (!Number.isFinite(valueNumber) || valueNumber < 1) {
    return jsonError(
      400,
      "INVALID_VALUE_NUMBER",
      "valueNumber must be a positive number.",
    );
  }

  if (!file) {
    return jsonError(
      400,
      "FILE_REQUIRED",
      "One option image file is required.",
    );
  }

  if (!constraints.allowedMimeTypes.has(file.type)) {
    return jsonError(
      400,
      "UNSUPPORTED_FILE_TYPE",
      `File "${file.name}" has an unsupported type.`,
    );
  }

  if (file.size > constraints.maxFileSizeBytes) {
    return jsonError(
      400,
      "FILE_TOO_LARGE",
      `File "${file.name}" exceeds the 5 MB size limit.`,
    );
  }

  try {
    const uploaded = await uploadProductOptionImageToCloudinary({
      file,
      productSlug,
      valueNumber,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          file: {
            publicId: uploaded.publicId,
            url: uploaded.url,
          },
        },
        message: "Option image uploaded successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message === "CLOUDINARY_CONFIG_MISSING"
          ? "Cloudinary environment variables are not configured."
          : error.message === "PRODUCT_SLUG_REQUIRED"
            ? "Product slug is required before option image upload."
            : error.message
        : "Option image upload failed.";

    return jsonError(500, "UPLOAD_FAILED", message);
  }
}
