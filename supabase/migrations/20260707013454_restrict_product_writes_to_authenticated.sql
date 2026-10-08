/*
# Restrict product write policies to authenticated users only

1. Security Changes
  - Keep SELECT open to anon + authenticated (products must be publicly visible)
  - Restrict INSERT to authenticated only
  - Restrict UPDATE to authenticated only
  - Restrict DELETE to authenticated only

2. Important Notes
  - This prevents anonymous/unauthenticated users from modifying product data
  - The store frontend still reads products via the anon key (SELECT policy unchanged)
  - Admin operations require a signed-in Supabase session
*/

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "authenticated_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "authenticated_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "authenticated_delete_products" ON products FOR DELETE
  TO authenticated USING (true);
