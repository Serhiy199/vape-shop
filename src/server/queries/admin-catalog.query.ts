import {
  getAdminBrandById,
  getAdminCategoryById,
  getAdminProductById,
  getAdminSubcategoryFieldById,
  getAdminSubcategoryById,
  listAdminCategories,
  listAdminBrands,
  listAdminProducts,
  listAdminSubcategoryFields,
  listAdminSubcategories,
} from "@/server/repositories/catalog.repository";

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

export async function getAdminCategoriesPageData(selectedId?: string) {
  const categories = await listAdminCategories();
  const resolvedSelectedId = resolveSelectedId(categories, selectedId);
  const selectedCategory = resolvedSelectedId
    ? await getAdminCategoryById(resolvedSelectedId)
    : null;

  return {
    categories,
    selectedCategory,
  };
}

export async function getAdminSubcategoriesPageData(selectedId?: string) {
  const categories = await listAdminCategories();
  const subcategories = await listAdminSubcategories();
  const resolvedSelectedId = resolveSelectedId(subcategories, selectedId);
  const selectedSubcategory = resolvedSelectedId
    ? await getAdminSubcategoryById(resolvedSelectedId)
    : null;

  return {
    categories,
    selectedSubcategory,
    subcategories,
  };
}

export async function getAdminBrandsPageData(selectedId?: string) {
  const brands = await listAdminBrands();
  const subcategories = await listAdminSubcategories();
  const resolvedSelectedId = resolveSelectedId(brands, selectedId);
  const selectedBrand = resolvedSelectedId
    ? await getAdminBrandById(resolvedSelectedId)
    : null;

  return {
    brands,
    selectedBrand,
    subcategories,
  };
}

export async function getAdminFieldsPageData(selectedId?: string) {
  const categories = await listAdminCategories();
  const subcategories = await listAdminSubcategories();
  const fields = await listAdminSubcategoryFields();
  const resolvedSelectedId = resolveSelectedId(fields, selectedId);
  const selectedField = resolvedSelectedId
    ? await getAdminSubcategoryFieldById(resolvedSelectedId)
    : null;

  return {
    categories,
    subcategories,
    fields,
    selectedField,
  };
}

export async function getAdminProductsPageData(
  selectedId?: string,
  filters?: {
    brandId?: string;
    categoryId?: string;
    search?: string;
    subcategoryId?: string;
  },
) {
  const categories = await listAdminCategories();
  const subcategories = await listAdminSubcategories();
  const brands = await listAdminBrands();
  const fields = await listAdminSubcategoryFields();
  const products = await listAdminProducts(filters);
  const resolvedSelectedId =
    selectedId && products.some((product) => product.id === selectedId)
      ? selectedId
      : undefined;
  const selectedProduct = resolvedSelectedId
    ? await getAdminProductById(resolvedSelectedId)
    : null;

  return {
    brands,
    categories,
    fields,
    products,
    selectedProduct,
    subcategories,
  };
}
