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
  rating?: number;
  reviewCount?: number;
  slug: string;
  title: string;
};

export type StorefrontProductOptionValue = {
  id: string;
  image: string;
  imagePublicId?: string | null;
  label: string;
  slug?: string | null;
  titleOverride?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder: number;
};

export type StorefrontProductOption = {
  id: string;
  name: string;
  values: StorefrontProductOptionValue[];
};
