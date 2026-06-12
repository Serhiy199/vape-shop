"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  StorefrontProductGallery,
  type StorefrontProductGalleryImage,
} from "@/components/storefront/product-gallery";
import { StorefrontProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import type {
  StorefrontProductCardItem,
  StorefrontProductOption,
  StorefrontProductOptionValue,
} from "@/components/storefront/product-types";

type ProductPurchaseHighlight = {
  label: string;
  value: string;
};

function optionValueToGalleryImage(
  value: StorefrontProductOptionValue,
): StorefrontProductGalleryImage {
  return {
    alt: value.label,
    id: `option-${value.id}`,
    isPrimary: false,
    url: value.image,
  };
}

export function StorefrontProductDetailExperience({
  highlights,
  images,
  option,
  product,
  selectedOptionValue: initialSelectedOptionValue = null,
  title,
}: {
  highlights: ProductPurchaseHighlight[];
  images: StorefrontProductGalleryImage[];
  option?: StorefrontProductOption | null;
  product: StorefrontProductCardItem;
  selectedOptionValue?: StorefrontProductOptionValue | null;
  title: string;
}) {
  const router = useRouter();
  const [activeImage, setActiveImage] =
    useState<StorefrontProductGalleryImage | null>(
      initialSelectedOptionValue
        ? optionValueToGalleryImage(initialSelectedOptionValue)
        : null,
    );
  const [selectedOptionValue, setSelectedOptionValue] =
    useState<StorefrontProductOptionValue | null>(initialSelectedOptionValue);

  const galleryImages = useMemo(() => {
    const optionImages =
      option?.values.map(optionValueToGalleryImage).filter((image) => {
        return !images.some((productImage) => productImage.url === image.url);
      }) ?? [];

    return [...images, ...optionImages];
  }, [images, option]);

  function handleSelectOptionValue(value: StorefrontProductOptionValue) {
    setSelectedOptionValue(value);
    setActiveImage(optionValueToGalleryImage(value));

    if (value.slug) {
      router.push(`/product/${value.slug}`);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,570px)_minmax(0,1fr)]">
      <StorefrontProductGallery
        activeImage={activeImage}
        images={galleryImages}
        onActiveImageChange={setActiveImage}
        title={title}
      />
      <StorefrontProductPurchasePanel
        highlights={highlights}
        onSelectOptionValue={handleSelectOptionValue}
        option={option}
        product={product}
        selectedOptionValue={selectedOptionValue}
      />
    </div>
  );
}
