"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  createAdminBrand,
  createAdminSubcategoryField,
  createAdminSubcategory,
  deleteAdminBrand,
  deleteAdminSubcategoryField,
  deleteAdminSubcategory,
  updateAdminBrand,
  updateAdminSubcategoryField,
  updateAdminSubcategory,
  updateCategory,
  type MutationResult,
} from "@/server/services/admin-catalog.service";

function revalidateCatalogAdminPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/subcategories");
  revalidatePath("/admin/fields");
  revalidatePath("/admin/brands");
}

async function withAdminAccess<TData>(
  action: () => Promise<MutationResult<TData>>,
) {
  await requireAdmin();
  return action();
}

export async function updateCategoryAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await updateCategory(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function createSubcategoryAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await createAdminSubcategory(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function updateSubcategoryAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await updateAdminSubcategory(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function deleteSubcategoryAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await deleteAdminSubcategory(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function createSubcategoryFieldAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await createAdminSubcategoryField(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function updateSubcategoryFieldAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await updateAdminSubcategoryField(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function deleteSubcategoryFieldAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await deleteAdminSubcategoryField(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function createBrandAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await createAdminBrand(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function updateBrandAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await updateAdminBrand(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}

export async function deleteBrandAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await deleteAdminBrand(input);

    if (result.ok) {
      revalidateCatalogAdminPaths();
    }

    return result;
  });
}
