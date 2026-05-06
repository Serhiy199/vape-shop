export type StorefrontProductBadge = "new" | "sale" | "hit";

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
