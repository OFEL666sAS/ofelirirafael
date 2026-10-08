/*
# Add product detail fields and gallery support

1. Modified Tables
  - `products`
    - `gallery` (text array) - Array of image URLs for product gallery
    - `details` (text) - Full product details/features
    - `warranty` (text) - Warranty/guarantee info
    - `status` (text, default 'disponible') - Product availability status (disponible/agotado)
    - `is_published` (boolean, default false) - Whether product is published to public

2. Important Notes
  - Added columns use defaults, no existing data affected
  - status field replaces simple is_active for more granular control
  - gallery stores multiple image URLs as an array
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gallery') THEN
    ALTER TABLE products ADD COLUMN gallery text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'details') THEN
    ALTER TABLE products ADD COLUMN details text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'warranty') THEN
    ALTER TABLE products ADD COLUMN warranty text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    ALTER TABLE products ADD COLUMN status text NOT NULL DEFAULT 'disponible';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_published') THEN
    ALTER TABLE products ADD COLUMN is_published boolean NOT NULL DEFAULT false;
  END IF;
END $$;
