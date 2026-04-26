-- Add image URL to order_items to snapshot product image at order time
ALTER TABLE "order_items" ADD COLUMN "image" TEXT;
