export type StorefrontProductBadge = "new" | "sale" | "hit" | "discount";

export type StorefrontProductCardItem = {
  availability: "in_stock" | "out_of_stock";
  badges?: StorefrontProductBadge[];
  brand?: string;
  href: string;
  id: string;
  imageAlt?: string;
  imageSrc?: string;
  price: number;
  productId: string;
  rating?: number;
  reviewCount?: number;
  slug: string;
  title: string;
  type: "product" | "variant";
  variantValueId?: string;
};

export type StorefrontProductOptionValue = {
  id: string;
  image?: string | null;
  imagePublicId?: string | null;
  label: string;
  slug?: string | null;
  titleOverride?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder: number;
};

export type StorefrontProductOption = {
  displayType: "BUTTONS" | "IMAGE_SWATCH" | "SELECT";
  id: string;
  isImageRequired: boolean;
  name: string;
  sortOrder: number;
  values: StorefrontProductOptionValue[];
};

export type StorefrontSelectedProductOption = {
  optionId: string;
  optionName: string;
  valueId: string;
  valueName: string;
  valueSlug?: string | null;
};
