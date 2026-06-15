import type { Metadata } from "next";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import {
  CmsPageShell,
  ContactLink,
  SafeMapEmbed,
} from "@/components/storefront/cms-content";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { ContactRequestForm } from "@/features/content/components/public-content-forms";
import { ensureContactSettings } from "@/server/repositories/content.repository";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await ensureContactSettings();

  return {
    description: settings.seoDescription ?? settings.subtitle ?? undefined,
    title: settings.seoTitle ?? settings.title,
  };
}

export default async function ContactsPage() {
  const settings = await ensureContactSettings();

  return (
    <CmsPageShell
      eyebrow="Підтримка"
      title={settings.title}
      description={settings.subtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <StorefrontCard className="p-5 sm:p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Зв&apos;язатися з нами
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {settings.workSchedule ?? "Пн-Нд: 10:00-20:00"}
              </p>
            </div>
            <div className="space-y-3 text-sm">
              {settings.phone ? (
                <p className="flex items-center gap-3">
                  <PhoneIcon className="text-primary size-4" />
                  {settings.phone}
                </p>
              ) : null}
              {settings.email ? (
                <p className="flex items-center gap-3">
                  <MailIcon className="text-primary size-4" />
                  {settings.email}
                </p>
              ) : null}
              {settings.address ? (
                <p className="flex items-center gap-3">
                  <MapPinIcon className="text-primary size-4" />
                  {settings.address}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <ContactLink href={settings.telegramUrl} label="Telegram" />
              <ContactLink href={settings.viberUrl} label="Viber" />
              <ContactLink href={settings.instagramUrl} label="Instagram" />
              <ContactLink href={settings.youtubeUrl} label="YouTube" />
              <ContactLink href={settings.facebookUrl} label="Facebook" />
              <ContactLink href={settings.tiktokUrl} label="TikTok" />
            </div>
          </div>
        </StorefrontCard>

        <StorefrontCard className="p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            {settings.formTitle ?? "Напишіть нам"}
          </h2>
          <ContactRequestForm enabled={settings.formEnabled} />
        </StorefrontCard>
      </div>

      <div className="mt-6">
        <SafeMapEmbed
          iframeHtml={settings.mapIframeHtml}
          mapEmbedUrl={settings.mapEmbedUrl}
        />
      </div>
    </CmsPageShell>
  );
}
