/*
# Orders, Analytics, App Config, and Security Foundations

Adds server-backed persistence for guest orders, real visit analytics, a single
app-configuration row, and rate limiting. All privileged access (creating orders,
recording visits, guest order lookup, admin statistics) is mediated by edge
functions using the service role. Anonymous website visitors can NOT read orders,
customer phones, notes, or analytics rows directly.

1. New Tables
   - `orders`
     - `id` (uuid, pk)
     - `public_token` (text, unique) unpredictable token for a private guest lookup link
     - `status` (text, default 'pending') one of pending/paid/delivered/cancelled
     - `customer_name` (text)
     - `phone_country` (text, default '+51') dial prefix
     - `customer_phone` (text)
     - `note` (text, nullable)
     - `product_id` (uuid, references products)
     - `product_name` (text) snapshot of product name at purchase time
     - `category` (text, nullable)
     - `quantity` (int) validated > 0
     - `unit_price` (numeric) computed server-side from the stored catalog
     - `total_price` (numeric) computed server-side
     - `currency` (text, default 'PEN')
     - `ff_player_id` (text, nullable) Free Fire player id
     - `ff_nickname` (text, nullable) confirmed Free Fire nickname
     - `idempotency_key` (text, unique, nullable) prevents duplicate submissions
     - `created_at`, `updated_at` (timestamptz)
   - `analytics_events`
     - `id` (bigint identity, pk)
     - `event_type` (text) pageview/product_view/category_view
     - `path` (text, nullable)
     - `product_id` (uuid, nullable)
     - `category` (text, nullable)
     - `referrer_source` (text, nullable) hostname of the referrer, when available
     - `visitor_id` (text, nullable) anonymous random id from the browser, NOT personal data
     - `session_id` (text, nullable) anonymous session id
     - `created_at` (timestamptz)
   - `app_config` (single row, id = 1)
     - `analytics_start_date` (timestamptz, default now()) the moment counting began
     - `public_counter_enabled` (boolean, default false) whether to show a public aggregate counter
     - `updated_at` (timestamptz)
   - `rate_limits`
     - `key` (text, pk) e.g. "order:1.2.3.4"
     - `window_start` (timestamptz)
     - `count` (int)

2. Modified Tables
   - `products`: the public SELECT policy is tightened so anonymous visitors only
     see published and active products; the admin (authenticated) still sees all.

3. Security
   - RLS enabled on every new table.
   - `orders` and `analytics_events` have NO anonymous policies; only the
     authenticated admin can read them, and only the admin can update order status.
     Guests reach their own order only through the token-based edge function.
   - `app_config` is readable by everyone (only the boolean toggle and start date),
     writable only by the authenticated admin.
   - Helper functions:
     - `bump_rate_limit(key, window_seconds)` records and returns the request count
       inside a sliding window (used by edge functions).
     - `get_public_visit_count()` returns the aggregate visit count only when the
       public counter is enabled, otherwise NULL (callable by anonymous visitors).

4. Important Notes
   1. No fake data is inserted; counting starts from this migration via
      `app_config.analytics_start_date`.
   2. Order totals are never trusted from the browser; they are recomputed by the
      create-order edge function from the stored catalog.
*/

-- ORDERS ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','delivered','cancelled')),
  customer_name text NOT NULL,
  phone_country text NOT NULL DEFAULT '+51',
  customer_phone text NOT NULL,
  note text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  category text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'PEN',
  ff_player_id text,
  ff_nickname text,
  idempotency_key text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- ANALYTICS ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('pageview','product_view','category_view')),
  path text,
  product_id uuid,
  category text,
  referrer_source text,
  visitor_id text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_visitor_idx ON analytics_events(visitor_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_analytics" ON analytics_events;
CREATE POLICY "admin_select_analytics" ON analytics_events FOR SELECT
  TO authenticated USING (true);

-- APP CONFIG -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  analytics_start_date timestamptz NOT NULL DEFAULT now(),
  public_counter_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_config" ON app_config;
CREATE POLICY "public_read_config" ON app_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_config" ON app_config;
CREATE POLICY "admin_update_config" ON app_config FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- RATE LIMITS ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (edge functions) may touch this table.

CREATE OR REPLACE FUNCTION bump_rate_limit(p_key text, p_window_seconds integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c integer;
BEGIN
  INSERT INTO rate_limits (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE
    SET count = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => p_window_seconds) THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => p_window_seconds) THEN now()
          ELSE rate_limits.window_start
        END
  RETURNING count INTO c;
  RETURN c;
END;
$$;

-- PUBLIC AGGREGATE COUNTER ---------------------------------------------------
CREATE OR REPLACE FUNCTION get_public_visit_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  enabled boolean;
  total bigint;
BEGIN
  SELECT public_counter_enabled INTO enabled FROM app_config WHERE id = 1;
  IF NOT COALESCE(enabled, false) THEN
    RETURN NULL;
  END IF;
  SELECT count(*) INTO total FROM analytics_events WHERE event_type = 'pageview';
  RETURN total;
END;
$$;

REVOKE ALL ON FUNCTION get_public_visit_count() FROM public;
GRANT EXECUTE ON FUNCTION get_public_visit_count() TO anon, authenticated;

-- TIGHTEN PRODUCT VISIBILITY -------------------------------------------------
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon USING (is_published = true AND is_active = true);

DROP POLICY IF EXISTS "authenticated_select_products" ON products;
CREATE POLICY "authenticated_select_products" ON products FOR SELECT
  TO authenticated USING (true);
