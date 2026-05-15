import { createHash } from "node:crypto";

const DEFAULT_UPLOAD_FOLDER = "vape-shop/products";

type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
  uploadRoot: string;
};

type ProductImageUploadInput = {
  file: File;
  imageNumber: number;
  productSlug: string;
};

type ProductOptionImageUploadInput = {
  file: File;
  productSlug: string;
  valueNumber: number;
};

type CatalogImageUploadInput = {
  entitySlug: string;
  entityType: "category" | "subcategory";
  file: File;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const uploadRoot =
    process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || DEFAULT_UPLOAD_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_CONFIG_MISSING");
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
    uploadRoot,
  };
}

function normalizePathSegment(value: string) {
  const transliterationMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "iu",
    я: "ia",
    ё: "yo",
    ы: "y",
    э: "e",
    ъ: "",
  };

  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => transliterationMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function joinCloudinaryPath(...segments: string[]) {
  return segments
    .map((segment) => segment.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

function createUploadSignature(input: {
  apiSecret: string;
  folder: string;
  publicId: string;
  timestamp: number;
}) {
  const serialized = `folder=${input.folder}&public_id=${input.publicId}&timestamp=${input.timestamp}${input.apiSecret}`;

  return createHash("sha1").update(serialized).digest("hex");
}

export function getCloudinaryUploadConstraints() {
  return {
    allowedMimeTypes: new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]),
    maxFileSizeBytes: 5 * 1024 * 1024,
    maxFilesPerRequest: 11,
  };
}

export function getCatalogImageUploadConstraints() {
  return {
    ...getCloudinaryUploadConstraints(),
    maxFilesPerRequest: 1,
  };
}

export function getProductOptionImageUploadConstraints() {
  return {
    ...getCloudinaryUploadConstraints(),
    maxFilesPerRequest: 1,
  };
}

export async function uploadProductImageToCloudinary({
  file,
  imageNumber,
  productSlug,
}: ProductImageUploadInput) {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const safeSlug = normalizePathSegment(productSlug);
  const folder = joinCloudinaryPath(config.uploadRoot, safeSlug);
  const publicId = `image-${imageNumber}`;

  if (!safeSlug) {
    throw new Error("PRODUCT_SLUG_REQUIRED");
  }

  const signature = createUploadSignature({
    apiSecret: config.apiSecret,
    folder,
    publicId,
    timestamp,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      body: formData,
      method: "POST",
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: {
        message?: string;
      };
    } | null;

    throw new Error(
      payload?.error?.message || "Cloudinary image upload failed.",
    );
  }

  const payload = (await response.json()) as {
    public_id: string;
    secure_url: string;
  };

  return {
    publicId: payload.public_id,
    url: payload.secure_url,
  };
}

export async function uploadProductOptionImageToCloudinary({
  file,
  productSlug,
  valueNumber,
}: ProductOptionImageUploadInput) {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const safeSlug = normalizePathSegment(productSlug);
  const folder = joinCloudinaryPath(
    config.uploadRoot,
    "product-options",
    safeSlug,
  );
  const publicId = `option-${valueNumber}`;

  if (!safeSlug) {
    throw new Error("PRODUCT_SLUG_REQUIRED");
  }

  const signature = createUploadSignature({
    apiSecret: config.apiSecret,
    folder,
    publicId,
    timestamp,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      body: formData,
      method: "POST",
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: {
        message?: string;
      };
    } | null;

    throw new Error(
      payload?.error?.message || "Cloudinary option image upload failed.",
    );
  }

  const payload = (await response.json()) as {
    public_id: string;
    secure_url: string;
  };

  return {
    publicId: payload.public_id,
    url: payload.secure_url,
  };
}

export async function uploadCatalogImageToCloudinary({
  entitySlug,
  entityType,
  file,
}: CatalogImageUploadInput) {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const safeSlug = normalizePathSegment(entitySlug);
  const folder = joinCloudinaryPath(config.uploadRoot, "catalog", entityType);
  const publicId = safeSlug;

  if (!safeSlug) {
    throw new Error("ENTITY_SLUG_REQUIRED");
  }

  const signature = createUploadSignature({
    apiSecret: config.apiSecret,
    folder,
    publicId,
    timestamp,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      body: formData,
      method: "POST",
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: {
        message?: string;
      };
    } | null;

    throw new Error(
      payload?.error?.message || "Cloudinary image upload failed.",
    );
  }

  const payload = (await response.json()) as {
    public_id: string;
    secure_url: string;
  };

  return {
    publicId: payload.public_id,
    url: payload.secure_url,
  };
}
