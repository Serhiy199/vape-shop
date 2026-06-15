import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getCertificateFileUploadConstraints,
  uploadCertificateFileToCloudinary,
} from "@/lib/cloudinary/upload";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
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

  const title = String(formData.get("title") ?? "certificate");
  const files = formData
    .getAll("file")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const constraints = getCertificateFileUploadConstraints();

  if (files.length === 0) {
    return jsonError(400, "FILES_REQUIRED", "Оберіть файл сертифіката.");
  }

  if (files.length > constraints.maxFilesPerRequest) {
    return jsonError(
      400,
      "TOO_MANY_FILES",
      "За один раз можна завантажити тільки один файл.",
    );
  }

  const [file] = files;

  if (!constraints.allowedMimeTypes.has(file.type)) {
    return jsonError(
      400,
      "UNSUPPORTED_FILE_TYPE",
      "Підтримуються лише JPEG, PNG, WebP або PDF до 10 MB.",
    );
  }

  if (file.size > constraints.maxFileSizeBytes) {
    return jsonError(
      400,
      "FILE_TOO_LARGE",
      "Підтримуються лише JPEG, PNG, WebP або PDF до 10 MB.",
    );
  }

  try {
    const uploaded = await uploadCertificateFileToCloudinary({ file, title });

    return NextResponse.json(
      {
        success: true,
        data: {
          file: uploaded,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[certificate-file-upload] Upload failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    const message =
      error instanceof Error && error.message === "CLOUDINARY_CONFIG_MISSING"
        ? "Cloudinary не налаштований. Перевірте змінні середовища."
        : "Не вдалося завантажити файл.";

    return jsonError(500, "UPLOAD_FAILED", message);
  }
}
