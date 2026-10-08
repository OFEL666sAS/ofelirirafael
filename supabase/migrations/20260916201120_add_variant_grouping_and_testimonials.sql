/*
# Add variant grouping columns and testimonials table

1. New columns on products table
- service_name (text): base service name for grouping variants
- duration (text): duration label like "3 meses", "1 mes"
- display_order (int, default 0): sort within variant group

2. New table: testimonials
- Admin-manageable testimonials/references gallery
- Public read, authenticated write

3. Security
- testimonials: RLS enabled, anon+authenticated SELECT, authenticated INSERT/UPDATE/DELETE
- products: no RLS changes (existing policies remain)
*/

DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS service_name text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS duration text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;
END $$;

-- Set service_name and duration for streaming products with known patterns
UPDATE products SET service_name = 'Crunchyroll Mega Fan', duration = '12 meses' WHERE name LIKE 'Crunchyroll%12%';
UPDATE products SET service_name = 'Crunchyroll Mega Fan', duration = '6 meses' WHERE name LIKE 'Crunchyroll%6%';
UPDATE products SET service_name = 'Crunchyroll Mega Fan', duration = '3 meses' WHERE name LIKE 'Crunchyroll%3%';

UPDATE products SET service_name = 'YouTube Premium', duration = '1 mes' WHERE name LIKE 'YouTube Premium 1%';
UPDATE products SET service_name = 'YouTube Premium Familiar', duration = '1 mes' WHERE name LIKE 'YouTube%Familiar%';

UPDATE products SET service_name = 'Prime Video Estudiante', duration = '6 meses' WHERE name LIKE 'Prime Video Estudiante%';
UPDATE products SET service_name = 'Netflix Premium', duration = '1 mes' WHERE name LIKE 'Netflix%';

-- Set display_order for Crunchyroll variants (3 -> 0, 6 -> 1, 12 -> 2)
UPDATE products SET display_order = 0 WHERE service_name = 'Crunchyroll Mega Fan' AND duration = '3 meses';
UPDATE products SET display_order = 1 WHERE service_name = 'Crunchyroll Mega Fan' AND duration = '6 meses';
UPDATE products SET display_order = 2 WHERE service_name = 'Crunchyroll Mega Fan' AND duration = '12 meses';

-- Add warranty to Crunchyroll and YouTube
UPDATE products SET warranty = 'Garantía de 7 días por cualquier inconveniente con la cuenta' 
WHERE service_name IN ('Crunchyroll Mega Fan', 'YouTube Premium', 'YouTube Premium Familiar') AND warranty IS NULL;

-- Set details for products that lack them
UPDATE products SET details = 'Características del servicio:
• Acceso completo a la plataforma
• Calidad HD / Full HD
• Compatible con múltiples dispositivos
• Descargas para ver sin conexión
• Activación inmediata tras confirmar el pago

Instrucciones:
1. Después de comprar, envíanos tu ID de usuario o correo
2. Realizamos la activación
3. Recibes confirmación y acceso'
WHERE service_name = 'Crunchyroll Mega Fan' AND details IS NULL;

UPDATE products SET details = 'Características del servicio:
• YouTube Premium sin anuncios
• Reproducción en segundo plano
• Descargas para ver sin conexión
• YouTube Music Premium incluido
• Activación a tu correo personal

Instrucciones:
1. Después de comprar, envíanos tu correo de YouTube
2. Activamos Premium en tu cuenta
3. Recibes confirmación inmediata'
WHERE id = '7ccb9c0c-0f40-4846-b9b3-5f75b374c581' AND details IS NULL;

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  image_url text,
  watermark text NOT NULL DEFAULT '@ofel_irirafael',
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_testimonials" ON testimonials;
CREATE POLICY "anon_read_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
CREATE POLICY "auth_insert_testimonials" ON testimonials FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials" ON testimonials FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials" ON testimonials FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_service_name ON products(service_name);
