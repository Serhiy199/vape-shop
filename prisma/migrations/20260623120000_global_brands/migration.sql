-- Make Brand global instead of scoped to Subcategory.
-- Existing duplicate brands are merged first by normalized slug, then by
-- normalized name. Products are re-pointed to the surviving Brand record.

WITH ranked AS (
  SELECT
    b.id,
    FIRST_VALUE(b.id) OVER (
      PARTITION BY lower(b.slug)
      ORDER BY p.product_count DESC NULLS LAST, b."isActive" DESC, b."createdAt" ASC, b.id ASC
    ) AS master_id
  FROM "Brand" b
  LEFT JOIN (
    SELECT "brandId", COUNT(*) AS product_count
    FROM "Product"
    WHERE "brandId" IS NOT NULL
    GROUP BY "brandId"
  ) p ON p."brandId" = b.id
),
duplicates AS (
  SELECT id, master_id
  FROM ranked
  WHERE id <> master_id
)
UPDATE "Product" p
SET "brandId" = d.master_id
FROM duplicates d
WHERE p."brandId" = d.id;

WITH ranked AS (
  SELECT
    b.id,
    FIRST_VALUE(b.id) OVER (
      PARTITION BY lower(b.slug)
      ORDER BY p.product_count DESC NULLS LAST, b."isActive" DESC, b."createdAt" ASC, b.id ASC
    ) AS master_id
  FROM "Brand" b
  LEFT JOIN (
    SELECT "brandId", COUNT(*) AS product_count
    FROM "Product"
    WHERE "brandId" IS NOT NULL
    GROUP BY "brandId"
  ) p ON p."brandId" = b.id
),
duplicates AS (
  SELECT id
  FROM ranked
  WHERE id <> master_id
)
DELETE FROM "Brand" b
USING duplicates d
WHERE b.id = d.id;

WITH ranked AS (
  SELECT
    b.id,
    FIRST_VALUE(b.id) OVER (
      PARTITION BY lower(b.name)
      ORDER BY p.product_count DESC NULLS LAST, b."isActive" DESC, b."createdAt" ASC, b.id ASC
    ) AS master_id
  FROM "Brand" b
  LEFT JOIN (
    SELECT "brandId", COUNT(*) AS product_count
    FROM "Product"
    WHERE "brandId" IS NOT NULL
    GROUP BY "brandId"
  ) p ON p."brandId" = b.id
),
duplicates AS (
  SELECT id, master_id
  FROM ranked
  WHERE id <> master_id
)
UPDATE "Product" p
SET "brandId" = d.master_id
FROM duplicates d
WHERE p."brandId" = d.id;

WITH ranked AS (
  SELECT
    b.id,
    FIRST_VALUE(b.id) OVER (
      PARTITION BY lower(b.name)
      ORDER BY p.product_count DESC NULLS LAST, b."isActive" DESC, b."createdAt" ASC, b.id ASC
    ) AS master_id
  FROM "Brand" b
  LEFT JOIN (
    SELECT "brandId", COUNT(*) AS product_count
    FROM "Product"
    WHERE "brandId" IS NOT NULL
    GROUP BY "brandId"
  ) p ON p."brandId" = b.id
),
duplicates AS (
  SELECT id
  FROM ranked
  WHERE id <> master_id
)
DELETE FROM "Brand" b
USING duplicates d
WHERE b.id = d.id;

DROP INDEX IF EXISTS "Brand_subcategoryId_name_key";
DROP INDEX IF EXISTS "Brand_subcategoryId_slug_key";
DROP INDEX IF EXISTS "Brand_subcategoryId_sortOrder_idx";

ALTER TABLE "Brand" DROP CONSTRAINT IF EXISTS "Brand_subcategoryId_fkey";
ALTER TABLE "Brand" DROP COLUMN "subcategoryId";

CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE INDEX "Brand_sortOrder_idx" ON "Brand"("sortOrder");
