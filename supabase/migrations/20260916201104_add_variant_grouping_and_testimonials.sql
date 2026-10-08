/*
# Add variant grouping and testimonials gallery

## Purpose
1. Add `service_name` and `duration` columns to `products` to group different durations of the same service (e.g., Crunchyroll 3/6/12 months) as selectable variants.
2. Add `display_order` to control which variant appears first in a group.
3. Create `testimonials` table for the references gallery — admin-manageable screenshots of real deliveries and comments with @ofel_irirafael watermark.

## New columns on `products`
- `service_name` (text, nullable): the base service name without duration (e.g., "Crunchyroll Mega Fan"). Products with the same `service_name` are shown as variants of each other.
- `duration` (text, nullable): human-readable duration label (e.g., "3 meses", "1 mes", "12 meses").
- `display_order` (int, default 0): controls sort order within a variant group.

## New table: `testimonials`
- `id` (uuid, PK)
- `name` (text): customer name
- `rating` (int, 1-5, default 5)
- `comment` (text): testimonial text
- `image_url` (text, nullable): screenshot of delivery or comment
- `watermark` (text, default '@ofel_irirafael')
- `is_published` (boolean, default false)
- `sort_order` (int, default 0)
- `created_at` (timestamptz)

## Security
- `products`: already has RLS with existing policies — no changes needed.
- `testimonials`: enable RLS, allow public read (anon + authenticated), writes only for authenticated (admin).
*/
