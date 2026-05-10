import { ProductAvailability, type Prisma } from "@prisma/client";

import type {
  StorefrontProductBadge,
  StorefrontProductCardItem,
} from "@/components/storefront/product-types";
import type { StorefrontCategory } from "@/components/storefront/storefront-config";
import { storefrontCategories } from "@/components/storefront/storefront-config";
import { prisma } from "@/lib/prisma/client";
import type {
  CatalogAvailabilityFilter,
  CatalogBadgeFilter,
  CatalogOption,
  CatalogPriceRangeFilter,
  CatalogSortFilter,
} from "@/lib/storefront/catalog-filters";

const storefrontVisibleProductWhere = {
  isActive: true,
  category: {
    isActive: true,
  },
  subcategory: {
    isActive: true,
  },
  AND: [
    {
      OR: [
        {
          brandId: null,
        },
        {
          brand: {
            isActive: true,
          },
        },
      ],
    },
  ],
} satisfies Prisma.ProductWhereInput;

const storefrontCategorySelect = {
  id: true,
  name: true,
  slug: true,
  image: true,
  description: true,
  seoTitle: true,
  seoDescription: true,
  subcategories: {
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      _count: {
        select: {
          products: {
            where: {
              ...storefrontVisibleProductWhere,
            },
          },
        },
      },
    },
  },
  _count: {
    select: {
      products: {
        where: {
          ...storefrontVisibleProductWhere,
        },
      },
      subcategories: {
        where: {
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.CategorySelect;

const storefrontBrandSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  seoTitle: true,
  seoDescription: true,
  subcategory: {
    select: {
      id: true,
      name: true,
      slug: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  _count: {
    select: {
      products: {
        where: {
          ...storefrontVisibleProductWhere,
        },
      },
    },
  },
} satisfies Prisma.BrandSelect;

const storefrontProductListSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  availability: true,
  isFeaturedNew: true,
  isFeaturedSale: true,
  isFeaturedHit: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  subcategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  brand: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    orderBy: [
      { isPrimary: "desc" },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    take: 1,
    select: {
      id: true,
      url: true,
      alt: true,
      isPrimary: true,
    },
  },
  _count: {
    select: {
      orderItems: true,
      wishlistItems: true,
    },
  },
} satisfies Prisma.ProductSelect;

const storefrontProductDetailSelect = {
  ...storefrontProductListSelect,
  description: true,
  seoTitle: true,
  seoDescription: true,
  images: {
    orderBy: [
      { isPrimary: "desc" },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      url: true,
      alt: true,
      isPrimary: true,
      sortOrder: true,
    },
  },
  fieldValues: {
    orderBy: {
      field: {
        sortOrder: "asc",
      },
    },
    select: {
      id: true,
      valueText: true,
      valueNumber: true,
      valueBoolean: true,
      field: {
        select: {
          id: true,
          label: true,
          key: true,
          type: true,
          sortOrder: true,
        },
      },
      option: {
        select: {
          id: true,
          label: true,
          value: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type StorefrontCategoryRecord = Prisma.CategoryGetPayload<{
  select: typeof storefrontCategorySelect;
}>;

type StorefrontBrandRecord = Prisma.BrandGetPayload<{
  select: typeof storefrontBrandSelect;
}>;

type StorefrontProductListRecord = Prisma.ProductGetPayload<{
  select: typeof storefrontProductListSelect;
}>;

const fallbackCategoryIcons = storefrontCategories.map((category) => ({
  icon: category.icon,
  tone: category.tone,
}));

function resolveCategoryVisual(slug: string, index: number) {
  const configuredCategory = storefrontCategories.find(
    (category) =>
      category.href.endsWith(`/${slug}`) || category.href.includes(slug),
  );

  if (configuredCategory) {
    return {
      icon: configuredCategory.icon,
      tone: configuredCategory.tone,
    };
  }

  return fallbackCategoryIcons[index % fallbackCategoryIcons.length];
}

function mapCategoryToCard(
  category: StorefrontCategoryRecord,
  index: number,
): StorefrontCategory {
  const visual = resolveCategoryVisual(category.slug, index);

  return {
    description: category.description ?? undefined,
    href: `/category/${category.slug}`,
    icon: visual.icon,
    label: category.name,
    links: category.subcategories.map((subcategory) => ({
      href: `/category/${category.slug}/${subcategory.slug}`,
      label: subcategory.name,
    })),
    stat: `${category._count.products} товарів`,
    tone: visual.tone,
  };
}

function mapCategoryToOption(
  category: StorefrontCategoryRecord,
): CatalogOption {
  return {
    count: category._count.products,
    href: `/category/${category.slug}`,
    label: category.name,
    value: category.slug,
  };
}

function mapSubcategoryToOption(
  category: StorefrontCategoryRecord,
  subcategory: StorefrontCategoryRecord["subcategories"][number],
): CatalogOption {
  return {
    count: subcategory._count.products,
    href: `/category/${category.slug}/${subcategory.slug}`,
    label: subcategory.name,
    parentSlug: category.slug,
    value: subcategory.slug,
  };
}

function mapBrandToOption(brand: StorefrontBrandRecord): CatalogOption {
  return {
    count: brand._count.products,
    href: `/category/${brand.subcategory.category.slug}/${brand.subcategory.slug}/${brand.slug}`,
    label: brand.name,
    parentSlug: brand.subcategory.slug,
    value: brand.slug,
  };
}

function mapProductBadges(
  product: Pick<
    StorefrontProductListRecord,
    "isFeaturedHit" | "isFeaturedNew" | "isFeaturedSale"
  >,
): StorefrontProductBadge[] {
  return [
    product.isFeaturedHit ? "hit" : null,
    product.isFeaturedNew ? "new" : null,
    product.isFeaturedSale ? "sale" : null,
  ].filter((badge): badge is StorefrontProductBadge => Boolean(badge));
}

function mapProductToCard(
  product: StorefrontProductListRecord,
): StorefrontProductCardItem {
  const primaryImage = product.images[0];

  return {
    availability:
      product.availability === ProductAvailability.IN_STOCK
        ? "in_stock"
        : "out_of_stock",
    badges: mapProductBadges(product),
    brand: product.brand?.name,
    href: `/product/${product.slug}`,
    id: product.id,
    imageAlt: primaryImage?.alt ?? product.title,
    imageSrc: primaryImage?.url,
    price: Number(product.price),
    rating: 5,
    reviewCount: product._count.orderItems + product._count.wishlistItems,
    slug: product.slug,
    title: product.title,
  };
}

type StorefrontProductQueryInput = {
  availability?: CatalogAvailabilityFilter;
  badge?: CatalogBadgeFilter;
  brandSlug?: string;
  categorySlug?: string;
  search?: string;
  priceRange?: CatalogPriceRangeFilter;
  subcategorySlug?: string;
};

function resolvePriceWhere(
  priceRange?: CatalogPriceRangeFilter,
): Prisma.DecimalFilter<"Product"> | undefined {
  if (priceRange === "under-500") {
    return { lt: 500 };
  }

  if (priceRange === "500-1500") {
    return { gte: 500, lte: 1500 };
  }

  if (priceRange === "1500-plus") {
    return { gte: 1500 };
  }

  return undefined;
}

function resolveBadgeWhere(
  badge?: CatalogBadgeFilter,
): Prisma.ProductWhereInput | undefined {
  if (badge === "new") {
    return { isFeaturedNew: true };
  }

  if (badge === "sale") {
    return { isFeaturedSale: true };
  }

  if (badge === "hit") {
    return { isFeaturedHit: true };
  }

  return undefined;
}

function resolveAvailability(
  availability?: CatalogAvailabilityFilter,
): ProductAvailability | undefined {
  if (availability === "in_stock") {
    return ProductAvailability.IN_STOCK;
  }

  if (availability === "out_of_stock") {
    return ProductAvailability.OUT_OF_STOCK;
  }

  return undefined;
}

function resolveProductOrderBy(
  sort?: CatalogSortFilter,
): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === "price-asc") {
    return [{ price: "asc" }, { title: "asc" }];
  }

  if (sort === "price-desc") {
    return [{ price: "desc" }, { title: "asc" }];
  }

  if (sort === "popular") {
    return [
      { isFeaturedHit: "desc" },
      { isFeaturedNew: "desc" },
      { isFeaturedSale: "desc" },
      { createdAt: "desc" },
    ];
  }

  return [{ createdAt: "desc" }, { title: "asc" }];
}

function productBaseWhere(
  input?: StorefrontProductQueryInput,
): Prisma.ProductWhereInput {
  const search = input?.search?.trim();

  return {
    ...storefrontVisibleProductWhere,
    availability: resolveAvailability(input?.availability),
    price: resolvePriceWhere(input?.priceRange),
    ...resolveBadgeWhere(input?.badge),
    category: {
      isActive: true,
      slug: input?.categorySlug,
    },
    subcategory: {
      isActive: true,
      slug: input?.subcategorySlug,
    },
    brand: input?.brandSlug
      ? {
          isActive: true,
          slug: input.brandSlug,
        }
      : undefined,
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              brand: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function listActiveStorefrontCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: storefrontCategorySelect,
  });

  return categories.map(mapCategoryToCard);
}

async function listActiveStorefrontCategoryRecords() {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: storefrontCategorySelect,
  });
}

export async function getActiveStorefrontCategoryWithSubcategoriesBySlug(
  slug: string,
) {
  return prisma.category.findFirst({
    where: {
      isActive: true,
      slug,
    },
    select: storefrontCategorySelect,
  });
}

export async function listActiveStorefrontBrands(limit?: number) {
  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
      products: {
        some: {
          ...storefrontVisibleProductWhere,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: limit,
    select: storefrontBrandSelect,
  });

  return brands.map(mapBrandToOption);
}

export async function getStorefrontCatalogFilterOptions(input?: {
  categorySlug?: string;
}) {
  const [categories, brands] = await Promise.all([
    listActiveStorefrontCategoryRecords(),
    listActiveStorefrontBrands(),
  ]);

  const selectedCategory =
    input?.categorySlug &&
    categories.find((category) => category.slug === input.categorySlug);

  const subcategorySource = selectedCategory ? [selectedCategory] : categories;

  return {
    brands,
    categories: categories.map(mapCategoryToOption),
    subcategories: subcategorySource.flatMap((category) =>
      category.subcategories.map((subcategory) =>
        mapSubcategoryToOption(category, subcategory),
      ),
    ),
  };
}

export async function getActiveStorefrontCategoryBySlug(slug: string) {
  const category = await getActiveStorefrontCategoryWithSubcategoriesBySlug(
    slug,
  );

  return category ? mapCategoryToCard(category, 0) : null;
}

export async function getActiveStorefrontSubcategoryBySlug(input: {
  categorySlug: string;
  subcategorySlug: string;
}) {
  return prisma.subcategory.findFirst({
    where: {
      isActive: true,
      slug: input.subcategorySlug,
      category: {
        isActive: true,
        slug: input.categorySlug,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brands: {
        where: {
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: {
                  ...storefrontVisibleProductWhere,
                },
              },
            },
          },
        },
      },
      fields: {
        where: {
          isFilterable: true,
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          key: true,
          type: true,
          options: {
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
            select: {
              id: true,
              label: true,
              value: true,
            },
          },
        },
      },
    },
  });
}

export async function getActiveStorefrontBrandBySlug(input: {
  brandSlug: string;
  categorySlug: string;
  subcategorySlug: string;
}) {
  return prisma.brand.findFirst({
    where: {
      isActive: true,
      slug: input.brandSlug,
      subcategory: {
        isActive: true,
        slug: input.subcategorySlug,
        category: {
          isActive: true,
          slug: input.categorySlug,
        },
      },
    },
    select: storefrontBrandSelect,
  });
}

export async function listActiveStorefrontProducts(input?: {
  availability?: CatalogAvailabilityFilter;
  badge?: CatalogBadgeFilter;
  brandSlug?: string;
  categorySlug?: string;
  limit?: number;
  priceRange?: CatalogPriceRangeFilter;
  search?: string;
  sort?: CatalogSortFilter;
  subcategorySlug?: string;
}) {
  const products = await prisma.product.findMany({
    where: productBaseWhere(input),
    orderBy: resolveProductOrderBy(input?.sort),
    take: input?.limit,
    select: storefrontProductListSelect,
  });

  return products.map(mapProductToCard);
}

export async function getStorefrontFeaturedProducts(limit = 10) {
  const products = await prisma.product.findMany({
    where: {
      ...productBaseWhere(),
      OR: [
        { isFeaturedHit: true },
        { isFeaturedNew: true },
        { isFeaturedSale: true },
      ],
    },
    orderBy: [
      { isFeaturedHit: "desc" },
      { isFeaturedNew: "desc" },
      { isFeaturedSale: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
    select: storefrontProductListSelect,
  });

  if (products.length > 0) {
    return products.map(mapProductToCard);
  }

  return listActiveStorefrontProducts({ limit });
}

export async function getStorefrontNewProducts(limit = 8) {
  return listActiveStorefrontProducts({
    badge: "new",
    limit,
    sort: "newest",
  });
}

export async function getStorefrontSaleProducts(limit = 8) {
  return listActiveStorefrontProducts({
    badge: "sale",
    limit,
    sort: "newest",
  });
}

export async function getActiveStorefrontProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      ...storefrontVisibleProductWhere,
      slug,
    },
    select: storefrontProductDetailSelect,
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    card: mapProductToCard(product),
    price: Number(product.price),
    fieldValues: product.fieldValues.map((fieldValue) => ({
      id: fieldValue.id,
      key: fieldValue.field.key,
      label: fieldValue.field.label,
      value:
        fieldValue.option?.label ??
        fieldValue.valueText ??
        fieldValue.valueNumber?.toString() ??
        (typeof fieldValue.valueBoolean === "boolean"
          ? fieldValue.valueBoolean
            ? "Так"
            : "Ні"
          : ""),
    })),
  };
}

export async function getStorefrontHomePageData() {
  const [categories, featuredProducts, newProducts, saleProducts, brands] =
    await Promise.all([
      listActiveStorefrontCategories(),
      getStorefrontFeaturedProducts(10),
      getStorefrontNewProducts(8),
      getStorefrontSaleProducts(8),
      listActiveStorefrontBrands(12),
    ]);

  return {
    brands,
    categories,
    featuredProducts,
    newProducts,
    saleProducts,
  };
}
