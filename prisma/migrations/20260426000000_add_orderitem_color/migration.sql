-- Add color column to order_items (nullable — products without color selection leave it NULL)
ALTER TABLE "order_items" ADD COLUMN "color" TEXT;
