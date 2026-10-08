/*
# Lock down privileged functions

Supabase's default privileges automatically grant EXECUTE on new public
functions to the anon and authenticated roles, so a plain REVOKE FROM public
was not enough. This migration explicitly removes anon/authenticated access
from the internal helpers so only edge functions (service role) and, for
admin stats, the signed-in admin can call them.

1. Changes
   - `bump_rate_limit`: EXECUTE revoked from anon, authenticated and public.
     Only the service role (edge functions) may call it.
   - `get_admin_stats`: EXECUTE revoked from anon; kept for authenticated (admin).
   - `get_public_visit_count`: unchanged; intentionally callable by anon because
     it only returns an aggregate count and only when the public counter is on.

2. Security
   - Anonymous visitors can no longer read admin statistics or manipulate the
     rate-limit counters directly.
*/

REVOKE EXECUTE ON FUNCTION bump_rate_limit(text, integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION bump_rate_limit(text, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION get_admin_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated, service_role;
