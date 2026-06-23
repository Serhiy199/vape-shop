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
      <span className="block w-full">
        <Image
          src={storefrontBrand.logoSrc}
          alt={`${storefrontBrand.name} logo`}
          width={1270}
          height={630}
          priority
          sizes="(max-width: 1024px) 100px, 120px"
          className="h-auto w-full object-contain object-left"
        />
      </span>
    </Link>
  );
}
