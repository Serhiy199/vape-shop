-- Extend characteristic field types.
ALTER TYPE "SubcategoryFieldType" ADD VALUE 'MULTI_SELECT';

-- Soft visibility for characteristic template fields.
ALTER TABLE "SubcategoryField" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Product badge extension.
ALTER TABLE "Product" ADD COLUMN "isFeaturedDiscount" BOOLEAN NOT NULL DEFAULT false;

-- Multi-select characteristic values can be stored as JSON arrays.
ALTER TABLE "ProductFieldValue" ADD COLUMN "valueJson" JSONB;

-- Snapshot selected product option into order items.
ALTER TABLE "OrderItem" ADD COLUMN "selectedOptionName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedOptionValue" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedOptionValueId" TEXT;

-- Product may have zero or one option group.
CREATE TABLE "ProductOption" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- Each option value has exactly one image for PDP selection.
CREATE TABLE "ProductOptionValue" (
  "id" TEXT NOT NULL,
  "productOptionId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "imagePublicId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductOption_productId_key" ON "ProductOption"("productId");
CREATE INDEX "ProductOption_productId_idx" ON "ProductOption"("productId");
CREATE INDEX "ProductOptionValue_productOptionId_sortOrder_idx" ON "ProductOptionValue"("productOptionId", "sortOrder");
CREATE INDEX "SubcategoryField_isActive_idx" ON "SubcategoryField"("isActive");
CREATE INDEX "OrderItem_selectedOptionValueId_idx" ON "OrderItem"("selectedOptionValueId");

ALTER TABLE "ProductOption"
  ADD CONSTRAINT "ProductOption_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductOptionValue"
  ADD CONSTRAINT "ProductOptionValue_productOptionId_fkey"
  FOREIGN KEY ("productOptionId") REFERENCES "ProductOption"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
