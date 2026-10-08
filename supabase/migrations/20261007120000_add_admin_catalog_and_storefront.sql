/* Admin-managed categories, product/category assignments, storefront settings and private FF accounts. */

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Package',
  keywords text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_visible boolean NOT NULL DEFAULT true,
  is_free_fire boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO categories (slug, name, description, icon, keywords, sort_order, is_free_fire)
VALUES
  ('diamantes', 'Diamantes', 'Recargas de diamantes para Free Fire.', 'Diamond', 'free fire,ff,diamantes,recarga', 10, true),
  ('cuentas', 'Cuentas Free Fire', 'Cuentas Free Fire verificadas.', 'UserCheck', 'free fire,ff,cuentas', 20, true),
  ('fragmentos', 'Fragmentos', 'Caja de Fragmentos y productos Free Fire.', 'Sparkles', 'free fire,ff,caja,fragmentos', 30, true),
  ('streaming', 'Streaming', 'Netflix, YouTube y más servicios premium.', 'Tv', 'netflix,youtube,spotify,disney,hbo', 40, false),
  ('ia', 'Inteligencia Artificial', 'Herramientas para crear y trabajar.', 'Brain', 'ia,ai,chatgpt,canva,software', 50, false),
  ('vpn', 'VPN', 'Privacidad y licencias digitales.', 'Shield', 'vpn,licencia,seguridad', 60, false),
  ('metodos', 'Métodos', 'Métodos y activaciones actualizadas.', 'BookOpen', 'metodos,métodos,activacion', 70, false),
  ('cursos', 'Cursos', 'Cursos y aprendizaje digital.', 'GraduationCap', 'curso,cursos,educacion', 80, false),
  ('aplicaciones', 'Aplicaciones', 'Aplicaciones y software digital.', 'MonitorSmartphone', 'apps,aplicaciones,software', 90, false),
  ('otros', 'Otros', 'Más productos digitales.', 'Package', 'otros,digital', 100, false)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_visible_categories" ON categories;
CREATE POLICY "public_read_visible_categories" ON categories FOR SELECT TO anon USING (is_active = true AND is_visible = true);
DROP POLICY IF EXISTS "admin_read_categories" ON categories;
CREATE POLICY "admin_read_categories" ON categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.slug = p.category
ON CONFLICT DO NOTHING;

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_categories" ON product_categories;
CREATE POLICY "public_read_product_categories" ON product_categories FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active = true AND p.is_published = true)
  AND EXISTS (SELECT 1 FROM categories c WHERE c.id = category_id AND c.is_active = true AND c.is_visible = true)
);
DROP POLICY IF EXISTS "admin_read_product_categories" ON product_categories;
CREATE POLICY "admin_read_product_categories" ON product_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_product_categories" ON product_categories;
CREATE POLICY "admin_write_product_categories" ON product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE app_config ADD COLUMN IF NOT EXISTS exchange_rate numeric NOT NULL DEFAULT 3.45 CHECK (exchange_rate > 0);
ALTER TABLE app_config ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '51943592821';
ALTER TABLE app_config ADD COLUMN IF NOT EXISTS delivery_text text NOT NULL DEFAULT 'Entrega aproximada de 5 a 30 minutos';

CREATE TABLE IF NOT EXISTS free_fire_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold','reserved')),
  cost numeric NOT NULL DEFAULT 0 CHECK (cost >= 0),
  sale_price numeric CHECK (sale_price IS NULL OR sale_price >= 0),
  email text,
  phone text,
  links text,
  notes text,
  sold_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE free_fire_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_free_fire_accounts" ON free_fire_accounts;
CREATE POLICY "admin_manage_free_fire_accounts" ON free_fire_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  details text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_payment_methods" ON payment_methods;
CREATE POLICY "admin_manage_payment_methods" ON payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS admin_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'whatsapp',
  value text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_contacts" ON admin_contacts;
CREATE POLICY "admin_manage_contacts" ON admin_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
