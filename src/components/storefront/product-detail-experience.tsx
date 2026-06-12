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
  companionProducts,
  images,
  otherModelProducts,
  option,
  product,
  selectedOptionValue: initialSelectedOptionValue = null,
  title,
}: {
  companionProducts?: StorefrontProductCardItem[];
  images: StorefrontProductGalleryImage[];
  otherModelProducts?: StorefrontProductCardItem[];
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
      <div className="space-y-3">
        <StorefrontProductPurchasePanel
          companionProducts={companionProducts}
          onSelectOptionValue={handleSelectOptionValue}
          otherModelProducts={otherModelProducts}
          option={option}
          product={product}
          selectedOptionValue={selectedOptionValue}
          title={title}
        />
      </div>
    </div>
  );
}
