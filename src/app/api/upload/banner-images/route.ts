import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getBannerImageUploadConstraints,
  uploadBannerImageToCloudinary,
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

  const bannerTitleValue = formData.get("bannerTitle");
  const bannerTitle =
    typeof bannerTitleValue === "string" ? bannerTitleValue.trim() : "";
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const file = files[0] ?? null;
  const constraints = getBannerImageUploadConstraints();

  if (!bannerTitle) {
    return jsonError(
      400,
      "BANNER_TITLE_REQUIRED",
      "Banner title is required before image upload.",
    );
  }

  if (!file) {
    return jsonError(400, "FILE_REQUIRED", "One banner image is required.");
  }

  if (files.length > constraints.maxFilesPerRequest) {
    return jsonError(
      400,
      "TOO_MANY_FILES",
      "You can upload exactly one banner image per request.",
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
    const uploaded = await uploadBannerImageToCloudinary({
      bannerTitle,
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
        message: "Banner image uploaded successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message === "CLOUDINARY_CONFIG_MISSING"
          ? "Cloudinary environment variables are not configured."
          : error.message === "BANNER_TITLE_REQUIRED"
            ? "Banner title is required before image upload."
            : error.message
        : "Banner image upload failed.";

    return jsonError(500, "UPLOAD_FAILED", message);
  }
}
