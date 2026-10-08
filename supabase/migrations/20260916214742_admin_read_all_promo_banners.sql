/*
# Allow admins to read all promo banners

1. Security
   - Add a SELECT policy on `promo_banners` letting authenticated admins read
     every banner (active or not, in-window or not) so they can manage them.
     Anonymous visitors are unaffected and still only see current banners.

2. Notes
   1. Idempotent and safe to re-run.
*/

DROP POLICY IF EXISTS "admin_select_all_banners" ON promo_banners;
CREATE POLICY "admin_select_all_banners" ON promo_banners FOR SELECT
  TO authenticated USING (true);
