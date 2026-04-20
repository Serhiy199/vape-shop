"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  createAdminBrand,
  createAdminSubcategory,
  deleteAdminBrand,
  deleteAdminSubcategory,
  updateAdminBrand,
  updateAdminSubcategory,
  updateCategory,
  type MutationResult,
} from "@/server/services/admin-catalog.service";

function revalidateCatalogAdminPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/subcategories");
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
