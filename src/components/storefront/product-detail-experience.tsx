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
  StorefrontSelectedProductOption,
} from "@/components/storefront/product-types";

function optionValueToGalleryImage(
  value: StorefrontProductOptionValue,
): StorefrontProductGalleryImage {
  return {
    alt: value.label,
    id: `option-${value.id}`,
    isPrimary: false,
    url: value.image ?? "",
  };
}

export function StorefrontProductDetailExperience({
  companionProducts,
  images,
  otherModelProducts,
  options = [],
  product,
  selectedOptionValue: initialSelectedOptionValue = null,
  title,
}: {
  companionProducts?: StorefrontProductCardItem[];
  images: StorefrontProductGalleryImage[];
  otherModelProducts?: StorefrontProductCardItem[];
  options?: StorefrontProductOption[];
  product: StorefrontProductCardItem;
  selectedOptionValue?: StorefrontProductOptionValue | null;
  title: string;
}) {
  const router = useRouter();
  const firstOption = options[0] ?? null;
  const initialSelectedValues = useMemo(() => {
    return Object.fromEntries(
      options.flatMap((option) => {
        const value =
          option.id === firstOption?.id && initialSelectedOptionValue
            ? initialSelectedOptionValue
            : option.values[0];

        return value ? [[option.id, value]] : [];
      }),
    ) as Record<string, StorefrontProductOptionValue>;
  }, [firstOption?.id, initialSelectedOptionValue, options]);
  const [activeImage, setActiveImage] =
    useState<StorefrontProductGalleryImage | null>(
      initialSelectedOptionValue?.image
        ? optionValueToGalleryImage(initialSelectedOptionValue)
        : null,
    );
  const [selectedOptionValue, setSelectedOptionValue] =
    useState<StorefrontProductOptionValue | null>(initialSelectedOptionValue);
  const [selectedValuesByOptionId, setSelectedValuesByOptionId] =
    useState(initialSelectedValues);

  const galleryImages = useMemo(() => {
    const optionImages =
      options
        .flatMap((option) => option.values)
        .filter((value) => Boolean(value.image))
        .map(optionValueToGalleryImage)
        .filter((image) => {
          return !images.some((productImage) => productImage.url === image.url);
        });

    return [...images, ...optionImages];
  }, [images, options]);

  function handleSelectOptionValue(
    option: StorefrontProductOption,
    value: StorefrontProductOptionValue,
  ) {
    setSelectedValuesByOptionId((current) => ({
      ...current,
      [option.id]: value,
    }));

    if (option.id === firstOption?.id) {
      setSelectedOptionValue(value);
    }

    if (option.id === firstOption?.id && value.image) {
      setActiveImage(optionValueToGalleryImage(value));
    }

    if (option.id === firstOption?.id && value.slug) {
      router.push(`/product/${value.slug}`);
    }
  }

  const selectedOptions = useMemo<StorefrontSelectedProductOption[]>(() => {
    return options.flatMap((option) => {
      const value = selectedValuesByOptionId[option.id] ?? option.values[0];

      if (!value) {
        return [];
      }

      return [
        {
          optionId: option.id,
          optionName: option.name,
          valueId: value.id,
          valueName: value.label,
          valueSlug: value.slug ?? null,
        },
      ];
    });
  }, [options, selectedValuesByOptionId]);

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
          options={options}
          product={product}
          selectedOptionValue={selectedOptionValue}
          selectedOptionValues={selectedValuesByOptionId}
          selectedOptions={selectedOptions}
          title={title}
        />
      </div>
    </div>
  );
}
