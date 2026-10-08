/*
# Create products table (single-tenant, no auth)

1. New Tables
  - `products`
    - `id` (uuid, primary key)
    - `name` (text, not null) - Product name
    - `description` (text) - Product description
    - `price` (numeric, not null) - Price in soles
    - `price_usd` (numeric) - Price in USD
    - `original_price` (numeric) - Original price before discount
    - `discount` (integer, default 0) - Discount percentage
    - `image` (text) - Image URL
    - `category` (text, not null) - Product category slug
    - `badge` (text) - Optional badge label (Popular, Oferta, etc.)
    - `is_active` (boolean, default true) - Whether product is visible
    - `sort_order` (integer, default 0) - Display order
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

2. Security
  - Enable RLS on `products`.
  - Allow anon + authenticated full CRUD (single-tenant admin store).
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  price_usd numeric,
  original_price numeric,
  discount integer NOT NULL DEFAULT 0,
  image text,
  category text NOT NULL DEFAULT 'diamantes',
  badge text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);
