-- Account area MVP: preserve existing columns while adding MVP-friendly fields.
ALTER TABLE "Address" ADD COLUMN "fullName" TEXT;
ALTER TABLE "Address" ADD COLUMN "address" TEXT;
ALTER TABLE "Address" ADD COLUMN "comment" TEXT;

UPDATE "Address"
SET
  "fullName" = NULLIF(BTRIM(CONCAT_WS(' ', "firstName", NULLIF("lastName", ''))), ''),
  "address" = "addressLine1",
  "comment" = "addressLine2"
WHERE "fullName" IS NULL OR "address" IS NULL OR "comment" IS NULL;

-- Store richer order item snapshots for account history and repeat-order validation.
ALTER TABLE "OrderItem" ADD COLUMN "productImage" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedOptions" JSONB;
