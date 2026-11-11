# Supabase setup

1. Create your dedicated demo Auth user in Supabase Dashboard → Authentication → Users. Set its password there. The frontend only signs in; it never creates users or stores an admin/service-role key.
2. Copy `.env.example` to `.env.local`, then set the project URL and publishable/anon key.
3. Run `001_sentinel_schema.sql` in the SQL Editor.
4. Restart Vite and sign in. The `bootstrap_sentinel_workspace()` RPC creates an owner-only workspace. The frontend seeds sample data in `sentinel_demo_state` on the first sign-in.

The `sentinel_demo_state` table stores the sample arrays in JSONB for the portfolio prototype. The SQL policies restrict access to workspace members.
