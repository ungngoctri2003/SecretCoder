-- Học phí lớp học (cùng quy ước lưu trữ với public.courses.price_cents: hiển thị VND = price_cents / 100)
ALTER TABLE public.classes
  ADD COLUMN price_cents INT NOT NULL DEFAULT 0;

ALTER TABLE public.classes
  ADD CONSTRAINT classes_price_cents_nonnegative CHECK (price_cents >= 0);
