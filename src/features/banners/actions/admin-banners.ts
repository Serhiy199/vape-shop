"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  createAdminBanner,
  deleteAdminBanner,
  setAdminBannerActiveStatus,
  updateAdminBanner,
  type BannerMutationResult,
} from "@/server/services/admin-banner.service";

function revalidateBannerPaths() {
  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/api/banners");
  revalidatePath("/api/admin/banners");
}

async function withAdminAccess<TData>(
  action: () => Promise<BannerMutationResult<TData>>,
) {
  await requireAdmin();
  return action();
}

export async function createBannerAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await createAdminBanner(input);

    if (result.ok) {
      revalidateBannerPaths();
    }

    return result;
  });
}

export async function updateBannerAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await updateAdminBanner(input);

    if (result.ok) {
      revalidateBannerPaths();
    }

    return result;
  });
}

export async function deleteBannerAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await deleteAdminBanner(input);

    if (result.ok) {
      revalidateBannerPaths();
    }

    return result;
  });
}

export async function toggleBannerStatusAction(input: unknown) {
  return withAdminAccess(async () => {
    const result = await setAdminBannerActiveStatus(input);

    if (result.ok) {
      revalidateBannerPaths();
    }

    return result;
  });
}
