import {
  getAdminBannerById,
  listAdminBanners,
} from "@/server/repositories/banner.repository";

function resolveSelectedId<TItem extends { id: string }>(
  items: TItem[],
  selectedId?: string,
) {
  if (!items.length) {
    return undefined;
  }

  return items.some((item) => item.id === selectedId)
    ? selectedId
    : items[0].id;
}

export async function getAdminBannersPageData(selectedId?: string) {
  const banners = await listAdminBanners();
  const resolvedSelectedId = resolveSelectedId(banners, selectedId);
  const selectedBanner = resolvedSelectedId
    ? await getAdminBannerById(resolvedSelectedId)
    : null;

  return {
    banners,
    selectedBanner,
  };
}
