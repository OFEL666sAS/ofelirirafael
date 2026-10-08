/*
# Customers table for WhatsApp checkout

Replaces the order-creation flow with a lightweight, private customer registry.
When a buyer taps "Pedir por WhatsApp", the server saves only their name and
phone (normalized with country code) so the shop keeps a private client list.
No account, login, email or password is involved, and no order row is created.

1. New Tables
   - `customers`
     - `id` (uuid, primary key)
     - `name` (text, not null) — latest name the buyer used
     - `phone_country` (text, not null, default '+51') — dial code prefix
     - `phone` (text, not null) — local digits only
     - `phone_normalized` (text, unique, not null) — prefix + digits, used to
       deduplicate the same person by number
     - `times_contacted` (integer, not null, default 1) — how many times this
       number started a WhatsApp order
     - `created_at` / `updated_at` (timestamptz)

2. New Functions
   - `upsert_customer(p_name, p_country, p_phone, p_normalized)` — SECURITY
     DEFINER. Inserts a new customer or, if the normalized phone already exists,
     updates the name and increments `times_contacted`. Callable ONLY by the
     service role (edge function), never by anon/authenticated.

3. Security
   - RLS enabled on `customers`.
   - Only authenticated admins can read the list. There are NO anon/insert
     policies: writes happen exclusively through the service-role edge function,
     so visitors can never read or write the customer list directly.
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_country text NOT NULL DEFAULT '+51',
  phone text NOT NULL,
  phone_normalized text NOT NULL UNIQUE,
  times_contacted integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_customers" ON customers;
CREATE POLICY "admin_select_customers" ON customers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
CREATE POLICY "admin_delete_customers" ON customers FOR DELETE
  TO authenticated USING (true);

CREATE OR REPLACE FUNCTION upsert_customer(
  p_name text,
  p_country text,
  p_phone text,
  p_normalized text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO customers (name, phone_country, phone, phone_normalized)
  VALUES (p_name, p_country, p_phone, p_normalized)
  ON CONFLICT (phone_normalized) DO UPDATE
    SET name = EXCLUDED.name,
        phone_country = EXCLUDED.phone_country,
        phone = EXCLUDED.phone,
        times_contacted = customers.times_contacted + 1,
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION upsert_customer(text, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_customer(text, text, text, text) TO service_role;
