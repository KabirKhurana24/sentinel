# Product Requirements Document — Sentinel — AI Identity & Governance

**Version:** 1.0  
**Status:** Prototype scope  
**Primary user:** Security Operations / Identity Governance Administrator

## 1. Objective

Demonstrate how an administrator can investigate an AI agent or non-human identity risk, make an informed remediation decision, and preserve an audit record. The prototype uses fictional data, Supabase Auth/Postgres when configured, and a browser-local demo fallback when no project is configured.

## 2. Functional requirements

### FR-01 — Identity inventory

The system shall display a searchable inventory of AI agents, service accounts, and API tokens.

**Fields:** identity ID, name, type, platform, owner, owner status, team, environment, identity status, risk score, risk level, last activity, and permissions.

**Acceptance criteria**
- Given the inventory is loaded, when an administrator opens Agent Inventory, then all seeded identities are displayed.
- Given a search term, when it matches an identity name, ID, owner, team, or platform, then only matching rows are displayed.
- Given a selected status or risk filter, then the inventory reflects both the text search and selected filters.
- Given the export action, then a CSV containing the current inventory snapshot is downloaded.

### FR-02 — Risk signal generation and prioritisation

The system shall identify sample risks from ownership, privilege, activity, and resource context.

**Acceptance criteria**
- Departed or unknown owners are represented as ownership risks.
- Admin permissions are represented as privilege risks.
- Identities inactive for 90 or more days are represented as dormancy risks.
- Risk levels are visibly distinguished and the numeric score is accompanied by reasons.
- An administrator can filter the queue by ownership, privilege, or dormancy signal.

### FR-03 — Identity investigation

The system shall provide an identity profile containing ownership, discovery source, environment, credential type, last activity, scopes, connected resources, and risk context.

**Acceptance criteria**
- Clicking an identity row opens its profile.
- All granted scopes and connected resources are visible.
- Elevated scopes are visually distinguished.
- The profile explains why the identity is flagged.

### FR-04 — Remediation planning

The system shall allow the administrator to select one or more proposed remediation steps.

Supported prototype steps:
- Reassign owner.
- Remove admin access.
- Rotate credential.
- Suspend agent.

**Acceptance criteria**
- A remediation plan cannot be recorded with zero selected actions.
- An explicit administrator acknowledgement is required before the plan is recorded.
- Owner reassignment requires selection of an active replacement owner.
- The UI clearly states that actions are simulated and do not affect live systems.
- Recording a plan updates the local sample state and risk signals consistently.
- The audit trail records the selected actions, target identity, actor, and timestamp.

### FR-05 — Access reviews

The system shall allow an administrator to create an access certification task and mark it complete.

**Acceptance criteria**
- A review can be created for any identity in the sample inventory.
- A new review appears in the Pending view.
- Completing a review changes its status to Completed and records an audit event.
- Review completion alone does not automatically modify permissions.

### FR-06 — Employee offboarding scenario

The system shall provide a demo trigger that changes the owner status of a sample identity to Departed while leaving the identity itself active.

**Acceptance criteria**
- Running the scenario changes the selected identity owner status to Departed.
- The identity remains Active until a separate action is selected.
- A critical risk flag and access review task are created.
- A corresponding event is written to the audit trail.
- Running the same scenario again does not create duplicate events or reviews.

### FR-07 — Audit trail

The system shall append a chronological event after each simulated governance action.

**Acceptance criteria**
- Every event includes action, target, actor, time, detail, and event type.
- New events appear before older events.
- The Audit Trail view displays the complete current browser-session history.

### FR-08 — Local persistence and reset

The system shall persist the sample state in browser local storage.

**Acceptance criteria**
- Refreshing the page preserves simulated actions in the same browser.
- Clearing the site's local storage restores original seed data.
- No server-side persistence is implied.

## 3. Risk model used in the prototype

The UI uses seeded risk scores and simple illustrative factors. These numbers are not CloudEagle's proprietary risk model and must not be treated as a security standard.

| Risk factor | Suggested prototype weight | Rationale |
|---|---:|---|
| Owner departed | +30 | Identity may persist after creator leaves |
| Owner unknown/unassigned | +22 | No accountable person to validate purpose |
| Admin-level permission | +25 | Expanded potential impact |
| Dormant 90+ days | +18 | Stale identity may no longer be required |
| Sensitive resource access | +10 | Data exposure impact may be higher |
| Credential stale >180 days | +8 | Hygiene/control concern |

The demo records individual risk flags and a static starting score per sample identity; the weights above are explanatory guidance for how a production discovery phase could start. A future version should calibrate weights using customer data, incident history, reviewer feedback, and false-positive analysis.

## 4. Non-functional requirements

- Responsive layout for desktop and tablet; usable on mobile.
- No live external API dependency.
- No real secrets or personal data.
- Actions must be visibly labelled as simulated.
- No destructive action occurs without a human click.
- Clear empty states for zero-result filters.
- Browser local storage used only for prototype persistence.

## 5. Proposed production architecture (not implemented)

1. **Discovery connectors:** Entra ID, Okta, cloud IAM, app admin APIs, secrets managers, HRIS/employee lifecycle events.
2. **Identity normalisation service:** canonical machine identity record, owner correlation, source provenance, deduplication.
3. **Risk evaluation service:** explainable rules, policy thresholds, confidence, exception handling, reviewer feedback.
4. **Workflow orchestration:** approval routing, environment-sensitive guardrails, idempotent action execution, retry and compensation.
5. **Audit/evidence service:** append-only event store, actor attribution, evidence references, export for compliance.
6. **Frontend:** inventory, queue, details, approval, remediation, reporting.

## 6. Open questions for customer discovery

- Which systems are the most reliable source for agent owner and employee status?
- How should ownership confidence be represented when an agent is created by a team or shared account?
- Which permissions qualify as “high risk” by business context, not just provider role name?
- Should production shutdown require two-person approval, resource-owner approval, or both?
- What dependency evidence must be shown before an agent is suspended?
- How should customers handle an agent with no owner but a business-critical workflow?
- Which audit evidence must be retained, and for how long, for each customer segment?
