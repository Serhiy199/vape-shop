import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getRichTextImageUploadConstraints,
  uploadRichTextImageToCloudinary,
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
    return jsonError(401, "UNAUTHORIZED", "Потрібна авторизація.");
  }

  if (session.user.role !== UserRole.ADMIN) {
    return jsonError(403, "FORBIDDEN", "Потрібен доступ адміністратора.");
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError(
      400,
      "INVALID_FORM_DATA",
      "Тіло запиту має бути валідною multipart form data.",
    );
  }

  const files = formData
    .getAll("file")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const constraints = getRichTextImageUploadConstraints();

  if (files.length === 0) {
    return jsonError(400, "FILES_REQUIRED", "Оберіть одне зображення.");
  }

  if (files.length > constraints.maxFilesPerRequest) {
    return jsonError(
      400,
      "TOO_MANY_FILES",
      "За один раз можна завантажити тільки одне зображення.",
    );
  }

  const [file] = files;

  if (!constraints.allowedMimeTypes.has(file.type)) {
    return jsonError(
      400,
      "UNSUPPORTED_FILE_TYPE",
      "Підтримуються лише JPEG, PNG або WebP до 5 MB.",
    );
  }

  if (file.size > constraints.maxFileSizeBytes) {
    return jsonError(
      400,
      "FILE_TOO_LARGE",
      "Підтримуються лише JPEG, PNG або WebP до 5 MB.",
    );
  }

  try {
    const uploaded = await uploadRichTextImageToCloudinary({ file });

    return NextResponse.json(
      {
        success: true,
        data: {
          file: {
            publicId: uploaded.publicId,
            url: uploaded.url,
          },
        },
        message: "Фото додано в опис.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[rich-text-image-upload] Upload failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    const message =
      error instanceof Error && error.message === "CLOUDINARY_CONFIG_MISSING"
        ? "Cloudinary не налаштований. Перевірте змінні середовища."
        : "Не вдалося завантажити фото.";

    return jsonError(500, "UPLOAD_FAILED", message);
  }
}
