import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getCloudinaryUploadConstraints,
  uploadProductImageToCloudinary,
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

  const existingCountValue = formData.get("existingCount");
  const existingCount = Number(existingCountValue ?? 0);
  const productSlugValue = formData.get("productSlug");
  const productSlug =
    typeof productSlugValue === "string" ? productSlugValue.trim() : "";
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const constraints = getCloudinaryUploadConstraints();

  if (!Number.isFinite(existingCount) || existingCount < 0) {
    return jsonError(
      400,
      "INVALID_EXISTING_COUNT",
      "existingCount must be a non-negative number.",
    );
  }

  if (!productSlug) {
    return jsonError(
      400,
      "PRODUCT_SLUG_REQUIRED",
      "Product slug is required before image upload.",
    );
  }

  if (files.length === 0) {
    return jsonError(
      400,
      "FILES_REQUIRED",
      "At least one image file is required.",
    );
  }

  if (files.length > constraints.maxFilesPerRequest) {
    return jsonError(
      400,
      "TOO_MANY_FILES",
      `You can upload at most ${constraints.maxFilesPerRequest} files per request.`,
    );
  }

  if (existingCount + files.length > constraints.maxFilesPerRequest) {
    return jsonError(
      400,
      "PRODUCT_IMAGE_LIMIT",
      "A product can contain a maximum of 11 images including the primary image.",
    );
  }

  for (const file of files) {
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
  }

  try {
    const uploadedFiles = await Promise.all(
      files.map(async (file, index) => {
        const uploaded = await uploadProductImageToCloudinary({
          file,
          imageNumber: existingCount + index + 1,
          productSlug,
        });

        return {
          publicId: uploaded.publicId,
          url: uploaded.url,
        };
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          files: uploadedFiles,
        },
        message: "Images uploaded successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message === "CLOUDINARY_CONFIG_MISSING"
          ? "Cloudinary environment variables are not configured."
          : error.message === "PRODUCT_SLUG_REQUIRED"
            ? "Product slug is required before image upload."
            : error.message
        : "Image upload failed.";

    return jsonError(500, "UPLOAD_FAILED", message);
  }
}
