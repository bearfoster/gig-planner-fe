# Phased roadmap

## Delivery principles

- Deliver vertical business slices across database, backend, contract, client,
  UI, telemetry, and tests.
- Keep the existing member application usable during migration.
- Make tenant isolation, authorization, and OpenAPI freshness release gates.
- Extract shared code only after concrete use in both applications.
- Preserve modular-monolith boundaries without prematurely deploying
  microservices or a message broker.

## Phase 0 — Workspace and backend foundations

Outcomes:

- Convert the frontend into the agreed npm workspace.
- Move the existing Vite application to `apps/member-web` without behavior loss.
- Scaffold `apps/admin-web` with Next.js App Router and monochrome foundations.
- Establish the generated `packages/api-client` workflow.
- Split backend concerns toward Domain, Application, Infrastructure, Contracts,
  API, and Worker projects.
- Introduce tenant identity, capability-specific ports, transaction boundaries,
  OpenTelemetry foundations, and migration strategy.
- Preserve existing Sydney data through deterministic seed/migration tests.

Exit criteria:

- Both web applications and the API start from one root command.
- Existing member smoke journeys still pass.
- Backend-owned OpenAPI generates the frontend client reproducibly.
- CI builds every project and validates migration/client freshness.

## Phase 1 — First usable multi-tenant milestone

Vertical slices:

1. Development login with seeded and simple test personas.
2. Create tenant and atomically assign its first owner.
3. List/switch tenants with server-side per-application preference.
4. Tenant-scoped catalogue browsing through GUID routes.
5. Tenant admin Event/Participant/Place management in Next.js.
6. Invitations, matching-email acceptance, and tenant role management.
7. Named personal plans and favourites.
8. Remove the old embedded admin routes after Next.js parity tests pass.

Exit criteria:

- Two users in two tenants cannot observe or mutate one another's data across
  every shipped capability.
- Development SSO works across member and admin applications.
- The seeded Sydney tenant remains functional.
- Required unit, integration, component, Playwright, and isolation tests pass.

## Phase 2 — Generic catalogue and collaboration

Vertical slices:

- Event publication/lifecycle/availability workflows and terminal archival.
- Tenant-managed categories and free-form tags.
- Typed custom-field definitions, values, archival, and configured filters.
- Collaborative plans with viewer/editor grants, ordering, notes, transfer, and
  optimistic concurrency.
- Member departure and account-deletion safeguards for plans and ownership.
- Black-and-white member/admin UI completion for these capabilities.

Exit criteria:

- A non-gig tenant can model and filter its event catalogue without code
  changes.
- Conflicting plan edits return explicit conflicts without lost updates.
- Departures cannot orphan a tenant or shared plan.

## Phase 3 — Platform administration and operations

Vertical slices:

- Platform tenant/user inspection without impersonation.
- Tenant suspension/unsuspension and private reason handling.
- Recoverable tenant deletion (30 days) and account deletion (14 days).
- Transactional outbox, local in-process worker mode, and separate Worker host.
- Invitation email retry/replay workflow.
- Three-month audit retention and structured security-event logging.
- Owner-triggered tenant exports through `IExportStorage`, expiring after 24
  hours.
- Operational health, metrics, traces, and job monitoring.

Exit criteria:

- Delayed jobs tolerate retries and duplicate execution.
- Destructive workflows are recoverable, confirmed, and audited.
- Suspension closes interactive and integration access immediately.
- Worker deployment can scale separately from the API.

## Phase 4 — External integration API and proposal review

Vertical slices:

- Tenant integration service accounts and hashed API-key lifecycle.
- Read/proposal scopes, expiry, rotation, revocation, and rate limits.
- Thirty-day idempotency handling for integration writes.
- Proposal creation/update with required provenance.
- Deterministic duplicate candidate detection.
- Next.js holistic review/edit/approve/reject workflow.
- Published-version preservation and optimistic approval concurrency.

Exit criteria:

- Integration credentials cannot publish, approve, change schema, administer
  members, or cross tenant boundaries.
- Retried writes do not duplicate proposals.
- Human approval atomically publishes a complete reviewed result.

## Phase 5 — MCP adapter

Vertical slices:

- Create the separately deployable .NET MCP service.
- Implement list-tenant, schema-read, catalogue search/read, event-propose,
  update-propose, and proposal-status tools.
- Map MCP errors, pagination, correlation, and idempotency to stable API
  behavior.
- Add MCP/API traces, rate-limit behavior, and end-to-end security tests.

Exit criteria:

- MCP has no database dependency or privileged bypass.
- The same service-account scopes and approval workflow govern every MCP write.
- An AI client can propose sourced content and observe status without being able
  to publish it.

## Phase 6 — Production-provider hardening

Outcomes:

- Add PostgreSQL migrations and integration coverage.
- Select and integrate a standards-compatible production identity provider.
- Finalize session threat model, refresh/logout behavior, and CSRF controls.
- Select email, telemetry, and object-storage providers when deployment needs
  require them.
- Add containerization only when a deployment target benefits from it.
- Reassess accessibility, responsive design, service extraction, and broker
  adoption using real usage and operational evidence.

This phase is not permission to postpone secure defaults, observability, or
tenant isolation in earlier phases; it replaces development adapters with
production-grade providers.
