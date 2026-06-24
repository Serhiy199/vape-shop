import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageShell } from "@/components/storefront/cms-content";
import { SafeRichTextContent } from "@/components/storefront/safe-rich-text-content";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import {
  ensureCertificateSettings,
  isSystemPageActive,
  listActiveCertificateGroups,
} from "@/server/repositories/content.repository";

export async function generateMetadata(): Promise<Metadata> {
  if (!(await isSystemPageActive("certificates"))) {
    return {};
  }

  const settings = await ensureCertificateSettings();

  return {
    description: settings.seoDescription ?? undefined,
    title: settings.seoTitle ?? settings.title,
  };
}

export default async function CertificatesPage() {
  if (!(await isSystemPageActive("certificates"))) {
    notFound();
  }

  const [settings, groups] = await Promise.all([
    ensureCertificateSettings(),
    listActiveCertificateGroups(),
  ]);
  const documentCount = groups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <CmsPageShell
      eyebrow="Документи"
      title={settings.title}
      description="Сертифікати відповідності та супровідні документи."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <StorefrontCard className="p-4">
            <h2 className="font-semibold">Групи</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {groups.map((group) => (
                <a key={group.id} href={`#${group.slug}`}>
                  {group.name}
                </a>
              ))}
            </div>
          </StorefrontCard>
          <StorefrontCard className="p-4">
            <p className="text-3xl font-semibold">{documentCount}</p>
            <p className="text-muted-foreground text-sm">документів</p>
          </StorefrontCard>
        </aside>
        <div className="space-y-6">
          {settings.introHtml ? (
            <StorefrontCard className="p-5">
              <SafeRichTextContent html={settings.introHtml} />
            </StorefrontCard>
          ) : null}
          {groups.length ? (
            groups.map((group) => (
              <section key={group.id} id={group.slug} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {group.name}
                  </h2>
                  <SafeRichTextContent
                    html={group.descriptionHtml}
                    className="mt-2"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <StorefrontCard key={item.id} className="overflow-hidden">
                      {item.previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewImage}
                          alt=""
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : null}
                      <div className="space-y-3 p-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-primary text-primary-foreground inline-flex rounded-lg px-4 py-2 text-sm font-semibold"
                          >
                            Завантажити
                          </a>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Файл ще не додано.
                          </p>
                        )}
                      </div>
                    </StorefrontCard>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <StorefrontCard className="p-5">
              <p className="text-muted-foreground text-sm">
                Сертифікати ще не додані.
              </p>
            </StorefrontCard>
          )}
        </div>
      </div>
    </CmsPageShell>
  );
}
