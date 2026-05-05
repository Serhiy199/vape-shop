"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = {
  id: string;
  name: string;
};

type SubcategoryOption = {
  category: {
    id: string;
  };
  id: string;
  name: string;
};

type BrandOption = {
  id: string;
  name: string;
};

type AdminProductFiltersProps = {
  brands: BrandOption[];
  categories: CategoryOption[];
  initialFilters: {
    brandId?: string;
    categoryId?: string;
    search?: string;
    subcategoryId?: string;
  };
  subcategories: SubcategoryOption[];
};

const ALL_VALUE = "__all__";

export function AdminProductFilters({
  brands,
  categories,
  initialFilters,
  subcategories,
}: AdminProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId ?? ALL_VALUE);
  const [subcategoryId, setSubcategoryId] = useState(
    initialFilters.subcategoryId ?? ALL_VALUE,
  );
  const [brandId, setBrandId] = useState(initialFilters.brandId ?? ALL_VALUE);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(initialFilters.search ?? "");
      setCategoryId(initialFilters.categoryId ?? ALL_VALUE);
      setSubcategoryId(initialFilters.subcategoryId ?? ALL_VALUE);
      setBrandId(initialFilters.brandId ?? ALL_VALUE);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialFilters.brandId, initialFilters.categoryId, initialFilters.search, initialFilters.subcategoryId]);

  const availableSubcategories = useMemo(() => {
    if (categoryId === ALL_VALUE) {
      return subcategories;
    }

    return subcategories.filter(
      (subcategory) => subcategory.category.id === categoryId,
    );
  }, [categoryId, subcategories]);

  const categoryItems = useMemo(
    () => [
      { value: ALL_VALUE, label: "Усі категорії" },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  );

  const subcategoryItems = useMemo(
    () => [
      { value: ALL_VALUE, label: "Усі підкатегорії" },
      ...availableSubcategories.map((subcategory) => ({
        value: subcategory.id,
        label: subcategory.name,
      })),
    ],
    [availableSubcategories],
  );

  const brandItems = useMemo(
    () => [
      { value: ALL_VALUE, label: "Усі бренди" },
      ...brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
      })),
    ],
    [brands],
  );

  const applyFilters = () => {
    const params = new URLSearchParams();

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (categoryId !== ALL_VALUE) {
      params.set("categoryId", categoryId);
    }

    if (subcategoryId !== ALL_VALUE) {
      params.set("subcategoryId", subcategoryId);
    }

    if (brandId !== ALL_VALUE) {
      params.set("brandId", brandId);
    }

    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
    router.refresh();
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryId(ALL_VALUE);
    setSubcategoryId(ALL_VALUE);
    setBrandId(ALL_VALUE);
    router.push(pathname);
    router.refresh();
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))_auto]">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Пошук за назвою або slug"
      />

      <Select
        items={categoryItems}
        value={categoryId}
        onValueChange={(value) => {
          if (!value) {
            return;
          }

          setCategoryId(value);
          setSubcategoryId(ALL_VALUE);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Усі категорії" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Усі категорії</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={subcategoryItems}
        value={subcategoryId}
        onValueChange={(value) => {
          if (!value) {
            return;
          }

          setSubcategoryId(value);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Усі підкатегорії" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Усі підкатегорії</SelectItem>
          {availableSubcategories.map((subcategory) => (
            <SelectItem key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={brandItems}
        value={brandId}
        onValueChange={(value) => {
          if (!value) {
            return;
          }

          setBrandId(value);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Усі бренди" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Усі бренди</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetFilters}>
          Скинути
        </Button>
        <Button type="button" onClick={applyFilters}>
          Застосувати
        </Button>
      </div>
    </div>
  );
}
