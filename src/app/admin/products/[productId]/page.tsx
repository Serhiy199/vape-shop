import { notFound } from "next/navigation";

import {
  AdminActionsBar,
  AdminPageHeader,
} from "@/components/admin/admin-primitives";
import { AdminProductCrud } from "@/features/catalog/components/admin-product-crud";
import { getAdminProductsPageData } from "@/server/queries/admin-catalog.query";

type Params = Promise<{
  productId: string;
}>;

export default async function AdminProductEditPage({
  params,
}: {
  params: Params;
}) {
  const { productId } = await params;
  const { brands, categories, fields, selectedProduct, subcategories } =
    await getAdminProductsPageData(productId);

  if (!selectedProduct) {
    notFound();
  }

  const mappedBrands = brands.map((brand) => ({
    id: brand.id,
    isActive: brand.isActive,
    name: brand.name,
    slug: brand.slug,
    subcategoryId: brand.subcategoryId,
  }));

  const mappedCategories = categories.map((category) => ({
    id: category.id,
    isActive: category.isActive,
    name: category.name,
    slug: category.slug,
  }));

  const mappedSubcategories = subcategories.map((subcategory) => ({
    category: {
      id: subcategory.category.id,
      isActive: subcategory.category.isActive,
      name: subcategory.category.name,
    },
    id: subcategory.id,
    isActive: subcategory.isActive,
    name: subcategory.name,
    slug: subcategory.slug,
  }));

  const mappedFields = fields.map((field) => ({
    helpText: field.helpText,
    id: field.id,
    isRequired: field.isRequired,
    key: field.key,
    label: field.label,
    options: field.options.map((option) => ({
      id: option.id,
      label: option.label,
      sortOrder: option.sortOrder,
      value: option.value,
    })),
    sortOrder: field.sortOrder,
    subcategoryId: field.subcategoryId,
    type: field.type,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Товари"
        title={`Редагування: ${selectedProduct.title}`}
        description="Форма редагування винесена на окрему сторінку. Кроки зверху працюють як швидка навігація по розділах товару."
        badges={[
          selectedProduct.isActive ? "Активний" : "Неактивний",
          selectedProduct.availability,
        ]}
      />

      <AdminActionsBar
        actions={[
          {
            href: "/admin/products",
            label: "Повернутися до списку",
            variant: "outline",
          },
          {
            href: `/product/${selectedProduct.slug}`,
            label: "Відкрити на сайті",
            variant: "outline",
          },
        ]}
        note="Клік по будь-якому кроку у формі одразу відкриває потрібний розділ."
      />

      <AdminProductCrud
        brands={mappedBrands}
        categories={mappedCategories}
        fields={mappedFields}
        mode="edit"
        selectedProduct={{
          availability: selectedProduct.availability,
          brand: selectedProduct.brand
            ? {
                id: selectedProduct.brand.id,
                isActive: selectedProduct.brand.isActive,
                name: selectedProduct.brand.name,
                subcategoryId: selectedProduct.brand.subcategoryId,
              }
            : null,
          category: {
            id: selectedProduct.category.id,
            isActive: selectedProduct.category.isActive,
            name: selectedProduct.category.name,
          },
          description: selectedProduct.description,
          fieldValues: selectedProduct.fieldValues.map((fieldValue) => ({
            field: {
              id: fieldValue.field.id,
              key: fieldValue.field.key,
              label: fieldValue.field.label,
              type: fieldValue.field.type,
            },
            option: fieldValue.option
              ? {
                  id: fieldValue.option.id,
                  label: fieldValue.option.label,
                }
              : null,
            optionId: fieldValue.optionId,
            valueBoolean: fieldValue.valueBoolean,
            valueJson: fieldValue.valueJson,
            valueNumber: fieldValue.valueNumber,
            valueText: fieldValue.valueText,
          })),
          id: selectedProduct.id,
          images: selectedProduct.images.map((image) => ({
            alt: image.alt,
            id: image.id,
            isPrimary: image.isPrimary,
            publicId: image.publicId,
            sortOrder: image.sortOrder,
            url: image.url,
          })),
          isActive: selectedProduct.isActive,
          isFeaturedDiscount: selectedProduct.isFeaturedDiscount,
          isFeaturedHit: selectedProduct.isFeaturedHit,
          isFeaturedNew: selectedProduct.isFeaturedNew,
          isFeaturedSale: selectedProduct.isFeaturedSale,
          option: selectedProduct.option
            ? {
                id: selectedProduct.option.id,
                name: selectedProduct.option.name,
                values: selectedProduct.option.values.map((value) => ({
                  id: value.id,
                  image: value.image,
                  imagePublicId: value.imagePublicId,
                  label: value.label,
                  sortOrder: value.sortOrder,
                })),
              }
            : null,
          price: selectedProduct.price,
          seoDescription: selectedProduct.seoDescription,
          seoTitle: selectedProduct.seoTitle,
          slug: selectedProduct.slug,
          subcategory: {
            categoryId: selectedProduct.subcategory.categoryId,
            id: selectedProduct.subcategory.id,
            isActive: selectedProduct.subcategory.isActive,
            name: selectedProduct.subcategory.name,
          },
          title: selectedProduct.title,
        }}
        subcategories={mappedSubcategories}
      />
    </div>
  );
}
