# Product Brief — Sentinel — AI Identity & Governance

## Product concept

A focused workbench for Security and IT administrators to investigate risky AI agents and non-human identities, prepare a safe remediation plan, and preserve evidence of the decision.

**Positioning:** An independent concept prototype informed by CloudEagle.ai's public AI Agent Security and Non-Human Identity product material. It does not claim to be an official CloudEagle feature or a confirmed product gap.

## Target user

**Primary persona — Security Operations / Identity Governance Administrator**

- Owns access governance, risk investigation, or identity certification.
- Receives signals from identity providers, cloud platforms, app admin APIs, and employee lifecycle systems.
- Needs to resolve risk without disrupting business-critical automations.
- Must explain who approved a change, what changed, and why.

**Secondary persona — IT / Platform Owner**

- Understands the business purpose and technical dependencies of a service identity.
- Helps validate whether a permission is required and who should own an identity.

**Decision stakeholder — CISO / IT Director**

- Needs a defensible view of open risk, ownership gaps, remediation throughput, and evidence quality.

## User problem

An AI agent can outlive its creator, retain inherited credentials, or keep access that is broader than its current job. A flat identity inventory is not enough: an administrator needs a clear reason for a risk flag, contextual permission details, a safe action plan, and an auditable outcome.

## Jobs to be done

1. When an agent's owner leaves, help me identify every active agent associated with that person so I can prevent unmanaged access from persisting.
2. When an agent is flagged as overprivileged or dormant, help me understand the exact resource and permission involved so I can assess blast radius.
3. When I decide to reduce access, help me preview the proposed steps and the affected identity before any action is taken.
4. When a review is complete, help me retain the decision and supporting evidence for later audit.

## Product principles

- **Explainability before action:** every risk score must be accompanied by explicit reasons and source context.
- **Human control:** risky actions require an administrator decision; never silently suspend an agent.
- **Least privilege:** prefer the narrowest permission change that addresses the risk.
- **Reversibility and traceability:** preserve a record of what was proposed, approved, attempted, and completed.
- **Data minimisation:** show identity and resource metadata; avoid collecting prompt content or secrets unnecessarily.
- **Operational continuity:** identify likely dependencies before disabling a production identity.

## Core workflow

1. Discover an identity.
2. Correlate identity with owner, employment status, source, and application context.
3. Evaluate risk signals.
4. Open identity detail to inspect permissions, resources, credential, and activity.
5. Select one or more remediation steps.
6. Review impact and record an administrator decision.
7. Append a timestamped audit event.

## Prototype scope

### In scope

- Seeded synthetic agent and machine-identity inventory.
- Risk flags for departed/unknown owners, admin access, 90+ day inactivity, sensitive resources, and stale credentials.
- Overview metrics and a risk-priority queue.
- Identity detail drawer.
- Simulated remediations: assign owner, remove admin access, rotate credential, suspend agent.
- Access review creation and completion.
- Offboarding simulation.
- Audit event history and inventory CSV export.
- Local browser persistence.

### Out of scope

- Live Okta, Microsoft Entra ID, AWS IAM, Google Cloud, GitHub, or SaaS integrations.
- Real credential rotation, role revocation, deprovisioning, or agent shutdown.
- Production authentication, multi-tenancy, RBAC, policy engine, or backend persistence.
- Machine-learning risk scoring or LLM-generated recommendations.
- Real customer or employee data.

## Success metrics for a production discovery phase

These are proposed metrics for validating the concept, not measured results:

| Metric | Definition | Why it matters |
|---|---|---|
| Time to first useful investigation | Time from risk alert to opening an evidence-complete identity profile | Measures investigation friction |
| Risk-to-decision time | Time from flagged risk to recorded administrator decision | Measures operational throughput |
| Ownership coverage | Percentage of discovered identities with an active accountable owner | Measures ownership quality |
| Review completion rate | Completed reviews / assigned reviews within the period | Measures governance execution |
| Remediation recurrence | Reopened or repeated findings within 30 days | Measures quality of corrective action |
| False-positive rate | Admin-rejected risk flags / all reviewed flags | Measures signal quality |
| Disruption rate | Business-impact incidents attributable to remediation | Guardrail for safe operations |

## Assumptions to validate with customers

- Former-employee ownership and dormant access are frequent enough to justify a dedicated work queue.
- Security teams can identify an appropriate successor owner without lengthy manual coordination.
- The permission and resource context shown is enough to judge whether an agent should be narrowed or suspended.
- Reviewers prefer a contextual decision card over a separate ticket and manual evidence collection.
- Customers want remediation preview and approval steps to be configurable by environment and risk severity.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Incorrect owner correlation | Display source and confidence; allow manual confirmation; do not auto-transfer ownership |
| Permission removal breaks a workflow | Show affected resources and dependencies; require owner sign-off for production |
| Risk score creates false confidence | Explain each factor; expose thresholds; allow feedback and calibration |
| Duplicate discovery records | Correlate on stable identity IDs and provider references, not display names alone |
| Remediation API fails partway | Use idempotent actions, per-step status, retry policy, and compensating actions |
| Unauthorized administrator action | Enforce RBAC, dual approval, and immutable audit events in production |

## Why this work sample

The public APM listing calls out customer problem discovery, requirement writing, acceptance criteria, QA, analysis of usage/bugs/support, cross-functional execution, and personal product projects. The prototype is paired with a research record, product brief, PRD, and test plan to demonstrate those capabilities as one coherent work sample.

## Mapping to the public APM role

| Public role expectation | Evidence in this work sample |
|---|---|
| Understand customer problems | Customer-story synthesis and problem framing in `RESEARCH.md` |
| Translate needs into requirements | Target persona, JTBD, functional scope, assumptions in this brief |
| Write PRDs, user stories, and acceptance criteria | `PRD.md` with FR-01 to FR-08 and testable criteria |
| Work with Engineering and QA | Running React/TypeScript prototype and `TEST_PLAN.md` |
| Monitor product usage, feedback, and support issues | Proposed success metrics and validation questions |
| Create product documentation | README, research register, product brief, demo script, and deployment instructions |

The role listing is a public source and may change; this mapping reflects the listing reviewed on 11 November 2026.
