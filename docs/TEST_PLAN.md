# QA & Demo Test Plan

## Test environment

- Browser: current Chrome, Edge, Firefox, Safari.
- Device widths: 1440px desktop, 1024px laptop, 768px tablet, 390px mobile.
- Data: seeded fictional identity inventory in `src/App.tsx`.
- Persistence: Supabase workspace JSONB snapshot when authenticated; browser local storage in local demo mode.

## Core functional checks

| ID | Scenario | Expected result |
|---|---|---|
| T-01 | Open Overview | Metrics and risk distribution are populated from sample data |
| T-02 | Open inventory | Seeded identities are visible with owner, platform, status, and risk |
| T-03 | Search for `Deal Desk` | Matching identity is displayed |
| T-04 | Filter by Orphaned | Only identities with Departed or Unknown owners remain |
| T-05 | Filter by Critical risk | Only critical identities remain |
| T-06 | Open Deal Desk Copilot | Profile shows departed owner, Salesforce admin access, connected contract resources, and risk reasons |
| T-07 | Open remediation planner with no selections | Record action is disabled |
| T-08 | Select Reassign owner | Replacement-owner selector is displayed |
| T-09 | Record owner reassignment + remove admin | Local record changes, risk reduces, and an audit event is appended |
| T-10 | Create access review | New Pending review appears and audit event is appended |
| T-11 | Complete access review | Status becomes Completed; permissions remain unchanged |
| T-12 | Run offboarding scenario once | GitHub Release Orchestrator gets departed owner, new Critical signal, review, and audit event |
| T-13 | Run offboarding scenario twice | Duplicate scenario is prevented and an explanatory toast appears |
| T-14 | Export CSV | A CSV download includes the inventory fields |
| T-15 | Refresh after an action | Local demo state persists |
| T-16 | Clear local storage and reload | Original seed state returns |
| T-17 | Open Audit Trail | Events are newest-first and include target, actor, time, and detail |
| T-18 | Resize to mobile | Navigation collapses, panels stack, and drawer/modal fit viewport |
| T-19 | Open signed-out app | Sentinel sign-in screen appears with local demo email/password prefill in development only |
| T-20 | Choose local demo mode | 20 seeded identities, 7 reviews, and 8 activity events appear |
| T-21 | Sign in with Supabase | Authenticated user receives an isolated workspace through the bootstrap RPC |
| T-22 | First authenticated login | Workspace is seeded with the fictional sample inventory and review/event records |
| T-23 | Change a review or remediation in Supabase mode | Updated workspace snapshot is persisted in `sentinel_demo_state` |
| T-24 | Sign in as a second Auth user | Second user receives a different workspace and cannot read the first user’s state |

## Safety and trust checks

- Confirm the UI states that all data is fictional.
- Confirm every remediation control says or implies the action is simulated.
- Confirm there are no identity-provider integration credentials or API calls. Supabase Auth/data persistence is the only configured backend connection.
- Confirm the service-role key is never referenced by frontend source or environment variables.
- Confirm `.env.local` is excluded from source control and the shareable ZIP.
- Confirm the local-only password prefill is disabled in production builds.
- Confirm review completion does not itself revoke permissions.
- Confirm no identity is automatically suspended on offboarding simulation.
- Confirm data export uses only fictional seed data and local demo changes.

## Known limitations

This project is a portfolio prototype, not a production security control. The Supabase schema/RLS script still needs to be run against the target project, and authentication/isolation must be verified there. Manual visual and interaction testing should be completed after dependency installation and deployment.
