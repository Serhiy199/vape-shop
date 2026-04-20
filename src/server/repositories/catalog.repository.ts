import { prisma } from "@/lib/prisma/client";

export async function listFixedAdminCategories() {
  return prisma.category.findMany({
    where: {
      isFixed: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      isActive: true,
      seoTitle: true,
      seoDescription: true,
      _count: {
        select: {
          products: true,
          subcategories: true,
        },
      },
    },
  });
}

export async function getFixedAdminCategoryById(categoryId: string) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      isFixed: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      isActive: true,
      isFixed: true,
      seoTitle: true,
      seoDescription: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
          subcategories: true,
        },
      },
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          isActive: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      },
    },
  });
}

export async function listAdminSubcategories() {
  return prisma.subcategory.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      isActive: true,
      seoTitle: true,
      seoDescription: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          fields: true,
          products: true,
        },
      },
    },
  });
}

export async function getAdminSubcategoryById(subcategoryId: string) {
  return prisma.subcategory.findUnique({
    where: {
      id: subcategoryId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      isActive: true,
      seoTitle: true,
      seoDescription: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          isFixed: true,
        },
      },
      _count: {
        select: {
          fields: true,
          products: true,
        },
      },
      fields: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          key: true,
          type: true,
          sortOrder: true,
          isRequired: true,
          isFilterable: true,
        },
      },
    },
  });
}

export async function listAdminBrands() {
  return prisma.brand.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      isActive: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getAdminBrandById(brandId: string) {
  return prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
        },
      },
      products: {
        where: {
          isActive: true,
        },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

export async function getCategoryById(categoryId: string) {
  return prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isFixed: true,
    },
  });
}

export async function getCategoryByName(name: string) {
  return prisma.category.findFirst({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });
}

