-- Make Brand act as "Manufacturer" scoped to a required subcategory.
-- This migration assumes the current development database has no existing Brand rows.
-- If a target database already has Brand rows, backfill Brand.subcategoryId before
-- making it NOT NULL.

DROP INDEX IF EXISTS "Brand_name_key";
DROP INDEX IF EXISTS "Brand_slug_key";
DROP INDEX IF EXISTS "Brand_sortOrder_idx";

ALTER TABLE "Brand" ADD COLUMN "subcategoryId" TEXT NOT NULL;

ALTER TABLE "Brand"
  ADD CONSTRAINT "Brand_subcategoryId_fkey"
  FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Brand_subcategoryId_name_key" ON "Brand"("subcategoryId", "name");
CREATE UNIQUE INDEX "Brand_subcategoryId_slug_key" ON "Brand"("subcategoryId", "slug");
CREATE INDEX "Brand_subcategoryId_sortOrder_idx" ON "Brand"("subcategoryId", "sortOrder");
CREATE INDEX "Brand_isActive_idx" ON "Brand"("isActive");
