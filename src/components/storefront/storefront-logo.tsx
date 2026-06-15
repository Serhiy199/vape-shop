import Image from "next/image";
import Link from "next/link";

import { storefrontBrand } from "@/components/storefront/storefront-config";
import { cn } from "@/lib/utils";

export function StorefrontLogo({
  className,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-w-fit items-center gap-3",
        className,
      )}
      aria-label={`${storefrontBrand.name} - головна сторінка`}
    >
      <span className="relative block h-14 w-36 overflow-hidden sm:h-16 sm:w-44 lg:h-18 lg:w-52">
        <Image
          src={storefrontBrand.logoSrc}
          alt={`${storefrontBrand.name} logo`}
          fill
          priority
          sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 208px"
          className="object-contain object-left"
        />
      </span>
    </Link>
  );
}
