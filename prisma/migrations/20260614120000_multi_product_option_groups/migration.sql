-- CreateEnum
CREATE TYPE "ProductOptionDisplayType" AS ENUM ('BUTTONS', 'IMAGE_SWATCH', 'SELECT');

-- DropIndex
DROP INDEX IF EXISTS "ProductOption_productId_key";

-- AlterTable
ALTER TABLE "ProductOption"
ADD COLUMN "isImageRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "displayType" "ProductOptionDisplayType" NOT NULL DEFAULT 'IMAGE_SWATCH',
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductOptionValue"
ALTER COLUMN "image" DROP NOT NULL;

-- Backfill missing option value slugs for the first/legacy option group.
WITH generated AS (
  SELECT
    pov."id",
    lower(
      regexp_replace(
        regexp_replace(p."slug" || '-' || pov."label", '[^a-zA-Z0-9]+', '-', 'g'),
        '(^-+|-+$)',
        '',
        'g'
      )
    ) AS base_slug
  FROM "ProductOptionValue" pov
  JOIN "ProductOption" po ON po."id" = pov."productOptionId"
  JOIN "Product" p ON p."id" = po."productId"
  WHERE pov."slug" IS NULL OR btrim(pov."slug") = ''
),
numbered AS (
  SELECT
    generated."id",
    CASE
      WHEN generated.base_slug = '' THEN 'option-value'
      ELSE generated.base_slug
    END AS base_slug
  FROM generated
)
UPDATE "ProductOptionValue" pov
SET "slug" = numbered.base_slug || '-' || substring(pov."id" from 1 for 8)
FROM numbered
WHERE pov."id" = numbered."id";

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "ProductOption"("productId", "name");

-- CreateIndex
CREATE INDEX "ProductOption_productId_sortOrder_idx" ON "ProductOption"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductOptionValue_productOptionId_idx" ON "ProductOptionValue"("productOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionValue_productOptionId_label_key" ON "ProductOptionValue"("productOptionId", "label");
