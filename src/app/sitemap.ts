import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma/client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  "https://vape-shop-lilac.vercel.app";

function absoluteUrl(path: string) {
  const baseUrl = SITE_URL.startsWith("http") ? SITE_URL : `https://${SITE_URL}`;

  return new URL(path, baseUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { isActive: true },
      subcategory: { isActive: true },
      OR: [{ brandId: null }, { brand: { isActive: true } }],
    },
    select: {
      slug: true,
      updatedAt: true,
      options: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          values: {
            where: {
              slug: {
                not: null,
              },
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  return products.flatMap((product) => [
    {
      lastModified: product.updatedAt,
      url: absoluteUrl(`/product/${product.slug}`),
    },
    ...product.options.flatMap((option) =>
      option.values.flatMap((value) =>
        value.slug
          ? [
              {
                lastModified: product.updatedAt,
                url: absoluteUrl(`/product/${value.slug}`),
              },
            ]
          : [],
      ),
    ),
  ]);
}
