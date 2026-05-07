import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getCatalogImageUploadConstraints,
  uploadCatalogImageToCloudinary,
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

  const entityTypeValue = formData.get("entityType");
  const entitySlugValue = formData.get("entitySlug");
  const entityType =
    typeof entityTypeValue === "string" ? entityTypeValue.trim() : "";
  const entitySlug =
    typeof entitySlugValue === "string" ? entitySlugValue.trim() : "";
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const constraints = getCatalogImageUploadConstraints();

  if (entityType !== "category" && entityType !== "subcategory") {
    return jsonError(
      400,
      "INVALID_ENTITY_TYPE",
      "entityType must be category or subcategory.",
    );
  }

  if (!entitySlug) {
    return jsonError(
      400,
      "ENTITY_SLUG_REQUIRED",
      "Slug is required before image upload.",
    );
  }

  if (files.length === 0) {
    return jsonError(400, "FILES_REQUIRED", "One image file is required.");
  }

  if (files.length > constraints.maxFilesPerRequest) {
    return jsonError(
      400,
      "TOO_MANY_FILES",
      `You can upload at most ${constraints.maxFilesPerRequest} file per request.`,
    );
  }

  const [file] = files;

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
    const uploaded = await uploadCatalogImageToCloudinary({
      entitySlug,
      entityType,
      file,
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
        message: "Image uploaded successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message === "CLOUDINARY_CONFIG_MISSING"
          ? "Cloudinary environment variables are not configured."
          : error.message === "ENTITY_SLUG_REQUIRED"
            ? "Slug is required before image upload."
            : error.message
        : "Image upload failed.";

    return jsonError(500, "UPLOAD_FAILED", message);
  }
}
