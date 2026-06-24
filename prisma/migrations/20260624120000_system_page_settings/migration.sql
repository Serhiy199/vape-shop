CREATE TABLE "SystemPageSettings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SystemPageSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SystemPageSettings_key_key" ON "SystemPageSettings"("key");
CREATE INDEX "SystemPageSettings_isActive_sortOrder_idx" ON "SystemPageSettings"("isActive", "sortOrder");

INSERT INTO "SystemPageSettings" ("id", "key", "title", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (concat('system-page-', 'contacts'), 'contacts', 'Контакти', true, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (concat('system-page-', 'blog'), 'blog', 'Блог', true, 110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (concat('system-page-', 'faq'), 'faq', 'FAQ', true, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (concat('system-page-', 'reviews'), 'reviews', 'Відгуки', true, 130, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (concat('system-page-', 'certificates'), 'certificates', 'Сертифікати', true, 140, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

UPDATE "ContentPage"
SET "slug" = 'delivery', "sortOrder" = 1, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'delivery-and-payment'
  AND NOT EXISTS (SELECT 1 FROM "ContentPage" WHERE "slug" = 'delivery');

UPDATE "ContentPage"
SET "slug" = 'about', "sortOrder" = 3, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'about-us'
  AND NOT EXISTS (SELECT 1 FROM "ContentPage" WHERE "slug" = 'about');

UPDATE "ContentPage"
SET "slug" = 'privacy', "sortOrder" = 4, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'privacy-policy'
  AND NOT EXISTS (SELECT 1 FROM "ContentPage" WHERE "slug" = 'privacy');

UPDATE "ContentPage"
SET "slug" = 'terms', "sortOrder" = 6, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'terms-of-use'
  AND NOT EXISTS (SELECT 1 FROM "ContentPage" WHERE "slug" = 'terms');

UPDATE "ContentPage"
SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('delivery-and-payment', 'about-us', 'privacy-policy', 'terms-of-use');

INSERT INTO "ContentPage" (
  "id",
  "title",
  "slug",
  "excerpt",
  "contentHtml",
  "isActive",
  "showInHeader",
  "showInFooter",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  'content-page-payment',
  'Оплата',
  'payment',
  'Способи оплати та підтвердження замовлень.',
  '<p>Додайте актуальну інформацію про оплату карткою, післяплату або інші способи оплати.</p>',
  true,
  false,
  true,
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "ContentPage" WHERE "slug" = 'payment');
