import {
  getAdminBrandById,
  getAdminSubcategoryById,
  getFixedAdminCategoryById,
  listAdminBrands,
  listAdminSubcategories,
  listFixedAdminCategories,
} from "@/server/repositories/catalog.repository";

function resolveSelectedId<TItem extends { id: string }>(
  items: TItem[],
  selectedId?: string,
) {
  if (!items.length) {
    return undefined;
  }

  return items.some((item) => item.id === selectedId) ? selectedId : items[0].id;
}

export async function getAdminCategoriesPageData(selectedId?: string) {
  const categories = await listFixedAdminCategories();
  const resolvedSelectedId = resolveSelectedId(categories, selectedId);
  const selectedCategory = resolvedSelectedId
    ? await getFixedAdminCategoryById(resolvedSelectedId)
    : null;

  return {
    categories,
    selectedCategory,
  };
}

export async function getAdminSubcategoriesPageData(selectedId?: string) {
  const categories = await listFixedAdminCategories();
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
  const resolvedSelectedId = resolveSelectedId(brands, selectedId);
  const selectedBrand = resolvedSelectedId
    ? await getAdminBrandById(resolvedSelectedId)
    : null;

  return {
    brands,
    selectedBrand,
  };
}
