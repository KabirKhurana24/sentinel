# Build and integration status

## Implemented

- Rebranded the React application as **Sentinel — AI Identity & Governance**.
- Added email/password sign-in using Supabase Auth.
- Added local-only prefill for the supplied demo login. The password is enabled only in Vite development mode and is not shipped in the production bundle.
- Added workspace bootstrap RPC and Row Level Security policies.
- Added per-user workspace persistence for inventory, access reviews, and audit events.
- Expanded the fictional dataset to 20 identities, 7 access-review assignments, and 8 initial activity events.
- Kept a no-backend local demo mode with browser persistence.

## Not yet connected / verified

- The Supabase project URL and publishable/anon key were not provided, so the working copy is not connected to a live Supabase project yet.
- The Auth user must exist in the Supabase project's Authentication → Users dashboard. The frontend does not create Auth users.
- npm dependency installation timed out in this environment. The production build and browser QA could not be completed here. Run the commands below in an environment with npm registry access.

```bash
npm install
npm run build
npm run dev
```

Then configure Supabase according to [`../README.md`](../README.md) and test login, first-run seed, persistent updates, sign-out, and RLS isolation.
