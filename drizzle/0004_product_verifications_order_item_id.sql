-- Şema ile uyum: productVerifications.orderItemId (sipariş kalemi ile eşleştirme)
ALTER TABLE "productVerifications" ADD COLUMN IF NOT EXISTS "orderItemId" integer;
