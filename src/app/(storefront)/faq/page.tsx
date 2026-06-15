import type { Metadata } from "next";

import { CmsPageShell } from "@/components/storefront/cms-content";
import { SafeRichTextContent } from "@/components/storefront/safe-rich-text-content";
import { StorefrontCard } from "@/components/storefront/storefront-primitives";
import { listActiveFAQSections } from "@/server/repositories/content.repository";

export const metadata: Metadata = {
  description: "FAQ - питання та відповіді магазину Voodoo Vape.",
  title: "FAQ - Питання та відповіді",
};

export default async function FAQPage() {
  const sections = await listActiveFAQSections();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answerHtml ?? "",
        },
        name: item.question,
      })),
    ),
  };

  return (
    <CmsPageShell
      eyebrow="Допомога"
      title="FAQ - Питання та відповіді"
      description="Відповіді на часті питання про покупки, оплату, доставку та сервіс."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontCard className="p-5 sm:p-7">
        <div className="space-y-8">
          {sections.length ? (
            sections.map((section) => (
              <section key={section.id} className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <details
                      key={item.id}
                      className="border-border rounded-lg border p-4"
                    >
                      <summary className="cursor-pointer font-medium">
                        {item.question}
                      </summary>
                      <SafeRichTextContent
                        html={item.answerHtml}
                        className="mt-3"
                      />
                    </details>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              FAQ ще не заповнений.
            </p>
          )}
        </div>
      </StorefrontCard>
    </CmsPageShell>
  );
}
