import Link from "next/link";
import { ImageIcon } from "lucide-react";

import {
  AdminDetailList,
  AdminListTable,
  AdminSplitLayout,
} from "@/components/admin/admin-data-primitives";
import {
  AdminActionsBar,
  AdminEmptyState,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatsGrid,
} from "@/components/admin/admin-primitives";
import { Badge } from "@/components/ui/badge";
import {
  AdminBannerCrud,
  type AdminBannerItem,
} from "@/features/banners/components/admin-banner-crud";
import { getAdminBannersPageData } from "@/server/queries/admin-banner.query";

type SearchParams = Promise<{ selected?: string }>;

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const { banners, selectedBanner } = await getAdminBannersPageData(
    params.selected,
  );
  const mappedBanners = banners.map(serializeBanner);
  const mappedSelectedBanner = selectedBanner
    ? serializeBanner(selectedBanner)
    : null;
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
        title="Список і деталі банерів"
        description="Ліворуч список у порядку показу, праворуч деталі та форма редагування вибраного банера."
      >
        <AdminSplitLayout
          list={
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

              <AdminListTable
                items={mappedBanners}
                columns={[
                  {
                    key: "preview",
                    header: "",
                    className: "w-20",
                    cell: (banner) => (
                      <div className="bg-muted border-border/70 h-20 w-12 overflow-hidden rounded-md border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ),
                  },
                  {
                    key: "title",
                    header: "Банер",
                    cell: (banner) => (
                      <div className="space-y-1">
                        <Link
                          href={`/admin/banners?selected=${banner.id}`}
                          className="font-medium hover:underline"
                        >
                          {banner.title}
                        </Link>
                        <p className="text-muted-foreground max-w-[260px] truncate text-xs">
                          {banner.targetUrl}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "sortOrder",
                    header: "Порядок",
                    className: "w-24",
                    cell: (banner) => banner.sortOrder,
                  },
                  {
                    key: "status",
                    header: "Статус",
                    className: "w-32",
                    cell: (banner) => (
                      <Badge variant={banner.isActive ? "secondary" : "outline"}>
                        {banner.isActive ? "Активний" : "Неактивний"}
                      </Badge>
                    ),
                  },
                ]}
                emptyState={
                  <AdminEmptyState
                    icon={ImageIcon}
                    title="Банери ще не додані"
                    description="Створіть перший банер у формі вище, щоб секція зʼявилась на головній."
                  />
                }
              />
            </div>
          }
          detail={
            <div className="space-y-4">
              {mappedSelectedBanner ? (
                <>
                  <AdminDetailList
                    items={[
                      {
                        label: "Назва",
                        value: mappedSelectedBanner.title,
                      },
                      {
                        label: "URL переходу",
                        value: (
                          <a
                            href={mappedSelectedBanner.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary break-all hover:underline"
                          >
                            {mappedSelectedBanner.targetUrl}
                          </a>
                        ),
                      },
                      {
                        label: "Порядок",
                        value: mappedSelectedBanner.sortOrder.toString(),
                      },
                      {
                        label: "Статус",
                        value: mappedSelectedBanner.isActive
                          ? "Активний"
                          : "Неактивний",
                      },
                      {
                        label: "Оновлено",
                        value: formatDate(mappedSelectedBanner.updatedAt),
                      },
                    ]}
                  />

                  <AdminBannerCrud
                    mode="edit"
                    selectedBanner={mappedSelectedBanner}
                  />
                </>
              ) : (
                <AdminEmptyState
                  icon={ImageIcon}
                  title="Оберіть банер"
                  description="Після вибору банера зі списку тут зʼявляться деталі та редагування."
                />
              )}
            </div>
          }
        />
      </AdminSectionCard>
    </div>
  );
}
