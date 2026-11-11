# Sentinel — AI Identity & Governance

**An independent portfolio prototype inspired by CloudEagle.ai’s public AI-agent governance and non-human identity workflows.**

> Sentinel is not a CloudEagle.ai product, integration, customer environment, or representation of its internal roadmap. All organizations, employees, identities, activity, permissions, events, review assignments, and metrics are fictional. Remediation is simulated and never changes a connected identity provider.

## Product concept

Sentinel helps a security or IT administrator discover AI agents and machine identities, investigate ownership and permission risks, assign access reviews, and record human-approved remediation decisions.

### Included product workflows

- **Identity inventory:** 20 fictional AI agents, service accounts, and API tokens across cloud, SaaS, browser, and internal discovery sources.
- **Risk triage:** departed or unknown owners, excessive privileges, dormant identities, shadow AI, and sensitive-data access.
- **Identity profile:** owner, team, platform, environment, credential type, last activity, connected resources, permissions, and risk context.
- **Remediation planning:** owner reassignment, admin-permission removal, credential-rotation request, and suspension preview. Actions require explicit approval and remain simulated.
- **Access certification:** create review assignments and complete a review without implicitly changing permissions.
- **Audit trail:** seeded governance events plus records created during the demo.
- **Demo scenarios:** former-employee offboarding, inventory CSV export, and resettable sample data.

## Authentication and data persistence

Sentinel supports two modes:

1. **Supabase mode:** email/password authentication through Supabase Auth. Each authenticated user receives an isolated Northstar Systems demo workspace. The inventory, reviews, and events are loaded from and saved to Supabase.
2. **Local demo mode:** works without a Supabase project. It uses the same seeded dataset and saves changes in browser `localStorage`.

The Supabase client uses only the project URL and publishable/anon key in the browser. Never put the `service_role` key in a `VITE_` variable, frontend file, or public repository.

### Configure Supabase

1. Create a Supabase project.
2. In **Authentication → Users**, create a dedicated demo user with the email/password you intend to use for this demo. Email confirmation must be completed (or disabled for this isolated demo project). The code does not create Auth users automatically.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.
4. Run [`supabase/001_sentinel_schema.sql`](supabase/001_sentinel_schema.sql) in the Supabase SQL Editor. It creates the workspace/state schema, bootstrap function, and Row Level Security policies.
5. Restart the Vite dev server. Sign in; the app creates a private workspace and automatically seeds the 20 identities, review assignments, and activity events on first login.

A local-only prefill is already set up in `.env.local` in the working copy. **That file is gitignored and deliberately excluded from the shareable ZIP.** Confirm that the same demo user/password exists in your own Supabase Auth project. The password prefill is only enabled in Vite development mode and is not included in production builds.

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | For cloud auth | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For cloud auth | Supabase publishable/anon key (safe for browser use with RLS) |
| `VITE_LOCAL_PREFILL_EMAIL` | Optional | Local development login-field prefill |
| `VITE_LOCAL_PREFILL_PASSWORD` | Optional, dev only | Local development password-field prefill; never set on a public deployment |

If Supabase variables are absent, the sign-in screen still lets you open the local sample workspace.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
cp .env.example .env.local
# Fill in the Supabase URL and publishable/anon key if using cloud auth
npm install
npm run dev
```

Create a production bundle with:

```bash
npm run build
npm run preview
```

## Deploy and share

1. Push the project to a GitHub repository. `.env.local` is excluded by `.gitignore`.
2. Import the repository into Vercel. Use the Vite preset, `npm run build`, and `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables. Do not add `VITE_LOCAL_PREFILL_PASSWORD`.
4. Deploy. The demo login form will ask the visitor for their own valid demo account credentials; do not publish the owner password.

For a shareable recruiter demo, create a dedicated, limited Supabase Auth user for reviewers or use local demo mode. Avoid distributing a shared personal account password.

## Product documentation

- [`docs/RESEARCH.md`](docs/RESEARCH.md) — CloudEagle product/market research and references.
- [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) — persona, problem, concept, principles, and metrics.
- [`docs/PRD.md`](docs/PRD.md) — requirements and acceptance criteria.
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — guided product walkthrough.
- [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) — test scenarios.
- [`supabase/001_sentinel_schema.sql`](supabase/001_sentinel_schema.sql) — Supabase schema, bootstrap RPC, and RLS.

## Tech stack

- React 18 + TypeScript + Vite
- Supabase Auth + Postgres JSONB workspace snapshot + RLS
- Lucide icons and responsive CSS
- Browser `localStorage` in local demo mode

## Known prototype limitations

- Risk scores and thresholds are illustrative and are not CloudEagle scoring logic or a security standard.
- Discovery sources are labels in sample records, not functioning connectors.
- Remediation and access review actions update sample state only; they do not revoke permissions, rotate real credentials, or suspend real identities.
- The Supabase state is stored as one JSONB snapshot per workspace to keep this portfolio prototype simple. A production system should use normalized identity, permission, review, and append-only audit-event tables with finer-grained authorization.
- The production build and live Supabase connection must be tested against the user's Supabase project after the URL/key are configured.

## Demo story

Start with **Deal Desk Copilot**: a former employee's agent is still active and retains Salesforce administration plus access to contract data. Inspect its profile, plan reassignment and permission removal, approve the simulated changes, and then inspect the audit trail. Also inspect the Terraform Cloud Provisioner for broad cloud privileges and the Browser Meeting Summarizer for broad OAuth scopes.
