-- AlterTable: add basePrice and addons to order_items
ALTER TABLE "order_items" ADD COLUMN "basePrice" DECIMAL(10,2);
ALTER TABLE "order_items" ADD COLUMN "addons" JSONB;

-- Backfill basePrice from price for existing rows
UPDATE "order_items" SET "basePrice" = "price" WHERE "basePrice" IS NULL;

-- Make basePrice NOT NULL after backfill
ALTER TABLE "order_items" ALTER COLUMN "basePrice" SET NOT NULL;

-- CreateIndex: orders by userId and status for frequent queries
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- Dedupe mpPaymentId before creating unique index
-- Nulls out duplicate mpPaymentId on non-canonical rows (preserves order history)
UPDATE "orders" o
SET "mpPaymentId" = NULL
WHERE "mpPaymentId" IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON ("mpPaymentId") id
    FROM "orders"
    WHERE "mpPaymentId" IS NOT NULL
    ORDER BY "mpPaymentId", "createdAt" ASC
  );

-- CreateUniqueIndex: mpPaymentId to prevent duplicate MP webhooks
CREATE UNIQUE INDEX "orders_mpPaymentId_key" ON "orders"("mpPaymentId");
