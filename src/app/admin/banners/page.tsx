import {
  AdminActionsBar,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatsGrid,
} from "@/components/admin/admin-primitives";
import { Badge } from "@/components/ui/badge";
import {
  AdminBannerCrud,
  type AdminBannerItem,
} from "@/features/banners/components/admin-banner-crud";
import { AdminBannerTable } from "@/features/banners/components/admin-banner-table";
import { getAdminBannersPageData } from "@/server/queries/admin-banner.query";

function serializeBanner(banner: {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminBannerItem {
  return {
    ...banner,
    createdAt: banner.createdAt.toISOString(),
    updatedAt: banner.updatedAt.toISOString(),
  };
}

export default async function AdminBannersPage() {
  const { banners } = await getAdminBannersPageData();
  const mappedBanners = banners.map(serializeBanner);
  const activeCount = mappedBanners.filter((banner) => banner.isActive).length;
  const inactiveCount = mappedBanners.length - activeCount;
  const nextSortOrder =
    mappedBanners.reduce(
      (maxSortOrder, banner) => Math.max(maxSortOrder, banner.sortOrder),
      0,
    ) + 1;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Промо"
        title="Банери головної сторінки"
        description="Керуйте вертикальними промо-афішами, які показуються у слайдері на головній сторінці магазину."
        badges={["Homepage banners", "Swiper ready"]}
      />

      <AdminStatsGrid
        items={[
          {
            label: "Всього",
            value: mappedBanners.length.toString(),
            note: "Усі банери в базі, включно з неактивними.",
          },
          {
            label: "Активні",
            value: activeCount.toString(),
            note: "Показуються на головній сторінці.",
          },
          {
            label: "Неактивні",
            value: inactiveCount.toString(),
            note: "Залишаються в адмінці, але приховані на storefront.",
          },
          {
            label: "Наступний порядок",
            value: nextSortOrder.toString(),
            note: "Зручна підказка для нового банера.",
          },
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/",
            label: "Переглянути головну",
            variant: "outline",
          },
          {
            href: "/api/banners",
            label: "Public API",
            variant: "outline",
          },
        ]}
        note="Клік по банеру на storefront завжди відкриває target URL у новій вкладці."
      />

      <AdminBannerCrud mode="create" selectedBanner={null} />

      <AdminSectionCard
        title="Список банерів"
        description="Компактна таблиця у порядку показу. Редагування відкривається inline тільки для вибраного банера."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Промо-банери</p>
              <p className="text-muted-foreground text-sm leading-6">
                Сортування відповідає порядку у слайдері на головній.
              </p>
            </div>
            <Badge variant="outline">{mappedBanners.length} записів</Badge>
          </div>

          <AdminBannerTable banners={mappedBanners} />
        </div>
      </AdminSectionCard>
    </div>
  );
}
