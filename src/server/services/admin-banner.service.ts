import {
  bannerActiveStatusSchema,
  createBannerSchema,
  deleteBannerSchema,
  updateBannerSchema,
  type BannerActiveStatusInput,
  type CreateBannerInput,
  type DeleteBannerInput,
  type UpdateBannerInput,
} from "@/features/banners/schemas";
import {
  createBanner,
  deleteBanner,
  getAdminBannerById,
  setBannerActiveStatus,
  updateBanner,
} from "@/server/repositories/banner.repository";

type MutationSuccess<TData> = {
  data: TData;
  ok: true;
};

type MutationFailure = {
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
  ok: false;
};

export type BannerMutationResult<TData> =
  | MutationSuccess<TData>
  | MutationFailure;

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    ok: false as const,
    error: "Перевірте коректність заповнених даних.",
    fieldErrors,
  };
}

function ok<TData>(data: TData): BannerMutationResult<TData> {
  return {
    ok: true,
    data,
  };
}

export async function createAdminBanner(
  input: unknown,
): Promise<BannerMutationResult<CreateBannerInput & { id: string }>> {
  const parsed = createBannerSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const banner = await createBanner(parsed.data);

  return ok(banner);
}

export async function updateAdminBanner(
  input: unknown,
): Promise<BannerMutationResult<UpdateBannerInput>> {
  const parsed = updateBannerSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const existingBanner = await getAdminBannerById(parsed.data.id);

  if (!existingBanner) {
    return {
      ok: false,
      error: "Банер не знайдено.",
    };
  }

  const banner = await updateBanner(parsed.data);

  return ok(banner);
}

export async function deleteAdminBanner(
  input: unknown,
): Promise<BannerMutationResult<DeleteBannerInput>> {
  const parsed = deleteBannerSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const existingBanner = await getAdminBannerById(parsed.data.id);

  if (!existingBanner) {
    return {
      ok: false,
      error: "Банер не знайдено.",
    };
  }

  const banner = await deleteBanner(parsed.data.id);

  return ok(banner);
}

export async function setAdminBannerActiveStatus(
  input: unknown,
): Promise<BannerMutationResult<BannerActiveStatusInput>> {
  const parsed = bannerActiveStatusSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const existingBanner = await getAdminBannerById(parsed.data.id);

  if (!existingBanner) {
    return {
      ok: false,
      error: "Банер не знайдено.",
    };
  }

  const banner = await setBannerActiveStatus(parsed.data);

  return ok(banner);
}
