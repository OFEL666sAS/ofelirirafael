/*
# Featured products and promotional banner

1. Changes to existing tables
   - `products`
     - `is_featured` (boolean, default false) — marks a product to appear in the
       "Destacados" (featured) selection on the homepage.
     - `featured_order` (integer, default 0) — controls the display order of
       featured products (lower first).

2. New Tables
   - `promo_banners`
     - `id` (uuid, primary key)
     - `message` (text, not null) — the promotional text shown to visitors.
     - `cta_label` (text, nullable) — optional button label.
     - `cta_link` (text, nullable) — optional button destination.
     - `starts_at` (timestamptz, nullable) — when the promo becomes visible.
     - `ends_at` (timestamptz, nullable) — when the promo stops being visible.
     - `is_active` (boolean, default true) — manual on/off switch.
     - `created_at` / `updated_at` (timestamptz) — audit timestamps.

3. Security
   - Enable RLS on `promo_banners`.
   - Anonymous visitors can only read banners that are active AND within their
     start/end date window (so only current offers are shown).
   - Authenticated admins have full read/insert/update/delete access.

4. Notes
   1. All statements are idempotent and safe to re-run.
   2. No existing data is modified or removed.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'featured_order'
  ) THEN
    ALTER TABLE products ADD COLUMN featured_order integer NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured, featured_order);

CREATE TABLE IF NOT EXISTS promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  cta_label text,
  cta_link text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_banners" ON promo_banners;
CREATE POLICY "public_read_active_banners" ON promo_banners FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

DROP POLICY IF EXISTS "admin_insert_banners" ON promo_banners;
CREATE POLICY "admin_insert_banners" ON promo_banners FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_banners" ON promo_banners;
CREATE POLICY "admin_update_banners" ON promo_banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_banners" ON promo_banners;
CREATE POLICY "admin_delete_banners" ON promo_banners FOR DELETE
  TO authenticated USING (true);
