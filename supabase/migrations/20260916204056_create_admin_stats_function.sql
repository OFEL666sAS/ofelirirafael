/*
# Admin statistics function

Adds `get_admin_stats()`, a SECURITY DEFINER function that aggregates real
analytics and order metrics for the admin dashboard. It is granted ONLY to the
authenticated role (the admin), so anonymous visitors can never call it.

1. New function
   - `get_admin_stats()` returns a single JSON object with:
     - visits today / last 7 days / last 30 days (page views)
     - estimated unique visitors for the same windows
     - visitors active in the last 5 minutes
     - most viewed products and categories (last 30 days)
     - referral sources (last 30 days)
     - a per-day series for the last 30 days (views + unique visitors)
     - orders created, pending count, orders grouped by status
     - confirmed sales count and amount (orders marked paid or delivered)
     - the analytics start date

2. Security
   - EXECUTE revoked from public and granted only to `authenticated`.
   - No personal data (names, phones, notes) is included in the output.
*/

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_start timestamptz;
BEGIN
  SELECT analytics_start_date INTO v_start FROM app_config WHERE id = 1;
  result := jsonb_build_object(
    'analytics_start_date', v_start,
    'visits_today', (SELECT count(*) FROM analytics_events WHERE event_type='pageview' AND created_at >= date_trunc('day', now())),
    'visits_7d', (SELECT count(*) FROM analytics_events WHERE event_type='pageview' AND created_at >= now() - interval '7 days'),
    'visits_30d', (SELECT count(*) FROM analytics_events WHERE event_type='pageview' AND created_at >= now() - interval '30 days'),
    'unique_today', (SELECT count(DISTINCT visitor_id) FROM analytics_events WHERE created_at >= date_trunc('day', now())),
    'unique_7d', (SELECT count(DISTINCT visitor_id) FROM analytics_events WHERE created_at >= now() - interval '7 days'),
    'unique_30d', (SELECT count(DISTINCT visitor_id) FROM analytics_events WHERE created_at >= now() - interval '30 days'),
    'active_now', (SELECT count(DISTINCT visitor_id) FROM analytics_events WHERE created_at >= now() - interval '5 minutes'),
    'pageviews_total', (SELECT count(*) FROM analytics_events WHERE event_type='pageview'),
    'top_products', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT ae.product_id, COALESCE(p.name, 'Producto') AS name, count(*) AS views
        FROM analytics_events ae
        LEFT JOIN products p ON p.id = ae.product_id
        WHERE ae.event_type='product_view' AND ae.created_at >= now() - interval '30 days' AND ae.product_id IS NOT NULL
        GROUP BY ae.product_id, p.name
        ORDER BY views DESC LIMIT 8
      ) t
    ),
    'top_categories', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT category, count(*) AS views
        FROM analytics_events
        WHERE category IS NOT NULL AND created_at >= now() - interval '30 days'
        GROUP BY category ORDER BY views DESC LIMIT 8
      ) t
    ),
    'sources', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT COALESCE(referrer_source, 'directo') AS source, count(*) AS visits
        FROM analytics_events
        WHERE event_type='pageview' AND created_at >= now() - interval '30 days'
        GROUP BY referrer_source ORDER BY visits DESC LIMIT 8
      ) t
    ),
    'daily', (
      SELECT COALESCE(jsonb_agg(t ORDER BY t.day), '[]'::jsonb) FROM (
        SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
          (SELECT count(*) FROM analytics_events ae WHERE ae.event_type='pageview' AND ae.created_at >= d.day AND ae.created_at < d.day + interval '1 day') AS views,
          (SELECT count(DISTINCT ae.visitor_id) FROM analytics_events ae WHERE ae.created_at >= d.day AND ae.created_at < d.day + interval '1 day') AS uniques
        FROM generate_series(date_trunc('day', now()) - interval '29 days', date_trunc('day', now()), interval '1 day') AS d(day)
      ) t
    ),
    'orders_total', (SELECT count(*) FROM orders),
    'orders_pending', (SELECT count(*) FROM orders WHERE status='pending'),
    'orders_by_status', (
      SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb) FROM (
        SELECT status, count(*) cnt FROM orders GROUP BY status
      ) s
    ),
    'sales_confirmed_count', (SELECT count(*) FROM orders WHERE status IN ('paid','delivered')),
    'sales_confirmed_amount', (SELECT COALESCE(sum(total_price),0) FROM orders WHERE status IN ('paid','delivered'))
  );
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_admin_stats() FROM public;
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
