import Image from "next/image";
import Link from "next/link";

import { SafeRichTextContent } from "@/components/storefront/safe-rich-text-content";
import {
  StorefrontActionLink,
  StorefrontCard,
  StorefrontPageHeader,
  StorefrontSection,
  storefrontPatterns,
} from "@/components/storefront/storefront-primitives";

export function CmsPageShell({
  actions,
  children,
  description,
  eyebrow = "Контент",
  title,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  description?: string | null;
  eyebrow?: string;
  title: string;
}) {
  return (
    <>
      <StorefrontPageHeader
        breadcrumbs={[{ href: "/", label: "Головна" }, { label: title }]}
        eyebrow={eyebrow}
        title={title}
        description={description ?? undefined}
        actions={actions}
      />
      <StorefrontSection>
        <div className="mx-auto max-w-6xl">{children}</div>
      </StorefrontSection>
    </>
  );
}

export function CmsRichContent({
  heroImage,
  html,
}: {
  heroImage?: string | null;
  html?: string | null;
}) {
  return (
    <StorefrontCard className="overflow-hidden">
      {heroImage ? (
        <div className="relative aspect-[16/7] bg-muted">
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-5 sm:p-7">
        <SafeRichTextContent html={html} />
        {!html ? (
          <p className={storefrontPatterns.bodyText}>
            Контент цієї сторінки ще не заповнено.
          </p>
        ) : null}
      </div>
    </StorefrontCard>
  );
}

export function ContactLink({
  href,
  label,
}: {
  href?: string | null;
  label: string;
}) {
  if (!href) {
    return null;
  }

  return (
    <Link href={href} className="text-primary text-sm font-medium">
      {label}
    </Link>
  );
}

export function SafeMapEmbed({
  iframeHtml,
  mapEmbedUrl,
}: {
  iframeHtml?: string | null;
  mapEmbedUrl?: string | null;
}) {
  const iframeSrc = resolveGoogleMapsSrc(iframeHtml) ?? mapEmbedUrl;

  if (!iframeSrc || !isAllowedGoogleMapsUrl(iframeSrc)) {
    return null;
  }

  return (
    <iframe
      src={iframeSrc}
      className="h-[360px] w-full rounded-xl border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Google Map"
    />
  );
}

export function CatalogAction() {
  return (
    <StorefrontActionLink href="/catalog" variant="outline" size="default">
      Перейти в каталог
    </StorefrontActionLink>
  );
}

function resolveGoogleMapsSrc(iframeHtml?: string | null) {
  if (!iframeHtml) {
    return null;
  }

  return iframeHtml.match(/\ssrc=["']([^"']+)["']/i)?.[1] ?? null;
}

function isAllowedGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.hostname === "www.google.com" ||
      url.hostname === "maps.google.com" ||
      url.hostname.endsWith(".google.com")
    );
  } catch {
    return false;
  }
}
