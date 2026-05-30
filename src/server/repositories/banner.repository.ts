import { prisma } from "@/lib/prisma/client";

const bannerSelect = {
  id: true,
  title: true,
  imageUrl: true,
  targetUrl: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
};

export async function listActiveStorefrontBanners() {
  return prisma.banner.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: bannerSelect,
  });
}

export async function listAdminBanners() {
  return prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: bannerSelect,
  });
}

export async function getAdminBannerById(bannerId: string) {
  return prisma.banner.findUnique({
    where: {
      id: bannerId,
    },
    select: bannerSelect,
  });
}

export async function createBanner(input: {
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  sortOrder: number;
}) {
  return prisma.banner.create({
    data: input,
    select: bannerSelect,
  });
}

export async function updateBanner(input: {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  sortOrder: number;
}) {
  return prisma.banner.update({
    where: {
      id: input.id,
    },
    data: {
      title: input.title,
      imageUrl: input.imageUrl,
      targetUrl: input.targetUrl,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
    select: bannerSelect,
  });
}

export async function deleteBanner(bannerId: string) {
  return prisma.banner.delete({
    where: {
      id: bannerId,
    },
    select: {
      id: true,
    },
  });
}

export async function setBannerActiveStatus(input: {
  id: string;
  isActive: boolean;
}) {
  return prisma.banner.update({
    where: {
      id: input.id,
    },
    data: {
      isActive: input.isActive,
    },
    select: {
      id: true,
      isActive: true,
    },
  });
}