export async function updateFixedCategory(input: {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}) {
  return prisma.category.update({
    where: {
      id: input.id,
    },
    data: {
      name: input.name,
      slug: input.slug,
      sortOrder: input.sortOrder,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getSubcategoryById(subcategoryId: string) {
  return prisma.subcategory.findUnique({
    where: {
      id: subcategoryId,
    },
    select: {
      id: true,
      categoryId: true,
      name: true,
      slug: true,
      _count: {
        select: {
          fields: true,
          products: true,
        },
      },
    },
  });
}

export async function getSubcategoryByScopedName(input: {
  categoryId: string;
  name: string;
}) {
  return prisma.subcategory.findUnique({
    where: {
      categoryId_name: {
        categoryId: input.categoryId,
        name: input.name,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function getSubcategoryByScopedSlug(input: {
  categoryId: string;
  slug: string;
}) {
  return prisma.subcategory.findUnique({
    where: {
      categoryId_slug: {
        categoryId: input.categoryId,
        slug: input.slug,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function createSubcategory(input: {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}) {
  return prisma.subcategory.create({
    data: input,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function updateSubcategory(input: {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}) {
  return prisma.subcategory.update({
    where: {
      id: input.id,
    },
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function deleteSubcategory(subcategoryId: string) {
  return prisma.subcategory.delete({
    where: {
      id: subcategoryId,
    },
    select: {
      id: true,
    },
  });
}

export async function listAdminSubcategoryFields() {
  return prisma.subcategoryField.findMany({
    orderBy: [
      { subcategory: { category: { sortOrder: "asc" } } },
      { subcategory: { sortOrder: "asc" } },
      { sortOrder: "asc" },
      { label: "asc" },
    ],
    select: {
      id: true,
      subcategoryId: true,
      label: true,
      key: true,
      type: true,
      sortOrder: true,
      isRequired: true,
      isFilterable: true,
      helpText: true,
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
      options: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          value: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          options: true,
          productValues: true,
        },
      },
    },
  });
}

export async function listSubcategoryFields(subcategoryId: string) {
  return prisma.subcategoryField.findMany({
    where: {
      subcategoryId,
    },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      id: true,
      subcategoryId: true,
      label: true,
      key: true,
      type: true,
      sortOrder: true,
      isRequired: true,
      isFilterable: true,
      helpText: true,
      options: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          value: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          options: true,
          productValues: true,
        },
      },
    },
  });
}

export async function getAdminSubcategoryFieldById(fieldId: string) {
  return prisma.subcategoryField.findUnique({
    where: {
      id: fieldId,
    },
    select: {
      id: true,
      subcategoryId: true,
      label: true,
      key: true,
      type: true,
      sortOrder: true,
      isRequired: true,
      isFilterable: true,
      helpText: true,
      createdAt: true,
      updatedAt: true,
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
              isFixed: true,
            },
          },
        },
      },
      options: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          value: true,
          sortOrder: true,
          _count: {
            select: {
              valuesUsed: true,
            },
          },
        },
      },
      _count: {
        select: {
          options: true,
          productValues: true,
        },
      },
    },
  });
}

export async function getSubcategoryFieldById(fieldId: string) {
  return prisma.subcategoryField.findUnique({
    where: {
      id: fieldId,
    },
    select: {
      id: true,
      subcategoryId: true,
      label: true,
      key: true,
      type: true,
      sortOrder: true,
      isRequired: true,
      isFilterable: true,
      helpText: true,
      options: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          value: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          options: true,
          productValues: true,
        },
      },
    },
  });
}

export async function getSubcategoryFieldByScopedKey(input: {
  subcategoryId: string;
  key: string;
}) {
  return prisma.subcategoryField.findUnique({
    where: {
      subcategoryId_key: {
        subcategoryId: input.subcategoryId,
        key: input.key,
      },
    },
    select: {
      id: true,
      subcategoryId: true,
      key: true,
      type: true,
    },
  });
}

export async function createSubcategoryField(input: {
  subcategoryId: string;
  label: string;
  key: string;
  type: "TEXT" | "NUMBER" | "TEXTAREA" | "SELECT" | "BOOLEAN";
  isRequired: boolean;
  sortOrder: number;
  helpText?: string;
  isFilterable?: boolean;
  options?: Array<{
    label: string;
    value: string;
    sortOrder: number;
  }>;
}) {
  return prisma.subcategoryField.create({
    data: {
      subcategoryId: input.subcategoryId,
      label: input.label,
      key: input.key,
      type: input.type,
      isRequired: input.isRequired,
      sortOrder: input.sortOrder,
      helpText: input.helpText,
      isFilterable: input.isFilterable ?? false,
      options: {
        create: (input.options ?? []).map((option) => ({
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder,
        })),
      },
    },
    select: {
      id: true,
      label: true,
      key: true,
    },
  });
}

export async function updateSubcategoryField(input: {
  id: string;
  subcategoryId: string;
  label: string;
  key: string;
  type: "TEXT" | "NUMBER" | "TEXTAREA" | "SELECT" | "BOOLEAN";
  isRequired: boolean;
  sortOrder: number;
  helpText?: string;
  isFilterable?: boolean;
  options?: Array<{
    label: string;
    value: string;
    sortOrder: number;
  }>;
}) {
  return prisma.subcategoryField.update({
    where: {
      id: input.id,
    },
    data: {
      subcategoryId: input.subcategoryId,
      label: input.label,
      key: input.key,
      type: input.type,
      isRequired: input.isRequired,
      sortOrder: input.sortOrder,
      helpText: input.helpText,
      isFilterable: input.isFilterable ?? false,
      options: {
        deleteMany: {},
        create: (input.options ?? []).map((option) => ({
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder,
        })),
      },
    },
    select: {
      id: true,
      label: true,
      key: true,
    },
  });
}

export async function deleteSubcategoryField(fieldId: string) {
  return prisma.subcategoryField.delete({
    where: {
      id: fieldId,
    },
    select: {
      id: true,
    },
  });
}

export async function getBrandById(brandId: string) {
  return prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getBrandByName(name: string) {
  return prisma.brand.findUnique({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });
}

export async function createBrand(input: {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}) {
  return prisma.brand.create({
    data: input,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function updateBrand(input: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}) {
  return prisma.brand.update({
    where: {
      id: input.id,
    },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function deleteBrand(brandId: string) {
  return prisma.brand.delete({
    where: {
      id: brandId,
    },
    select: {
      id: true,
    },
  });
}
