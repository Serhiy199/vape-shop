ALTER TABLE "ProductOptionValue"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "titleOverride" TEXT,
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT;

CREATE UNIQUE INDEX "ProductOptionValue_slug_key" ON "ProductOptionValue"("slug");
